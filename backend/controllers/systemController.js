import { redisService } from '../config/redis.js';
import { getDbStatus } from '../config/db.js';
import { runSeed } from '../data/seedRunner.js';
import { User } from '../models/User.js';
import { Tenant } from '../models/Tenant.js';
import { Product } from '../models/Product.js';
import { Bill } from '../models/Bill.js';
import { Sale } from '../models/Sale.js';
import { demoUsers } from './authController.js';
import {
  DEFAULT_TENANTS,
  getInMemoryTenants,
  updateInMemoryTenant,
} from '../middleware/tenantMiddleware.js';
import { PLAN_TIER_CONFIG, checkVerticalAccess } from '../middleware/subscriptionGuard.js';
import { provisionNewTenantWithData } from '../services/tenantProvisioningService.js';
import { getInMemoryProducts } from './productController.js';
import { getInMemoryBills } from './billController.js';
import { getInMemorySales } from './saleController.js';

let systemUsers = [...demoUsers];

/**
 * Consolidated System & Redis Telemetry
 */
export const getSystemStatus = async (req, res) => {
  try {
    const redisStatus = redisService.getStatus();
    const dbStatus = getDbStatus();

    const mem = process.memoryUsage();
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memoryHeapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      memoryRss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
    };

    const tenants = getDbStatus().connected ? await Tenant.find() : getInMemoryTenants();

    return res.json({
      success: true,
      data: {
        database: dbStatus,
        redis: redisStatus,
        system: systemMetrics,
        tenantsCount: tenants.length,
        tenantsSummary: tenants.map((t) => ({
          id: t.id || t._id,
          name: t.name,
          slug: t.slug,
          vertical: t.vertical,
          status: t.status,
          planTier: t.planTier,
        })),
        verticals: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Super Admin Governance: Detailed Tenant Directory with Live Resource Quotas
 */
export const getSystemTenants = async (req, res) => {
  try {
    let tenants = [];
    if (getDbStatus().connected) {
      tenants = await Tenant.find().sort({ createdAt: -1 });
    }
    if (tenants.length === 0) {
      tenants = getInMemoryTenants();
    }

    // Attach live resource consumption per tenant
    const detailedTenants = await Promise.all(
      tenants.map(async (t) => {
        const tenantId = (t.id || t._id).toString();
        let skusCount = 0;
        let billsCount = 0;
        let salesCount = 0;

        if (getDbStatus().connected) {
          try {
            [skusCount, billsCount, salesCount] = await Promise.all([
              Product.countDocuments({ tenantId }),
              Bill.countDocuments({ tenantId }),
              Sale.countDocuments({ tenantId }),
            ]);
          } catch {}
        } else {
          skusCount = getInMemoryProducts().filter((p) => p.tenantId === tenantId).length;
          billsCount = getInMemoryBills().filter((b) => b.tenantId === tenantId).length;
          salesCount = getInMemorySales().filter((s) => s.tenantId === tenantId).length;
        }

        const planConfig = PLAN_TIER_CONFIG[t.planTier] || PLAN_TIER_CONFIG.starter;
        const limits = t.limits || planConfig.limits;
        const maxBusinesses = limits.maxBusinesses || planConfig.maxBusinesses || 1;
        const allowedVerticals = t.allowedVerticals || planConfig.allowedVerticals || ['shop', 'software'];

        return {
          id: tenantId,
          name: t.name,
          slug: t.slug,
          vertical: t.vertical,
          status: t.status,
          planTier: t.planTier,
          currency: t.currency || 'USD',
          limits,
          maxBusinesses,
          allowedVerticals,
          usage: {
            skusCount,
            skuQuotaPercent: limits.maxSkus > 0 ? Number(((skusCount / limits.maxSkus) * 100).toFixed(1)) : 0,
            billsCount,
            invoiceQuotaPercent: limits.maxInvoicesPerMonth > 0 ? Number(((billsCount / limits.maxInvoicesPerMonth) * 100).toFixed(1)) : 0,
            salesCount,
          },
          settings: t.settings,
        };
      })
    );

    return res.json({
      success: true,
      count: detailedTenants.length,
      data: detailedTenants,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Super Admin Governance: Lock or Unlock Tenant Account
 */
export const updateTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'trial', 'past_due', 'suspended', 'locked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: [${validStatuses.join(', ')}]`,
      });
    }

    let updated = null;
    if (getDbStatus().connected) {
      updated = await Tenant.findOneAndUpdate(
        { $or: [{ _id: id }, { slug: id }, { id }] },
        { status },
        { new: true }
      );
    }

    const memoryUpdated = updateInMemoryTenant(id, { status });
    if (!updated && memoryUpdated) updated = memoryUpdated;

    if (!updated) {
      return res.status(404).json({ success: false, message: `Tenant '${id}' not found` });
    }

    // Invalidate Redis cache
    await redisService.del('crm:system:tenants');
    await redisService.delByPattern(`crm:${id}:*`);

    return res.json({
      success: true,
      message: `Tenant '${updated.name}' account state transitioned to '${status.toUpperCase()}'. ${reason || ''}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Super Admin Governance: Upgrade or Downgrade Subscription Tier
 */
export const updateTenantPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planTier } = req.body;

    const planConfig = PLAN_TIER_CONFIG[planTier];
    if (!planConfig) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan tier. Allowed: [free, starter, growth, enterprise]`,
      });
    }

    // If downgrading from enterprise and currently on 'all', reset vertical to 'software'
    let currentVertical = undefined;
    if (planTier !== 'enterprise') {
      let existing = null;
      if (getDbStatus().connected) {
        existing = await Tenant.findOne({ $or: [{ _id: id }, { slug: id }, { id }] });
      }
      if (!existing) {
        existing = getInMemoryTenants().find((t) => t.id === id || t._id === id || t.slug === id);
      }
      if (existing && existing.vertical === 'all') {
        currentVertical = 'software';
      }
    }

    const updates = {
      planTier,
      limits: planConfig.limits,
      allowedVerticals: planConfig.allowedVerticals,
      'settings.enabledModules': planConfig.enabledModules,
      ...(currentVertical && { vertical: currentVertical }),
    };

    let updated = null;
    if (getDbStatus().connected) {
      updated = await Tenant.findOneAndUpdate(
        { $or: [{ _id: id }, { slug: id }, { id }] },
        { $set: updates },
        { new: true }
      );
    }

    const memoryUpdated = updateInMemoryTenant(id, {
      planTier,
      limits: planConfig.limits,
      allowedVerticals: planConfig.allowedVerticals,
      settings: { enabledModules: planConfig.enabledModules },
      ...(currentVertical && { vertical: currentVertical }),
    });
    if (!updated && memoryUpdated) updated = memoryUpdated;

    if (!updated) {
      return res.status(404).json({ success: false, message: `Tenant '${id}' not found` });
    }

    await redisService.del('crm:system:tenants');
    await redisService.delByPattern(`crm:${id}:*`);

    return res.json({
      success: true,
      message: `Tenant '${updated.name}' subscription updated to '${planTier.toUpperCase()}'. Max businesses allowed: ${planConfig.maxBusinesses}.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Super Admin Governance: Create New Business Tenant with Dedicated Starter Data
 */
export const createSystemTenant = async (req, res) => {
  try {
    const { name, vertical, planTier } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Business name is required' });
    }

    const provisioned = await provisionNewTenantWithData({
      name,
      vertical: vertical || 'software',
      planTier: planTier || 'starter',
    });

    return res.status(201).json({
      success: true,
      message: `Business organization '${name}' successfully created with dedicated starter data.`,
      data: provisioned.tenant,
      counts: provisioned.starterCounts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Super Admin Governance: Assign or Change Tenant Vertical & Organization Name
 */
export const updateTenantVertical = async (req, res) => {
  try {
    const { id } = req.params;
    const { vertical, name } = req.body;

    const validVerticals = ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'];
    if (vertical && !validVerticals.includes(vertical)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vertical. Allowed: [${validVerticals.join(', ')}]`,
      });
    }

    // Inspect existing tenant to check plan tier compatibility
    let existing = null;
    if (getDbStatus().connected) {
      existing = await Tenant.findOne({ $or: [{ _id: id }, { slug: id }, { id }] });
    }
    if (!existing) {
      existing = getInMemoryTenants().find((t) => t.id === id || t._id === id || t.slug === id);
    }

    if (!existing) {
      return res.status(404).json({ success: false, message: `Tenant '${id}' not found` });
    }

    // Enforce vertical locking according to subscription and number of businesses
    if (vertical) {
      const access = checkVerticalAccess(existing.planTier, vertical);
      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          code: access.code,
          message: access.message,
          requiredTier: access.requiredTier,
          maxBusinesses: access.maxBusinesses,
        });
      }
    }

    const updates = {};
    if (vertical) updates.vertical = vertical;
    if (name) updates.name = name;

    let updated = null;
    if (getDbStatus().connected) {
      updated = await Tenant.findOneAndUpdate(
        { $or: [{ _id: id }, { slug: id }, { id }] },
        { $set: updates },
        { new: true }
      );
    }

    const memoryUpdated = updateInMemoryTenant(id, updates);
    if (!updated && memoryUpdated) updated = memoryUpdated;

    if (!updated) {
      return res.status(404).json({ success: false, message: `Tenant '${id}' not found` });
    }

    await redisService.del('crm:system:tenants');
    await redisService.delByPattern(`crm:${id}:*`);

    return res.json({
      success: true,
      message: `Tenant '${updated.name}' assigned to operating vertical '${(vertical || updated.vertical).toUpperCase()}' successfully.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Redis Key Inspector
 */
export const getRedisKeys = async (req, res) => {
  try {
    const keys = await redisService.getKeyDetails();
    const status = redisService.getStatus();

    return res.json({
      success: true,
      count: keys.length,
      status,
      data: keys,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Flush Redis Cache (Global or Tenant-Scoped)
 */
export const flushRedisCache = async (req, res) => {
  try {
    const { pattern } = req.body || {};
    let cleared = 0;

    if (pattern) {
      cleared = await redisService.delByPattern(pattern);
    } else {
      cleared = await redisService.flushAll();
    }

    return res.json({
      success: true,
      message: pattern ? `Invalidated keys matching '${pattern}'` : 'Flushed entire Redis cache',
      clearedKeys: cleared,
      status: redisService.getStatus(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Master Seeder Trigger
 */
export const seedSystemData = async (req, res) => {
  try {
    const seedResults = await runSeed(true);
    return res.json({
      success: true,
      message: 'Master seeding executed successfully across all multi-tenant models and Redis cache',
      data: seedResults,
      redisStatus: redisService.getStatus(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Super Admin User Governance
 */
export const getSystemUsers = async (req, res) => {
  try {
    if (getDbStatus().connected) {
      const dbUsers = await User.find().select('-password');
      return res.json({ success: true, count: dbUsers.length, data: dbUsers });
    }
    return res.json({ success: true, count: systemUsers.length, data: systemUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Super Admin Update User Role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, companyType, tenantId } = req.body;

    const validRoles = ['superadmin', 'admin', 'manager', 'staff', 'auditor'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Allowed: ${validRoles.join(', ')}` });
    }

    const userIndex = systemUsers.findIndex((u) => u.id === userId || u._id === userId);
    let updatedUser = null;

    if (userIndex !== -1) {
      if (role) systemUsers[userIndex].role = role;
      if (companyType) systemUsers[userIndex].companyType = companyType;
      if (tenantId) systemUsers[userIndex].tenantId = tenantId;
      updatedUser = systemUsers[userIndex];
    }

    if (getDbStatus().connected) {
      const dbUser = await User.findByIdAndUpdate(
        userId,
        {
          ...(role && { role }),
          ...(companyType && { companyType }),
          ...(tenantId && { tenantId }),
        },
        { new: true }
      ).select('-password');
      if (dbUser) updatedUser = dbUser;
    }

    await redisService.del('crm:users:all');

    return res.json({
      success: true,
      message: `User permissions updated successfully to ${role || 'updated'}`,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
