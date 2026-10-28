import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Database,
  RefreshCw,
  Trash2,
  X,
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
} from 'lucide-react';
import { systemService } from '../../core/services/systemService';
import { useAuth } from '../../core/contexts/AuthContext';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { ROLES_LIST, getRoleInfo, PLAN_TIERS_LIST } from '../../core/config/systemConfig';
import { BUSINESS_PROFILE_LIST } from '../../core/config/businessProfiles';

export const SuperAdminModal = ({ isOpen, onClose }) => {
  const { user, switchRole, switchTenant, switchCompanyType } = useAuth();
  const { switchProfile, activeProfile } = useBusinessProfile();

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
    vertical: 'software',
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
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

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
          text: `Plan tier successfully upgraded to '${newPlan.toUpperCase()}'.`,
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
      switchTenant(tenant.id || tenant._id, tenant);
      switchProfile(tenant.vertical || 'software');
      if (switchCompanyType) switchCompanyType(tenant.vertical || 'software');
      setMessage({
        type: 'success',
        text: `Switched active management context to '${tenant.name}' (${tenant.vertical.toUpperCase()}).`,
      });
      setTimeout(() => {
        onClose();
      }, 700);
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
          text: `New business '${newBizForm.name}' created with isolated database partition.`,
        });
        setNewBizForm({ name: '', vertical: 'software', planTier: 'starter', adminEmail: '' });
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
      setMessage({ type: 'success', text: 'Sample data reloaded successfully across all business verticals.' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C1917]/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#FFFFFF] border border-[var(--border-strong)] shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]">
        
        {/* Clean Solid Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-brand-dim)] border border-[var(--accent-brand-border)] flex items-center justify-center text-[var(--accent-brand)]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  ZSYIO BMS Platform Governance
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-brand">
                  Platform Owner
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Assign operating verticals to businesses and govern dynamic user roles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh"
              className="p-2 rounded-lg bg-[#FAF6EF] hover:bg-[#F2ECE2] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#FAF6EF] hover:bg-rose-50 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {message && (
          <div
            className={`px-5 py-2.5 flex items-center justify-between text-xs font-semibold ${
              message.type === 'success'
                ? 'badge-success border-b'
                : 'badge-danger border-b'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="hover:opacity-80 font-bold ml-4">
              &times;
            </button>
          </div>
        )}

        {/* 3 Simple, Clear Tabs */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          {[
            { id: 'tenants', label: 'Businesses & Verticals', icon: Building2, count: tenants.length },
            { id: 'users', label: 'Team Members & Roles', icon: Users, count: systemUsers.length },
            { id: 'system', label: 'System & Data', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs font-semibold border-b-2 transition-all ${
                  isTabActive
                    ? 'border-[var(--accent-brand)] text-[var(--text-primary)] bg-[#FFFFFF]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isTabActive ? 'text-[var(--accent-brand)]' : 'text-[var(--text-muted)]'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF6EF] text-[var(--text-secondary)] border border-[var(--border-color)]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: BUSINESSES & VERTICALS */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Operating verticals adapt business terminology, modules, and KPIs dynamically. Multi-tenant instances partition operational records seamlessly.
                </p>
                <button
                  onClick={() => setShowCreateBizModal((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showCreateBizModal ? 'Close Form' : 'Add Business'}</span>
                </button>
              </div>

              {showCreateBizModal && (
                <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[var(--border-strong)] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--accent-brand)]" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Create New Business (Dedicated Data)
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowCreateBizModal(false)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateBusiness} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Business Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Logistics"
                        value={newBizForm.name}
                        onChange={(e) => setNewBizForm({ ...newBizForm, name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-brand)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Operating Vertical</label>
                      <select
                        value={newBizForm.vertical}
                        onChange={(e) => setNewBizForm({ ...newBizForm, vertical: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
                      >
                        {BUSINESS_PROFILE_LIST.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Plan Tier</label>
                      <select
                        value={newBizForm.planTier}
                        onChange={(e) => setNewBizForm({ ...newBizForm, planTier: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
                      >
                        {PLAN_TIERS_LIST.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.label} ({plan.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Admin Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="admin@business.com"
                        value={newBizForm.adminEmail}
                        onChange={(e) => setNewBizForm({ ...newBizForm, adminEmail: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-brand)]"
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-4 flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateBizModal(false)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-medium transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creatingBiz}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                      >
                        {creatingBiz ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{creatingBiz ? 'Provisioning...' : 'Create & Provision Data'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                    <thead className="bg-[#FAF6EF] border-b border-[var(--border-color)] text-[11px] font-semibold uppercase text-[var(--text-muted)]">
                      <tr>
                        <th className="py-3 px-4">Business Name</th>
                        <th className="py-3 px-4">Operating Vertical</th>
                        <th className="py-3 px-4">Plan & Quota</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {tenants.map((t) => {
                        const isCurrent = user?.tenantId === t.id || user?.tenantId === t._id;
                        const isLocked = t.status === 'locked' || t.status === 'suspended';
                        const maxBiz = t.maxBusinesses || (t.planTier === 'enterprise' ? 99 : t.planTier === 'growth' ? 3 : 1);

                        return (
                          <tr key={t.id || t._id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                                <span>{t.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded badge-success">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[var(--text-dim)] font-mono">
                                ID: {t.id || t.slug}
                              </span>
                            </td>

                            {/* Operating Vertical Dropdown (Dynamic from Config) */}
                            <td className="py-3 px-4">
                              <select
                                value={t.vertical || 'software'}
                                onChange={(e) => handleUpdateTenantVertical(t.id, e.target.value)}
                                className="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)] cursor-pointer"
                              >
                                {BUSINESS_PROFILE_LIST.map((profile) => (
                                  <option
                                    key={profile.id}
                                    value={profile.id}
                                    disabled={profile.id === 'all' && t.planTier !== 'enterprise'}
                                  >
                                    {profile.name}
                                  </option>
                                ))}
                              </select>
                              {t.planTier !== 'enterprise' && t.vertical === 'all' && (
                                <span className="block text-[10px] text-amber-700 mt-0.5 font-medium">
                                  Requires Enterprise
                                </span>
                              )}
                            </td>

                            {/* Plan Tier & Business Quota (Dynamic from Config) */}
                            <td className="py-3 px-4">
                              <select
                                value={t.planTier || 'growth'}
                                onChange={(e) => handleUpdateTenantPlan(t.id, e.target.value)}
                                className="px-2 py-1 text-xs uppercase rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
                              >
                                {PLAN_TIERS_LIST.map((plan) => (
                                  <option key={plan.id} value={plan.id}>
                                    {plan.label}
                                  </option>
                                ))}
                              </select>
                              <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                                Quota: {maxBiz >= 99 ? 'Unlimited' : `${maxBiz} Business${maxBiz > 1 ? 'es' : ''}`}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleUpdateTenantStatus(t.id, isLocked ? 'active' : 'locked')}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
                                  isLocked
                                    ? 'badge-danger'
                                    : 'badge-success'
                                }`}
                              >
                                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                <span>{isLocked ? 'Locked' : 'Active'}</span>
                              </button>
                            </td>

                            {/* Switch Context */}
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleAssumeTenant(t)}
                                className="px-3 py-1.5 rounded-lg bg-[var(--accent-brand-dim)] hover:bg-[var(--accent-brand)] text-[var(--accent-brand)] hover:text-white border border-[var(--accent-brand-border)] text-xs font-semibold transition-all inline-flex items-center gap-1"
                              >
                                <span>Switch</span>
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
            </div>
          )}

          {/* TAB 2: TEAM MEMBERS & ROLES */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--text-primary)]">Role Governance Policies:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[var(--text-muted)]">
                  <div>• <strong>Admin / Superadmin:</strong> Universal authority to create, edit, audit, and delete records.</div>
                  <div>• <strong>Manager / Staff:</strong> Operational access to log transactions, SKUs, and invoices.</div>
                  <div className="sm:col-span-2">• <strong>Auditor:</strong> Read-only compliance view across financial registers.</div>
                </div>
              </div>

              <div className="rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                  <thead className="bg-[#FAF6EF] border-b border-[var(--border-color)] text-[11px] font-semibold uppercase text-[var(--text-muted)]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-right">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {systemUsers.map((u) => {
                      const isSelf = user && (user.id === u.id || user.email === u.email);
                      const roleInfo = getRoleInfo(u.role);

                      return (
                        <tr key={u.id || u._id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1 py-0.2 rounded badge-brand">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)]">{u.email}</span>
                          </td>
                          <td className="py-3 px-4 text-[var(--text-secondary)]">
                            {u.companyName || 'ZSYIO BMS'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${roleInfo.badgeClass}`}>
                              {roleInfo.shortLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleUserRoleChange(u.id || u._id, e.target.value)}
                              className="px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
                            >
                              {ROLES_LIST.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.shortLabel}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM & DATA */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reset Data Card */}
                <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-brand-dim)] border border-[var(--accent-brand-border)] flex items-center justify-center text-[var(--accent-brand)]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">Reset Sample Data</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Restores default sample transactions, bills, deals, and SKUs across all business verticals.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleMasterSeed}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    Reset & Reload Sample Data
                  </button>
                </div>

                {/* Clear Cache Card */}
                <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg badge-danger flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">Clear System Cache</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Purges in-memory cached responses to force immediate live database synchronization.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleFlushCache}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    Clear Cache Now
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Server className="w-4 h-4 text-emerald-700" />
                  <span>Platform Engine: <strong>Node.js {statusData?.system?.nodeVersion || 'v20.x'}</strong></span>
                </div>
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Operational
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Clean Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between text-xs">
          <div className="text-[var(--text-muted)] text-[11px]">
            Operating Mode: <strong className="text-[var(--text-primary)]">{activeProfile.name}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminModal;
