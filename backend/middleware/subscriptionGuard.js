import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Bill } from '../models/Bill.js';
import { getDbStatus } from '../config/db.js';
import { getInMemoryProducts } from '../controllers/productController.js';
import { getInMemoryBills } from '../controllers/billController.js';

export const PLAN_TIER_CONFIG = {
  free: {
    tier: 'free',
    label: 'Community / Free Tier',
    monthlyPrice: 0,
    limits: { maxUsers: 3, maxSkus: 50, maxInvoicesPerMonth: 25, maxBusinesses: 1 },
    allowedVerticals: ['shop', 'software'],
    maxBusinesses: 1,
    enabledModules: ['dashboard', 'bills', 'sales'],
  },
  starter: {
    tier: 'starter',
    label: 'Standard Starter Tier',
    monthlyPrice: 79,
    limits: { maxUsers: 10, maxSkus: 1000, maxInvoicesPerMonth: 500, maxBusinesses: 1 },
    allowedVerticals: ['shop', 'factory', 'industry', 'software', 'ecommerce'],
    maxBusinesses: 1,
    enabledModules: ['dashboard', 'bills', 'sales', 'products', 'customers', 'stock'],
  },
  growth: {
    tier: 'growth',
    label: 'Scale & Growth Tier',
    monthlyPrice: 199,
    limits: { maxUsers: 25, maxSkus: 5000, maxInvoicesPerMonth: 2500, maxBusinesses: 3 },
    allowedVerticals: ['shop', 'factory', 'industry', 'software', 'ecommerce'],
    maxBusinesses: 3,
    enabledModules: ['dashboard', 'bills', 'sales', 'products', 'customers', 'stock', 'revenue'],
  },
  enterprise: {
    tier: 'enterprise',
    label: 'Enterprise Sovereign Tier',
    monthlyPrice: 599,
    limits: { maxUsers: 100, maxSkus: 50000, maxInvoicesPerMonth: 20000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
    maxBusinesses: 99,
    enabledModules: ['dashboard', 'bills', 'sales', 'products', 'customers', 'stock', 'revenue', 'gl_ledger', 'superadmin'],
  },
};

/**
 * Check if a vertical is permitted for a tenant under their current subscription plan
 */
export const checkVerticalAccess = (planTier, vertical) => {
  const plan = PLAN_TIER_CONFIG[planTier] || PLAN_TIER_CONFIG.starter;
  
  if (vertical === 'all' && planTier !== 'enterprise') {
    return {
      allowed: false,
      code: 'UNIVERSAL_REQUIRES_ENTERPRISE',
      message: `Universal Multi-Vertical mode requires an Enterprise subscription. Current tier is '${plan.label}'.`,
      requiredTier: 'enterprise',
      maxBusinesses: plan.maxBusinesses,
    };
  }

  const isAllowed = plan.allowedVerticals.includes(vertical);
  if (!isAllowed) {
    return {
      allowed: false,
      code: 'VERTICAL_LOCKED_SUBSCRIPTION',
      message: `Vertical '${vertical}' is locked under your '${plan.label}' subscription (allows maximum ${plan.maxBusinesses} business).`,
      requiredTier: plan.maxBusinesses === 1 ? 'growth' : 'enterprise',
      maxBusinesses: plan.maxBusinesses,
    };
  }

  return {
    allowed: true,
    code: 'ACCESS_GRANTED',
    maxBusinesses: plan.maxBusinesses,
  };
};

/**
 * Middleware: Enforces Resource Quotas (max users, max SKUs, max monthly invoices)
 */
export const enforceQuota = (resourceType) => {
  return async (req, res, next) => {
    // Superadmin bypasses quotas
    if (req.user?.role === 'superadmin') {
      return next();
    }

    const tenant = req.tenant;
    if (!tenant) return next();

    const tenantId = req.tenantId || tenant.id || tenant._id;
    const limits = tenant.limits || PLAN_TIER_CONFIG[tenant.planTier]?.limits || PLAN_TIER_CONFIG.starter.limits;

    if (resourceType === 'skus') {
      let currentSkuCount = 0;
      if (getDbStatus().connected) {
        currentSkuCount = await Product.countDocuments({ tenantId });
      } else {
        currentSkuCount = getInMemoryProducts().filter((p) => p.tenantId === tenantId).length;
      }

      if (currentSkuCount >= limits.maxSkus) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXCEEDED_SKUS',
          message: `Product quota exceeded. Plan tier '${tenant.planTier}' allows maximum ${limits.maxSkus} SKUs. Current: ${currentSkuCount}. Please upgrade subscription.`,
          quota: {
            resource: 'skus',
            current: currentSkuCount,
            maxAllowed: limits.maxSkus,
            planTier: tenant.planTier,
          },
        });
      }
    }

    if (resourceType === 'invoices') {
      let currentInvoiceCount = 0;
      if (getDbStatus().connected) {
        currentInvoiceCount = await Bill.countDocuments({ tenantId });
      } else {
        currentInvoiceCount = getInMemoryBills().filter((b) => b.tenantId === tenantId).length;
      }

      if (currentInvoiceCount >= limits.maxInvoicesPerMonth) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXCEEDED_INVOICES',
          message: `Monthly billing quota exceeded. Plan tier '${tenant.planTier}' allows maximum ${limits.maxInvoicesPerMonth} invoices per month. Please upgrade subscription.`,
          quota: {
            resource: 'invoices',
            current: currentInvoiceCount,
            maxAllowed: limits.maxInvoicesPerMonth,
            planTier: tenant.planTier,
          },
        });
      }
    }

    next();
  };
};

/**
 * Middleware: Enforces module feature availability based on tenant plan
 */
export const enforceModuleAccess = (moduleName) => {
  return (req, res, next) => {
    if (req.user?.role === 'superadmin') {
      return next();
    }

    const tenant = req.tenant;
    if (!tenant) return next();

    const enabled = tenant.settings?.enabledModules || PLAN_TIER_CONFIG[tenant.planTier]?.enabledModules || [];
    if (!enabled.includes(moduleName)) {
      return res.status(403).json({
        success: false,
        code: 'FEATURE_MODULE_LOCKED',
        message: `Module '${moduleName}' is locked for tenant '${tenant.name}' under '${tenant.planTier}' tier. Upgrade required.`,
        requiredModule: moduleName,
        tenantPlan: tenant.planTier,
      });
    }

    next();
  };
};
