import { AsyncLocalStorage } from 'node:async_hooks';

// AsyncLocalStorage to maintain current tenant context across asynchronous call chains
export const tenantContextStorage = new AsyncLocalStorage();

/**
 * Run a callback function within an explicit tenant context.
 * All Mongoose queries executed within fn() will automatically scope to this tenantId.
 */
export const runInTenantContext = (tenantId, fn) => {
  return tenantContextStorage.run({ tenantId }, fn);
};

/**
 * Returns the active tenantId from the current async execution context, if any.
 */
export const getCurrentTenantId = () => {
  const store = tenantContextStorage.getStore();
  return store?.tenantId || null;
};

/**
 * Mongoose Plugin: Multi-Tenant Data Scoping & Compound Isolation
 */
export const tenantScopingPlugin = (schema, options = {}) => {
  // 1. Inject tenantId field into schema if not already present
  if (!schema.path('tenantId')) {
    schema.add({
      tenantId: {
        type: String,
        required: true,
        index: true,
        trim: true,
      },
    });
  }

  // 2. Query helper: .byTenant(tenantId)
  schema.query.byTenant = function (tenantId) {
    if (tenantId && tenantId !== 'all') {
      return this.where({ tenantId });
    }
    return this;
  };

  // 3. Pre-find hooks: automatically scope queries to the active tenant
  const queryMethods = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'countDocuments',
    'estimatedDocumentCount',
    'updateMany',
    'updateOne',
    'deleteMany',
    'deleteOne',
  ];

  queryMethods.forEach((method) => {
    schema.pre(method, function () {
      const query = this.getQuery();

      // Check if this query explicitly requests bypassing tenant scoping (e.g. Superadmin God Mode)
      if (query.bypassTenantScope) {
        delete query.bypassTenantScope;
        return;
      }

      // Check for tenantId in active async context or query options
      const activeTenantId = this.getOptions()?.tenantId || getCurrentTenantId();

      if (activeTenantId && activeTenantId !== 'all') {
        // Only set if not already explicitly specified in query
        if (query.tenantId === undefined) {
          this.where({ tenantId: activeTenantId });
        }
      }
    });
  });

  // 4. Pre-save validation: ensure tenantId is attached before persisting
  schema.pre('validate', function (next) {
    if (!this.tenantId) {
      const activeTenantId = getCurrentTenantId();
      if (activeTenantId && activeTenantId !== 'all') {
        this.tenantId = activeTenantId;
      }
    }
    next();
  });
};

export default tenantScopingPlugin;
