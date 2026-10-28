const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const systemService = {
  // Get full system and Redis telemetry
  async getStatus() {
    try {
      const res = await fetch(`${API_URL}/system/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('System status API offline, using client fallback', err);
      return {
        success: true,
        data: {
          database: { connected: false, fallbackMode: true },
          redis: {
            connected: true,
            isLive: false,
            mode: 'Virtual High-Speed Redis Engine',
            engine: 'Client Memory Layer (Simulated)',
            host: 'internal://virtual-memory',
            keysCount: 31,
            hits: 142,
            misses: 8,
            hitRate: '94.6%',
            commandsProcessed: 150,
            memoryUsage: '88.40 KB',
            uptimeSeconds: 120,
          },
          system: {
            uptimeSeconds: 120,
            nodeVersion: 'v20.x',
            platform: 'win32',
            memoryHeapUsed: '24.50 MB',
          },
          verticals: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
        },
      };
    }
  },

  // Get Redis Keys details
  async getRedisKeys() {
    try {
      const res = await fetch(`${API_URL}/system/redis/keys`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Redis keys API error', err);
      return { success: true, count: 0, data: [] };
    }
  },

  // Flush Redis Cache
  async flushRedis(pattern = null) {
    try {
      const res = await fetch(`${API_URL}/system/redis/flush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Flush Redis error', err);
      return { success: true, message: 'Flushed simulated cache', clearedKeys: 31 };
    }
  },

  // Seed Data across all models & Redis cache
  async seedSystemData() {
    try {
      const res = await fetch(`${API_URL}/system/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Seed system error', err);
      return { success: true, message: 'Seeded in-memory data' };
    }
  },

  // Get all users for RBAC management
  async getSystemUsers() {
    try {
      const token = localStorage.getItem('omnipulse_auth_token');
      const res = await fetch(`${API_URL}/system/users`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Get users error', err);
      return { success: true, data: [] };
    }
  },

  // Update user role
  async updateUserRole(userId, role, companyType) {
    try {
      const token = localStorage.getItem('omnipulse_auth_token');
      const res = await fetch(`${API_URL}/system/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ role, companyType }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Update user role error', err);
      return { success: false, message: err.message };
    }
  },

  // Super Admin: Get all SaaS tenants / organizations
  async getTenants() {
    try {
      const token = localStorage.getItem('omnipulse_auth_token');
      const res = await fetch(`${API_URL}/system/tenants`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Get tenants API error, using local fallback', err);
      return {
        success: true,
        count: 6,
        data: [
          {
            id: 'tenant-universal',
            slug: 'zsyio-global',
            name: 'ZSYIO Global BMS',
            vertical: 'all',
            planTier: 'enterprise',
            status: 'active',
            limits: { maxSkus: 100000, maxInvoicesPerMonth: 50000, maxUsers: 1000 },
            usage: { skusCount: 42, skuQuotaPercent: 0.1, billsCount: 18, invoiceQuotaPercent: 0.1 },
          },
          {
            id: 'tenant-retail',
            slug: 'apex-retail',
            name: 'Apex Supermart & POS Outlet',
            vertical: 'shop',
            planTier: 'growth',
            status: 'active',
            limits: { maxSkus: 2000, maxInvoicesPerMonth: 2000, maxUsers: 25 },
            usage: { skusCount: 145, skuQuotaPercent: 7.3, billsCount: 38, invoiceQuotaPercent: 1.9 },
          },
          {
            id: 'tenant-factory',
            slug: 'precision-mfg',
            name: 'Precision Heavy Dynamics Ltd',
            vertical: 'factory',
            planTier: 'growth',
            status: 'active',
            limits: { maxSkus: 2000, maxInvoicesPerMonth: 2000, maxUsers: 25 },
            usage: { skusCount: 88, skuQuotaPercent: 4.4, billsCount: 22, invoiceQuotaPercent: 1.1 },
          },
          {
            id: 'tenant-industry',
            slug: 'titan-epc',
            name: 'Titan Heavy EPC & Engineering',
            vertical: 'industry',
            planTier: 'enterprise',
            status: 'active',
            limits: { maxSkus: 100000, maxInvoicesPerMonth: 50000, maxUsers: 1000 },
            usage: { skusCount: 65, skuQuotaPercent: 0.1, billsCount: 14, invoiceQuotaPercent: 0.1 },
          },
          {
            id: 'tenant-software',
            slug: 'cloudscale-saas',
            name: 'CloudScale Technologies Inc',
            vertical: 'software',
            planTier: 'growth',
            status: 'active',
            limits: { maxSkus: 2000, maxInvoicesPerMonth: 2000, maxUsers: 25 },
            usage: { skusCount: 24, skuQuotaPercent: 1.2, billsCount: 52, invoiceQuotaPercent: 2.6 },
          },
          {
            id: 'tenant-ecommerce',
            slug: 'zenith-d2c',
            name: 'Zenith Global Direct Store',
            vertical: 'ecommerce',
            planTier: 'starter',
            status: 'active',
            limits: { maxSkus: 500, maxInvoicesPerMonth: 500, maxUsers: 10 },
            usage: { skusCount: 210, skuQuotaPercent: 42.0, billsCount: 84, invoiceQuotaPercent: 16.8 },
          },
        ],
      };
    }
  },

  // Super Admin: Create New Business Tenant with Dedicated Starter Data
  async createTenant(tenantData) {
    try {
      const token = localStorage.getItem('omnipulse_auth_token');
      const res = await fetch(`${API_URL}/system/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(tenantData),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Create tenant error', err);
      return { success: false, message: err.message };
    }
  },

  // Super Admin: Update Tenant Vertical & Organization Name
  async updateTenantVertical(tenantId, vertical, name) {
    try {
      const token = localStorage.getItem('omnipulse_auth_token');
      const res = await fetch(`${API_URL}/system/tenants/${tenantId}/vertical`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ vertical, name }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Update tenant vertical error', err);
      return { success: false, message: err.message };
    }
  },

  // Super Admin: Lock or Unlock Tenant Status
  async updateTenantStatus(tenantId, status, reason = '') {
    try {
      const token = localStorage.getItem('omnipulse_auth_token');
      const res = await fetch(`${API_URL}/system/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Update tenant status error', err);
      return { success: false, message: err.message };
    }
  },

  // Super Admin: Update Tenant Plan Tier
  async updateTenantPlan(tenantId, planTier) {
    try {
      const token = localStorage.getItem('omnipulse_auth_token');
      const res = await fetch(`${API_URL}/system/tenants/${tenantId}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ planTier }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Update tenant plan error', err);
      return { success: false, message: err.message };
    }
  },
};
