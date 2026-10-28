import { Tenant } from '../models/Tenant.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import {
  DEFAULT_TENANTS,
  getInMemoryTenants,
  updateInMemoryTenant,
} from '../middleware/tenantMiddleware.js';

/**
 * List all available tenants/organizations in the platform
 */
export const getTenants = async (req, res) => {
  try {
    const cacheKey = 'crm:system:tenants';
    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res.json({ success: true, count: cached.length, data: cached, source: 'redis-cache' });
    }

    let tenants = [];
    if (getDbStatus().connected) {
      tenants = await Tenant.find().sort({ createdAt: -1 });
      if (tenants.length === 0) {
        tenants = getInMemoryTenants();
      }
    } else {
      tenants = getInMemoryTenants();
    }

    await redisService.set(cacheKey, tenants, 'EX', 1800);
    return res.json({ success: true, count: tenants.length, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single tenant by ID or slug
 */
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    let tenant = null;

    if (getDbStatus().connected) {
      tenant = await Tenant.findOne({ $or: [{ _id: id }, { slug: id }, { id }] });
    }

    if (!tenant) {
      tenant = getInMemoryTenants().find((t) => t.id === id || t._id === id || t.slug === id);
    }

    if (!tenant) {
      return res.status(404).json({ success: false, message: `Tenant '${id}' not found` });
    }

    return res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update tenant subscription plan, status (lockout/active), or settings
 */
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, planTier, currency, timezone, limits, settings } = req.body;

    const allowedStatuses = ['active', 'trial', 'past_due', 'suspended', 'locked'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: [${allowedStatuses.join(', ')}]`,
      });
    }

    const allowedPlans = ['free', 'starter', 'growth', 'enterprise'];
    if (planTier && !allowedPlans.includes(planTier)) {
      return res.status(400).json({
        success: false,
        message: `Invalid planTier. Allowed: [${allowedPlans.join(', ')}]`,
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (status) updates.status = status;
    if (planTier) updates.planTier = planTier;
    if (currency) updates.currency = currency;
    if (timezone) updates.timezone = timezone;
    if (limits) updates.limits = limits;
    if (settings) updates.settings = settings;

    let updated = null;

    if (getDbStatus().connected) {
      updated = await Tenant.findOneAndUpdate(
        { $or: [{ _id: id }, { slug: id }] },
        { $set: updates },
        { new: true }
      );
    }

    const memoryUpdated = updateInMemoryTenant(id, updates);
    if (!updated && memoryUpdated) {
      updated = memoryUpdated;
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: `Tenant '${id}' not found` });
    }

    // Invalidate tenant cache
    await redisService.del('crm:system:tenants');

    return res.json({
      success: true,
      message: `Tenant '${updated.name}' updated successfully. Status: ${updated.status}, Plan: ${updated.planTier}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new Tenant / Organization
 */
export const createTenant = async (req, res) => {
  try {
    const { name, slug, vertical, planTier, currency } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Tenant name and slug are required' });
    }

    const newTenant = {
      _id: `tenant-${Date.now()}`,
      id: `tenant-${Date.now()}`,
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      vertical: vertical || 'software',
      status: 'active',
      planTier: planTier || 'starter',
      currency: currency || 'USD',
      timezone: 'UTC',
      limits: { maxUsers: 15, maxSkus: 2000, maxInvoicesPerMonth: 1000 },
      settings: {
        enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'dashboard'],
      },
    };

    let created = null;
    if (getDbStatus().connected) {
      created = await Tenant.create(newTenant);
    } else {
      getInMemoryTenants().push(newTenant);
      created = newTenant;
    }

    await redisService.del('crm:system:tenants');

    return res.status(201).json({
      success: true,
      message: `Tenant '${created.name}' provisioned successfully`,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
