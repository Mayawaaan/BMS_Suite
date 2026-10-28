import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default initial user for fallback / demo
const DEFAULT_USER = {
  id: 'user-001',
  name: 'Alex Vance',
  email: 'superadmin@zsyio.io',
  role: 'superadmin',
  tenantId: 'tenant-universal',
  companyName: 'ZSYIO Global BMS',
  companyType: 'all',
  department: 'Platform Architecture & Governance',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Platform Architect & Super Admin with global governance authority.',
  planTier: 'enterprise',
  maxBusinesses: 99,
  allowedVerticals: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omnipulse_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load demo users from backend on mount
  useEffect(() => {
    authService.getDemoUsers().then((res) => {
      if (res && res.data) {
        setDemoUsers(res.data);
      }
    });
  }, []);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('omnipulse_auth_user', JSON.stringify(user));
      if (user.tenantId) {
        localStorage.setItem('omnipulse_tenant_id', user.tenantId);
      }
      if (user.companyType) {
        localStorage.setItem('omnipulse_business_vertical', user.companyType);
      }
    } else {
      localStorage.removeItem('omnipulse_auth_user');
      localStorage.removeItem('omnipulse_auth_token');
      localStorage.removeItem('omnipulse_tenant_id');
    }
  }, [user]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await authService.login(credentials);
      if (res && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authService.register(userData);
      if (res && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Switch active tenant in session with planTier and business quota limits
  const switchTenant = (tenantId, tenantName, planTier, allowedVerticals, maxBusinesses) => {
    if (!user) return;
    const updated = {
      ...user,
      tenantId,
      ...(tenantName && { companyName: tenantName }),
      ...(planTier && { planTier }),
      ...(allowedVerticals && { allowedVerticals }),
      ...(maxBusinesses !== undefined && { maxBusinesses }),
    };
    localStorage.setItem('omnipulse_tenant_id', tenantId);
    setUser(updated);
  };

  // Quick live switcher for testing roles (Superadmin, Admin, Manager, Staff, Auditor)
  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
  };

  // Quick live switcher for company vertical
  const switchCompanyType = (newCompanyType) => {
    if (!user) return;
    const updated = { ...user, companyType: newCompanyType };
    setUser(updated);
    localStorage.setItem('omnipulse_auth_user', JSON.stringify(updated));
  };

  // Update active business verticals in user portfolio
  const updatePortfolio = async (newVerticals, purgedVerticals) => {
    if (!user) return;
    const updated = { ...user, allowedVerticals: newVerticals };
    setUser(updated);
    localStorage.setItem('omnipulse_auth_user', JSON.stringify(updated));
    try {
      const tenantId = user.tenantId || 'tenant-retail';
      await authService.updatePortfolioVerticals(tenantId, newVerticals, purgedVerticals);
    } catch (e) {
      console.warn('Portfolio sync warning:', e.message);
    }
  };

  // Instant plan upgrade helper for portfolio tiers
  const upgradePlan = async (newPlanTier, customVerticals) => {
    if (!user) return;
    const maxBusinesses = newPlanTier === 'enterprise' ? 99 : newPlanTier === 'growth' ? 3 : 1;
    let allowed = customVerticals;
    if (!allowed || !Array.isArray(allowed)) {
      if (newPlanTier === 'enterprise') {
        allowed = ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'];
      } else if (newPlanTier === 'growth') {
        const primary = user.companyType || 'shop';
        const otherTwo = ['ecommerce', 'factory', 'software', 'industry'].filter(v => v !== primary).slice(0, 2);
        allowed = [primary, ...otherTwo];
      } else {
        allowed = [user.companyType || 'shop'];
      }
    }
    const updated = {
      ...user,
      planTier: newPlanTier,
      maxBusinesses,
      allowedVerticals: allowed,
    };
    setUser(updated);
    localStorage.setItem('omnipulse_auth_user', JSON.stringify(updated));
    try {
      const tenantId = user.tenantId || 'tenant-retail';
      await authService.updatePortfolioVerticals(tenantId, allowed);
    } catch {}
  };

  // RBAC permissions helper
  const can = (action) => {
    if (!user) return false;
    const { role } = user;

    // Super Admin has unrestricted authority over every system module, database & Redis
    if (role === 'superadmin') return true;

    switch (action) {
      case 'superadmin':
      case 'isSuperAdmin':
        return role === 'superadmin';

      case 'manageRedis':
      case 'seedData':
      case 'systemControl':
        return role === 'superadmin' || role === 'admin';

      case 'delete':
      case 'canDelete':
        return role === 'superadmin' || role === 'admin';

      case 'viewRevenue':
      case 'canAccessRevenue':
        return role === 'superadmin' || role === 'admin' || role === 'manager' || role === 'auditor';

      case 'create':
      case 'canCreate':
      case 'edit':
      case 'canEdit':
        return role === 'superadmin' || role === 'admin' || role === 'manager' || role === 'staff';

      case 'manageUsers':
      case 'canManageUsers':
        return role === 'superadmin' || role === 'admin';

      case 'exportData':
      case 'canExport':
        return role === 'superadmin' || role === 'admin' || role === 'manager' || role === 'auditor';

      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        demoUsers,
        loading,
        login,
        register,
        logout,
        switchTenant,
        switchRole,
        switchCompanyType,
        updatePortfolio,
        upgradePlan,
        isPlatformOwner: user?.role === 'superadmin',
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
