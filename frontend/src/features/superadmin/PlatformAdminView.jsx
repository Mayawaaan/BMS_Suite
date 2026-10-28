import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Database,
  RefreshCw,
  Trash2,
  Crown,
  Lock,
  Unlock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Activity,
  Server,
  Plus,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { systemService } from '../../core/services/systemService';
import { useAuth } from '../../core/contexts/AuthContext';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { ROLES_LIST, getRoleInfo, PLAN_TIERS_LIST } from '../../core/config/systemConfig';
import { BUSINESS_PROFILE_LIST } from '../../core/config/businessProfiles';

export const PlatformAdminView = () => {
  const { user, switchRole, switchTenant, switchCompanyType } = useAuth();
  const { switchProfile } = useBusinessProfile();

  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' | 'users' | 'system'
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [systemUsers, setSystemUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [message, setMessage] = useState(null);

  // New business creation state
  const [showCreateBizModal, setShowCreateBizModal] = useState(false);
  const [creatingBiz, setCreatingBiz] = useState(false);
  const [newBizForm, setNewBizForm] = useState({
    name: '',
    vertical: 'shop',
    planTier: 'starter',
    adminEmail: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, usersRes, tenantsRes] = await Promise.all([
        systemService.getStatus(),
        systemService.getSystemUsers(),
        systemService.getTenants(),
      ]);

      if (statusRes && statusRes.data) setStatusData(statusRes.data);
      if (usersRes && usersRes.data) setSystemUsers(usersRes.data);
      if (tenantsRes && tenantsRes.data) setTenants(tenantsRes.data);
    } catch (err) {
      console.error('Failed to load platform data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTenantVertical = async (tenantId, newVertical) => {
    try {
      setLoading(true);
      const res = await systemService.updateTenantVertical(tenantId, newVertical);
      if (res.success) {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenantId || t._id === tenantId ? { ...t, vertical: newVertical } : t))
        );
        setMessage({
          type: 'success',
          text: `Business vertical successfully changed to '${newVertical.toUpperCase()}'.`,
        });
        if (user?.tenantId === tenantId) {
          switchProfile(newVertical);
          if (switchCompanyType) switchCompanyType(newVertical);
        }
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update vertical' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update vertical';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenantStatus = async (tenantId, newStatus) => {
    try {
      setLoading(true);
      const res = await systemService.updateTenantStatus(tenantId, newStatus);
      if (res.success) {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenantId || t._id === tenantId ? { ...t, status: newStatus } : t))
        );
        setMessage({
          type: 'success',
          text: `Business status successfully changed to '${newStatus.toUpperCase()}'.`,
        });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update status' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update status';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenantPlan = async (tenantId, newPlan) => {
    try {
      setLoading(true);
      const res = await systemService.updateTenantPlan(tenantId, newPlan);
      if (res.success) {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenantId || t._id === tenantId ? { ...t, planTier: newPlan } : t))
        );
        setMessage({
          type: 'success',
          text: `Plan tier successfully updated to '${newPlan.toUpperCase()}'.`,
        });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update plan' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update plan';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleAssumeTenant = (tenant) => {
    if (switchTenant) {
      switchTenant(tenant.id || tenant._id, tenant.name, tenant.planTier, tenant.allowedVerticals, tenant.maxBusinesses);
      switchProfile(tenant.vertical || 'shop');
      if (switchCompanyType) switchCompanyType(tenant.vertical || 'shop');
      setMessage({
        type: 'success',
        text: `Switched active management context to '${tenant.name}' (${(tenant.vertical || 'shop').toUpperCase()}).`,
      });
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    if (!newBizForm.name.trim()) return;

    try {
      setCreatingBiz(true);
      const res = await systemService.createTenant({
        name: newBizForm.name,
        vertical: newBizForm.vertical,
        planTier: newBizForm.planTier,
        adminEmail: newBizForm.adminEmail || `${newBizForm.name.toLowerCase().replace(/\s+/g, '')}@zsyio.io`,
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: `New business '${newBizForm.name}' created with isolated database partition ($0 initial metrics).`,
        });
        setNewBizForm({ name: '', vertical: 'shop', planTier: 'starter', adminEmail: '' });
        setShowCreateBizModal(false);
        await loadData();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to create business' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to create business',
      });
    } finally {
      setCreatingBiz(false);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);
      const res = await systemService.updateUserRole(userId, newRole);
      if (res.success) {
        setSystemUsers((prev) =>
          prev.map((u) => (u.id === userId || u._id === userId ? { ...u, role: newRole } : u))
        );
        if (user && (user.id === userId || user._id === userId)) {
          switchRole(newRole);
        }
        setMessage({ type: 'success', text: `User role updated to '${newRole.toUpperCase()}'.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      setLoading(true);
      const res = await systemService.flushRedis();
      setMessage({ type: 'success', text: res.message || 'System cache cleared successfully.' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleMasterSeed = async () => {
    try {
      setLoading(true);
      await systemService.seedSystemData();
      setMessage({ type: 'success', text: 'Clean sample data reloaded successfully (Super Admin & Retail Store).' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#9A3412] shadow-xs">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                BMS Platform Governance
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#9A3412]/10 text-[#9A3412] border border-[#9A3412]/30 font-bold uppercase">
                Dedicated Full Page
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Global tenant provisioning, quota enforcement, user governance, and infrastructure telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 transition-all active:scale-95"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#9A3412]' : ''}`} />
            <span>Sync Live</span>
          </button>

          <button
            onClick={() => setShowCreateBizModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Business</span>
          </button>

          <button
            onClick={handleFlushCache}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-[#FAF6EF] hover:bg-rose-50 border border-[var(--border-color)] hover:border-rose-300 text-xs font-semibold text-rose-700 flex items-center gap-1.5 transition-all"
            title="Clear Redis cache keys"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Cache</span>
          </button>
        </div>
      </div>

      {/* Message Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
            message.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-500 hover:text-black font-bold">
            &times;
          </button>
        </div>
      )}

      {/* KPI Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Partitioned Tenants</span>
            <Building2 className="w-4 h-4 text-[#9A3412]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {tenants.length}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Active multi-tenant isolated databases
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Governed Users</span>
            <Users className="w-4 h-4 text-[#B4833E]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {systemUsers.length}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Clean seed accounts (Admin, Staff, Auditor)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Redis Telemetry</span>
            <Server className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {statusData?.redis?.hitRate || '99.4%'}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-mono font-medium">
            ● {statusData?.redis?.keysCount || 0} active keys cached
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Database Partition Engine</span>
            <Database className="w-4 h-4 text-[#9A3412]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {statusData?.database?.connected ? 'MongoDB Live' : 'Isolated RAM Partition'}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Zero-latency multi-tenant state
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Navigation Tab Bar */}
        <div className="flex border-b border-[var(--border-color)] bg-[#FAF6EF] px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'tenants'
                ? 'border-[#9A3412] text-[#9A3412] bg-[#FFFFFF]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Tenants & Quotas ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-[#9A3412] text-[#9A3412] bg-[#FFFFFF]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Governance ({systemUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'system'
                ? 'border-[#9A3412] text-[#9A3412] bg-[#FFFFFF]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System Telemetry & Cache</span>
          </button>
        </div>

        {/* Tab 1: Tenants List & Quota Control */}
        {activeTab === 'tenants' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Registered Business Organizations
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Manage plan tiers, operational quotas, and isolate business partition metrics.
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-[var(--text-secondary)]">
                Active Tenant: <strong className="text-[#9A3412]">{user?.tenantId}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-3">Vertical</th>
                    <th className="py-3 px-3">Subscription Tier</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Resource Quotas</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {tenants.map((t) => {
                    const isCurrent = user?.tenantId === (t.id || t._id);
                    const usage = t.usage || {};
                    const limits = t.limits || {};

                    return (
                      <tr key={t.id || t._id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--text-primary)] text-sm">{t.name}</div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                            <span>ID: {t.id || t._id}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                Current
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={t.vertical || 'shop'}
                            onChange={(e) => handleUpdateTenantVertical(t.id || t._id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-[#FFFFFF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium"
                          >
                            <option value="shop">Retail Store & POS</option>
                            <option value="all">Global BMS (All)</option>
                            <option value="software">SaaS Enterprise</option>
                            <option value="factory">Manufacturing</option>
                            <option value="industry">Heavy Industry</option>
                            <option value="ecommerce">E-Commerce</option>
                          </select>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={t.planTier || 'starter'}
                            onChange={(e) => handleUpdateTenantPlan(t.id || t._id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-[#FFFFFF] border border-[var(--border-color)] text-xs font-bold text-[#9A3412]"
                          >
                            <option value="starter">Starter Hub ($29/mo)</option>
                            <option value="growth">Growth Enterprise ($99/mo)</option>
                            <option value="enterprise">Unlimited Suite ($299/mo)</option>
                          </select>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {t.status === 'active' ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                            <span>{t.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="space-y-1 min-w-[140px]">
                            <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                              <span>SKUs: {usage.skusCount ?? 0}</span>
                              <span>/ {limits.maxSkus || '∞'}</span>
                            </div>
                            <div className="w-full bg-[#E5DCD0] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#9A3412] h-full rounded-full"
                                style={{ width: `${Math.min(usage.skuQuotaPercent || 0, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleAssumeTenant(t)}
                            className="px-3 py-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#9A3412] hover:text-white border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <span>Manage Context</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Clean Platform User Governance */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Governed User Accounts
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Manage user roles, operational access, and tenant associations.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">User & Contact</th>
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-3">Role Authority</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {systemUsers.map((u) => {
                    const isSelf = user?.email === u.email;

                    return (
                      <tr key={u.id || u._id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#9A3412]/10 text-[#9A3412] font-bold flex items-center justify-center border border-[#9A3412]/20">
                              {(u.name || 'U').slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-[var(--text-secondary)]">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-[var(--text-primary)]">{u.companyName || u.tenantId}</div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)]">{u.tenantId}</div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={u.role || 'staff'}
                            onChange={(e) => handleUserRoleChange(u.id || u._id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                          >
                            <option value="superadmin">Super Admin (Platform Owner)</option>
                            <option value="admin">Admin (Full Store Control)</option>
                            <option value="staff">Staff (POS & Operations)</option>
                            <option value="auditor">Auditor (Compliance & Ledger)</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="text-[11px] font-mono text-emerald-800 font-semibold">Active</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: System Telemetry & Redis Cache Control */}
        {activeTab === 'system' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telemetry Details */}
              <div className="p-5 rounded-2xl bg-[#FAF6EF] border border-[var(--border-color)] space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#9A3412]" />
                  <span>Platform Runtime Metrics</span>
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Node Environment</span>
                    <span className="font-bold text-[var(--text-primary)]">{statusData?.system?.nodeVersion || 'v20.x'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Uptime</span>
                    <span className="font-bold text-[var(--text-primary)]">{statusData?.system?.uptimeSeconds || 0} seconds</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Heap Allocation</span>
                    <span className="font-bold text-[var(--text-primary)]">{statusData?.system?.memoryHeapUsed || '32.40 MB'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Hosting Platform</span>
                    <span className="font-bold text-[var(--text-primary)]">{statusData?.system?.platform || 'windows (win32)'}</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="p-5 rounded-2xl bg-[#FAF6EF] border border-[var(--border-color)] space-y-4">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#9A3412]" />
                  <span>System Maintenance & Seeding</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Control in-memory cache invalidation and reset the seed state back to clean retail shop and superadmin records.
                </p>
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleFlushCache}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FFFFFF] hover:bg-rose-50 border border-[var(--border-color)] hover:border-rose-300 text-xs font-bold text-rose-700 flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Flush All Redis Cache Keys</span>
                  </button>
                  <button
                    onClick={handleMasterSeed}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Reload Clean Initial Seed (Super Admin & Retail)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Provision Business Modal */}
      {showCreateBizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[var(--border-strong)] p-6 shadow-2xl text-[var(--text-primary)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#9A3412] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Provision New Business Partition
                </h3>
              </div>
              <button
                onClick={() => setShowCreateBizModal(false)}
                className="text-slate-400 hover:text-black font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Fashion & Retail"
                  value={newBizForm.name}
                  onChange={(e) => setNewBizForm({ ...newBizForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Business Vertical *
                </label>
                <select
                  value={newBizForm.vertical}
                  onChange={(e) => setNewBizForm({ ...newBizForm, vertical: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                >
                  <option value="shop">Retail Store & POS</option>
                  <option value="software">Software & SaaS</option>
                  <option value="factory">Manufacturing</option>
                  <option value="industry">Heavy Industry</option>
                  <option value="ecommerce">E-Commerce</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Subscription Tier *
                </label>
                <select
                  value={newBizForm.planTier}
                  onChange={(e) => setNewBizForm({ ...newBizForm, planTier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                >
                  <option value="starter">Starter Hub ($29/mo)</option>
                  <option value="growth">Growth Enterprise ($99/mo)</option>
                  <option value="enterprise">Unlimited Suite ($299/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Admin Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="admin@metrostores.io"
                  value={newBizForm.adminEmail}
                  onChange={(e) => setNewBizForm({ ...newBizForm, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  New tenant will start with clean $0 metrics and empty ledger.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBizModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBiz}
                  className="px-4 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {creatingBiz ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{creatingBiz ? 'Partitioning...' : 'Create Isolated Tenant'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
