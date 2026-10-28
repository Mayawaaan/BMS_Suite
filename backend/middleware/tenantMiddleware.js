import { Tenant } from '../models/Tenant.js';
import { runInTenantContext } from '../plugins/tenantScopingPlugin.js';
import { getDbStatus } from '../config/db.js';
import { EXTENDED_TENANTS } from '../data/extendedBusinessData.js';

// Pre-configured multi-tenant organizations: Global Platform + Clean Retail Shop
export const DEFAULT_TENANTS = [
  {
    _id: 'tenant-universal',
    id: 'tenant-universal',
    name: 'ZSYIO Global BMS',
    slug: 'zsyio-universal',
    vertical: 'all',
    status: 'active',
    planTier: 'enterprise',
    currency: 'USD',
    timezone: 'UTC',
    limits: { maxUsers: 100, maxSkus: 50000, maxInvoicesPerMonth: 10000, maxBusinesses: 99 },
    allowedVerticals: ['all', 'shop'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'gl_ledger', 'dashboard', 'superadmin', 'payments'],
    },
  },
  {
    _id: 'tenant-retail',
    id: 'tenant-retail',
    name: 'ZSYIO Retail Store & POS',
    slug: 'zsyio-retail',
    vertical: 'shop',
    status: 'active',
    planTier: 'growth',
    currency: 'USD',
    timezone: 'America/New_York',
    limits: { maxUsers: 25, maxSkus: 5000, maxInvoicesPerMonth: 2000, maxBusinesses: 3 },
    allowedVerticals: ['shop'],
    settings: {
      enabledModules: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'dashboard', 'payments'],
    },
  },
];

// Helper to map businessType vertical strings to tenant IDs
export const VERTICAL_TO_TENANT_MAP = {
  all: 'tenant-universal',
  shop: 'tenant-retail',
};

// In-memory tenant registry for fallback resilience
let inMemoryTenants = [...DEFAULT_TENANTS];

/**
 * Resolves a tenant by ID, slug, or vertical
 */
export const findTenant = async (identifier) => {
  if (!identifier) return inMemoryTenants[0];

  // Try in-memory list first
  const memoryMatch = inMemoryTenants.find(
    (t) => t.id === identifier || t._id === identifier || t.slug === identifier || t.vertical === identifier
  );
  if (memoryMatch) return memoryMatch;

  // If DB connected, query MongoDB
  if (getDbStatus().connected) {
    try {
      const dbMatch = await Tenant.findOne({
        $or: [{ _id: identifier }, { slug: identifier }, { vertical: identifier }],
      });
      if (dbMatch) return dbMatch;
    } catch {
      // Return fallback
    }
  }

  // Fallback to universal tenant
  return inMemoryTenants[0];
};

/**
 * Core Multi-Tenancy Middleware
 * Extracts, validates, and scopes execution context to the tenant
 */
export const resolveTenant = async (req, res, next) => {
  try {
    // 1. Identify target tenant from headers, query params, or auth claims
    let rawTenantId =
      req.headers['x-tenant-id'] ||
      req.query.tenantId ||
      req.headers['x-tenant-slug'];

    // Map legacy or incoming businessType parameter (e.g. ?businessType=shop)
    const businessTypeParam = req.query.businessType || req.body?.businessType;
    if (!rawTenantId && businessTypeParam && VERTICAL_TO_TENANT_MAP[businessTypeParam]) {
      rawTenantId = VERTICAL_TO_TENANT_MAP[businessTypeParam];
    }

    // Fall back to user's registered tenantId
    if (!rawTenantId && req.user?.tenantId) {
      rawTenantId = req.user.tenantId;
    }

    // Default to universal tenant if none specified
    if (!rawTenantId) {
      rawTenantId = 'tenant-universal';
    }

    // 2. Resolve Tenant Record
    const tenant = await findTenant(rawTenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        code: 'TENANT_NOT_FOUND',
        message: `Tenant '${rawTenantId}' could not be resolved.`,
      });
    }

    // 3. Subscription Status & Lockout Guard
    // Superadmin bypasses subscription lockouts to perform administrative repairs
    const isSuperAdmin = req.user?.role === 'superadmin';

    if (!isSuperAdmin) {
      if (tenant.status === 'locked' || tenant.status === 'suspended') {
        return res.status(423).json({
          success: false,
          code: 'TENANT_ACCOUNT_LOCKED',
          message: `Tenant account '${tenant.name}' is currently ${tenant.status.toUpperCase()}. Please contact administration or update subscription billing.`,
          tenant: {
            id: tenant.id || tenant._id,
            name: tenant.name,
            status: tenant.status,
            planTier: tenant.planTier,
          },
        });
      }
    }

    // 4. Attach tenant context to Express request
    req.tenant = tenant;
    req.tenantId = (tenant.id || tenant._id).toString();

    // 5. Run downstream middleware & controllers inside AsyncLocalStorage tenant boundary
    runInTenantContext(req.tenantId, () => {
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'TENANT_RESOLUTION_ERROR',
      message: 'Failed to resolve tenant context',
      error: error.message,
    });
  }
};

/**
 * Enforces module availability based on Tenant's active plan and enabled modules
 * @param {string} moduleName Name of the module (e.g. 'bills', 'stock', 'gl_ledger')
 */
export const requireTenantModule = (moduleName) => {
  return (req, res, next) => {
    // Superadmin always has access
    if (req.user?.role === 'superadmin') {
      return next();
    }

    const enabledModules = req.tenant?.settings?.enabledModules || [];
    if (!enabledModules.includes(moduleName)) {
      return res.status(403).json({
        success: false,
        code: 'MODULE_NOT_ENTITLED',
        message: `Module '${moduleName}' is not enabled for tenant '${req.tenant?.name}' under plan tier '${req.tenant?.planTier}'. Upgrade subscription to unlock.`,
        requiredModule: moduleName,
        tenantTier: req.tenant?.planTier,
      });
    }

    next();
  };
};

export const getInMemoryTenants = () => inMemoryTenants;
export const addInMemoryTenant = (tenant) => {
  inMemoryTenants.unshift(tenant);
  return tenant;
};
export const updateInMemoryTenant = (tenantId, updates) => {
  const index = inMemoryTenants.findIndex((t) => t.id === tenantId || t._id === tenantId);
  if (index !== -1) {
    inMemoryTenants[index] = { ...inMemoryTenants[index], ...updates };
    return inMemoryTenants[index];
  }
  return null;
};
