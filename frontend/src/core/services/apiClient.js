const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VERTICAL_TO_TENANT = {
  all: 'tenant-universal',
  shop: 'tenant-retail',
  factory: 'tenant-factory',
  industry: 'tenant-industry',
  software: 'tenant-software',
  ecommerce: 'tenant-ecommerce',
};

const getHeaders = (customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // 1. Inject Bearer Token
  const token = localStorage.getItem('omnipulse_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 2. Inject Active Tenant Scoping Header
  let tenantId = localStorage.getItem('omnipulse_tenant_id');
  const vertical = localStorage.getItem('omnipulse_business_vertical') || 'all';

  let isPlatformSuperAdmin = false;
  try {
    const authUserStr = localStorage.getItem('omnipulse_auth_user');
    const authUser = authUserStr ? JSON.parse(authUserStr) : null;
    isPlatformSuperAdmin = authUser?.role === 'superadmin' || authUser?.tenantId === 'tenant-universal';
  } catch {}

  // For Platform Owner: when inspecting a specific operating vertical, scope to that business
  if (isPlatformSuperAdmin && vertical && vertical !== 'all' && VERTICAL_TO_TENANT[vertical]) {
    tenantId = VERTICAL_TO_TENANT[vertical];
  } else if (!tenantId) {
    tenantId = VERTICAL_TO_TENANT[vertical] || 'tenant-universal';
  }

  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }

  return headers;
};

export const apiClient = {
  async get(endpoint, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(customHeaders),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API Client GET Warning] ${endpoint}:`, err.message);
      throw err;
    }
  },

  async post(endpoint, data, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(customHeaders),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API Client POST Warning] ${endpoint}:`, err.message);
      throw err;
    }
  },

  async put(endpoint, data, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(customHeaders),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API Client PUT Warning] ${endpoint}:`, err.message);
      throw err;
    }
  },

  async delete(endpoint, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(customHeaders),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API Client DELETE Warning] ${endpoint}:`, err.message);
      throw err;
    }
  },
};

export default apiClient;
