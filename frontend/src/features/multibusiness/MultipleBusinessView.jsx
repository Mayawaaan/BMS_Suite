import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store,
  Factory,
  HardHat,
  Cpu,
  ShoppingBag,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Check,
  AlertTriangle,
  Trash2,
  BarChart3,
  RefreshCw,
  HelpCircle,
  X,
  FileSpreadsheet,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { BUSINESS_PROFILES, BUSINESS_PROFILE_LIST } from '../../core/config/businessProfiles';
import { formatCurrency } from '../../shared/utils/formatters';
import { authService } from '../../core/services/authService';

const iconMap = {
  shop: Store,
  factory: Factory,
  industry: HardHat,
  software: Cpu,
  ecommerce: ShoppingBag,
  all: Layers,
};

export const MultipleBusinessView = ({ onNavigateTab }) => {
  const { user, switchCompanyType, updatePortfolio, upgradePlan } = useAuth();
  const { profileId, switchProfile } = useBusinessProfile();

  const planTier = user?.planTier || 'starter';
  const maxAllowed = planTier === 'enterprise' ? 99 : planTier === 'growth' ? 3 : 1;
  const isStarter = planTier === 'starter';
  const isGrowth = planTier === 'growth';
  const isEnterprise = planTier === 'enterprise';

  // Sub-tabs: 'workspaces' | 'analytics'
  const [activeSubTab, setActiveSubTab] = useState('workspaces');

  // Active business verticals configured in user profile
  const userAllowed = user?.allowedVerticals || [user?.companyType || 'shop'];
  const [selectedVerticals, setSelectedVerticals] = useState(userAllowed);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // All-Business Financial Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Niche Change & Data Purge Modal State
  const [purgeModal, setPurgeModal] = useState(null);
  // Shape: { incomingNiche: 'software', outgoingNiche: 'factory', availableOutgoing: ['factory', 'ecommerce'] }
  const [selectedOutgoing, setSelectedOutgoing] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  // 5 standard primary business verticals
  const availableVerticals = BUSINESS_PROFILE_LIST.filter((p) => p.id !== 'all');

  // Load portfolio analytics
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await authService.getPortfolioAnalytics(user?.tenantId);
      if (res && res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.warn('Portfolio analytics fetch warning:', err.message);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.tenantId, selectedVerticals]);

  // Intercept vertical change in Growth Pack to trigger the Data Purge Popup
  const handleToggleVertical = (vId) => {
    if (isEnterprise) return; // Enterprise has all 5 unlocked

    // If user is clicking an active vertical to deselect it
    if (selectedVerticals.includes(vId)) {
      if (selectedVerticals.length <= 1) {
        setActionNotice('You must keep at least one primary active business vertical.');
        setTimeout(() => setActionNotice(''), 4000);
        return;
      }

      // In Growth pack, removing an active niche purges its data
      if (isGrowth) {
        setPurgeModal({
          type: 'decommission_only',
          incomingNiche: null,
          outgoingNiche: vId,
          availableOutgoing: [vId],
        });
        setSelectedOutgoing(vId);
      } else {
        setSelectedVerticals(selectedVerticals.filter((id) => id !== vId));
      }
      return;
    }

    // User is attempting to add a new vertical
    if (selectedVerticals.length < maxAllowed) {
      // Slot available: simply add
      setSelectedVerticals([...selectedVerticals, vId]);
      return;
    }

    // User has reached Growth Pack quota (3/3) and wants to swap
    if (isGrowth && selectedVerticals.length >= 3) {
      // Find candidate outgoing verticals (exclude user's primary companyType or give choice)
      const primaryType = user?.companyType || 'shop';
      const availableToReplace = selectedVerticals.filter((id) => id !== primaryType);
      const defaultReplace = availableToReplace[0] || selectedVerticals[0];

      setPurgeModal({
        type: 'swap',
        incomingNiche: vId,
        outgoingNiche: defaultReplace,
        availableOutgoing: availableToReplace.length > 0 ? availableToReplace : selectedVerticals,
      });
      setSelectedOutgoing(defaultReplace);
    }
  };

  // Confirm Niche Swap & Purge Data
  const handleConfirmPurgeAndSwap = async () => {
    if (!purgeModal || !selectedOutgoing) return;
    setIsPurging(true);

    try {
      const targetTenantId = user?.tenantId || 'tenant-retail';
      const outgoing = selectedOutgoing;
      const incoming = purgeModal.incomingNiche;

      let newVerticals = selectedVerticals.filter((id) => id !== outgoing);
      if (incoming && !newVerticals.includes(incoming)) {
        newVerticals.push(incoming);
      }

      // Execute purge & update on backend
      await authService.purgePortfolioVertical(targetTenantId, outgoing, incoming);
      await updatePortfolio(newVerticals, [outgoing]);

      setSelectedVerticals(newVerticals);
      setPurgeModal(null);
      setIsPurging(false);

      const outProfile = BUSINESS_PROFILES[outgoing]?.name || outgoing;
      const inProfile = incoming ? (BUSINESS_PROFILES[incoming]?.name || incoming) : null;

      setSaveSuccessMsg(
        incoming
          ? `Niche '${outProfile}' decommissioned and its data was purged. '${inProfile}' is now active with a clean slate!`
          : `Niche '${outProfile}' decommissioned and its data was purged.`
      );
      setTimeout(() => setSaveSuccessMsg(''), 6000);

      // Refresh analytics
      fetchAnalytics();
    } catch (err) {
      setIsPurging(false);
      setActionNotice(`Failed to purge vertical: ${err.message}`);
      setTimeout(() => setActionNotice(''), 5000);
    }
  };

  const handleSavePortfolio = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    await updatePortfolio(selectedVerticals);
    setIsSaving(false);
    setSaveSuccessMsg('Multi-business portfolio updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    fetchAnalytics();
  };

  const handleSwitchWorkspace = (vId) => {
    switchProfile(vId);
    switchCompanyType(vId);
  };

  const handleUpgradeToGrowth = async () => {
    const currentPrimary = user?.companyType || 'shop';
    const defaults = ['ecommerce', 'factory', 'software', 'industry'].filter((v) => v !== currentPrimary).slice(0, 2);
    const new3 = [currentPrimary, ...defaults];
    await upgradePlan('growth', new3);
    setSelectedVerticals(new3);
    setUpgradeSuccessMsg('Upgraded to Growth Pack! 3 business verticals unlocked.');
    setTimeout(() => setUpgradeSuccessMsg(''), 5000);
    fetchAnalytics();
  };

  const handleUpgradeToEnterprise = async () => {
    const all5 = ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'];
    await upgradePlan('enterprise', all5);
    setSelectedVerticals(all5);
    setUpgradeSuccessMsg('Upgraded to Highest Enterprise Suite! All verticals unlocked.');
    setTimeout(() => setUpgradeSuccessMsg(''), 5000);
    fetchAnalytics();
  };

  // Group entities from analytics for profitable vs loss making cards
  const portfolioEntities = analyticsData?.entities || availableVerticals.map((p) => ({
    id: p.id,
    name: p.name,
    badge: p.badge,
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    profitMargin: 0,
    status: 'CLEAN_SLATE',
    hasActivity: false,
    wonDealsCount: 0,
    billsCount: 0,
    revenueShare: 0,
  }));

  const activeFleetEntities = portfolioEntities.filter(
    (e) => selectedVerticals.includes(e.id) || isEnterprise
  );

  const profitableBusinesses = activeFleetEntities.filter((e) => e.status === 'PROFITABLE');
  const lossMakingBusinesses = activeFleetEntities.filter((e) => e.status === 'LOSS_MAKING');
  const standbyBusinesses = activeFleetEntities.filter(
    (e) => e.status === 'CLEAN_SLATE' || e.status === 'BREAK_EVEN'
  );

  return (
    <div className="space-y-8">
      {/* Hero Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9A3412]/10 text-[#9A3412] border border-[#9A3412]/25 font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>MULTI-BUSINESS PORTFOLIO HUB</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  isEnterprise
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isGrowth
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}
              >
                {isEnterprise
                  ? 'Highest Suite (Unlimited)'
                  : isGrowth
                  ? 'Growth Pack (3 Verticals)'
                  : 'Starter Hub (1 Vertical)'}
              </span>
            </div>

            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {user?.companyName || 'Enterprise'} Business Portfolio
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Consolidated governance for multi-company operations. Launch dedicated workspaces for retail shops, manufacturing plants, e-commerce stores, and software arms with live cross-business P&L diagnostics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-[#FAF6EF] border border-[var(--border-strong)] text-center shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-semibold">Active Businesses</span>
              <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">
                {selectedVerticals.filter((v) => v !== 'all').length} / {isEnterprise ? '∞' : maxAllowed}
              </div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-[#9A3412]/10 border border-[#9A3412]/25 text-center shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[#9A3412] font-semibold">Operating Workspace</span>
              <div className="text-xl sm:text-2xl font-black text-[#9A3412] font-mono uppercase">
                {profileId}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {upgradeSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{upgradeSuccessMsg}</span>
          </div>
        )}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* Main Sub-Tab Switcher: Workspaces Fleet vs All-Business Financial Analytics */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('workspaces')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'workspaces'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'bg-[#FFFFFF] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Fleet Operations & Workspaces</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
              activeSubTab === 'analytics'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'bg-[#FFFFFF] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>All-Business Financial Analytics</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase ${
                activeSubTab === 'analytics'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              P&L Health
            </span>
          </button>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoadingAnalytics}
          className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--text-muted)] hover:text-[#9A3412] p-2 rounded-lg hover:bg-[#FAF6EF] transition-colors"
          title="Refresh Financial Analytics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: WORKSPACES FLEET & ALLOCATION                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'workspaces' && (
        <div className="space-y-8">
          {/* Starter Upsell Notice (If on Starter) */}
          {isStarter && (
            <div className="p-6 rounded-2xl bg-[#FAF6EF] border-2 border-dashed border-[#9A3412]/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 text-[#9A3412] font-bold text-xs uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Multi-Business Operations Locked</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Unlock Up to 3 Business Verticals with the Growth Pack
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Your starter license includes 1 primary vertical ({BUSINESS_PROFILES[profileId]?.name || 'Retail Shop'}). Upgrade to the Growth Pack to simultaneously run up to 3 business verticals (e.g. Retail Shop + E-Commerce + Factory) with full workspace switching and consolidated telemetry.
                </p>
              </div>

              <button
                onClick={handleUpgradeToGrowth}
                className="px-5 py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <span>Upgrade to Growth Pack ($99/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Workspaces Grid (1-Click Switchers) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-semibold">
                  Operational Fleet
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Active Business Workspaces
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Click any business to switch operating context instantly
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableVerticals.map((profile) => {
                const Icon = iconMap[profile.id] || Building2;
                const isEnabled = selectedVerticals.includes(profile.id) || isEnterprise;
                const isCurrent = profileId === profile.id;

                return (
                  <div
                    key={profile.id}
                    className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative shadow-xs ${
                      isCurrent
                        ? 'bg-[#FFFFFF] border-[#9A3412] ring-2 ring-[#9A3412]/20'
                        : isEnabled
                        ? 'bg-[#FFFFFF] border-[var(--border-color)] hover:border-[#9A3412]/40'
                        : 'bg-[#FAF6EF]/60 border-[var(--border-color)] opacity-60'
                    }`}
                  >
                    {/* Status Badges */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            isCurrent
                              ? 'bg-[#9A3412] text-white shadow-xs'
                              : isEnabled
                              ? 'bg-[#FAF6EF] text-[#9A3412] border border-[var(--border-color)]'
                              : 'bg-zinc-200 text-zinc-500'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">
                            {profile.name}
                          </h4>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                            {profile.badge}
                          </span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          ACTIVE NOW
                        </span>
                      ) : isEnabled ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF6EF] text-[var(--text-secondary)] border border-[var(--border-color)] font-semibold">
                          IN FLEET
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          LOCKED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5">
                      {profile.tagline}
                    </p>

                    {/* Terminology Mini-Specs */}
                    <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--text-muted)] mb-5">
                      <div>
                        <span className="text-[9px] uppercase block text-[var(--text-muted)]">Billing Spec</span>
                        <span className="font-semibold text-[var(--text-primary)] truncate block">
                          {profile.terminology.bills.split('&')[0]}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase block text-[var(--text-muted)]">Sales Spec</span>
                        <span className="font-semibold text-[var(--text-primary)] truncate block">
                          {profile.terminology.sales.split('&')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Workspace Launcher Action */}
                    <div>
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-[#FAF6EF] text-[#9A3412] border border-[#9A3412]/30 text-xs font-bold font-mono cursor-default flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Current Active Workspace</span>
                        </button>
                      ) : isEnabled ? (
                        <button
                          onClick={() => handleSwitchWorkspace(profile.id)}
                          className="w-full py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <span>Switch to this Business</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : isStarter ? (
                        <button
                          onClick={handleUpgradeToGrowth}
                          className="w-full py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF6EF] text-[#9A3412] border border-[#9A3412]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Unlock with Growth ($99)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleVertical(profile.id)}
                          className="w-full py-2.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] text-[#9A3412] border border-[#9A3412]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>Swap into Growth Slots (3 Max)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Allocation & Quota Manager (For Growth Pack) */}
          {(isGrowth || isEnterprise) && (
            <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                <div>
                  <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-semibold">
                    Portfolio Allocation
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {isEnterprise
                      ? 'Enterprise Multi-Vertical Allocations'
                      : 'Growth Pack 3-Vertical Portfolio Manager'}
                  </h3>
                  {isGrowth && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Changing an active niche will prompt a confirmation to decommission and purge that niche's data.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF6EF] border border-[var(--border-color)] text-[#9A3412]">
                    Slots: {selectedVerticals.filter((v) => v !== 'all').length} /{' '}
                    {isEnterprise ? '5 (Unlimited)' : '3 Selected'}
                  </span>

                  {isGrowth && (
                    <button
                      onClick={handleSavePortfolio}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'Updating Fleet...' : 'Save Portfolio'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {availableVerticals.map((profile) => {
                  const Icon = iconMap[profile.id] || Building2;
                  const isChecked = selectedVerticals.includes(profile.id) || isEnterprise;
                  const isPrimary = profile.id === user?.companyType;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => {
                        if (!isEnterprise && !isPrimary) handleToggleVertical(profile.id);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isChecked
                          ? 'border-[#9A3412] bg-[#9A3412]/5 ring-1 ring-[#9A3412]'
                          : 'border-[var(--border-color)] bg-[#FAF6EF] hover:border-[#9A3412]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-4 h-4 text-[#9A3412]" />
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isEnterprise || isPrimary}
                          onChange={() => {}}
                          className="accent-[#9A3412] rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                          {profile.shortName}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                          {isPrimary
                            ? 'Primary Vertical'
                            : isChecked
                            ? 'Active in Fleet'
                            : 'Standby'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isGrowth && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                  <span>
                    Want to unlock all 5 business verticals simultaneously without slot swapping?
                  </span>
                  <button
                    onClick={handleUpgradeToEnterprise}
                    className="text-xs font-bold text-[#9A3412] hover:underline flex items-center gap-1"
                  >
                    <span>Upgrade to Highest Suite ($299/mo)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cross-Business Operations Summary Matrix */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-semibold">
                  Consolidated Telemetry
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Cross-Business Operational Matrix
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('dashboard')}
                className="text-xs font-semibold text-[#9A3412] hover:underline flex items-center gap-1"
              >
                <span>View Executive Pulse</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[11px] font-mono uppercase text-[var(--text-muted)]">
                    <th className="py-2.5 px-3">Business Entity</th>
                    <th className="py-2.5 px-3">Operating Vertical</th>
                    <th className="py-2.5 px-3">Workforce Spec</th>
                    <th className="py-2.5 px-3">Tenancy Isolation</th>
                    <th className="py-2.5 px-3 text-right">Workspace Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {availableVerticals
                    .filter((p) => selectedVerticals.includes(p.id) || isEnterprise)
                    .map((p) => {
                      const isCurrent = profileId === p.id;
                      const Icon = iconMap[p.id] || Building2;

                      return (
                        <tr key={p.id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#9A3412]" />
                            <span>{p.name}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[var(--text-secondary)]">
                            <span className="px-2 py-0.5 rounded bg-[#FAF6EF] border border-[var(--border-color)]">
                              {p.badge}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[var(--text-secondary)]">
                            {p.terminology.dealUnit} & {p.terminology.productUnit}
                          </td>
                          <td className="py-3 px-3 font-mono text-emerald-800">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Cryptographic Partition</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isCurrent ? (
                              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                Active Workspace
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSwitchWorkspace(p.id)}
                                className="text-[11px] font-bold text-[#9A3412] hover:text-[#7C2D12] hover:underline"
                              >
                                Switch Now &rarr;
                              </button>
                            )}
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

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ALL-BUSINESS FINANCIAL ANALYTICS (PROFIT & LOSS DIAGNOSTICS)    */}
      {/* ========================================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Executive Portfolio Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Portfolio Invoiced Revenue */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <span className="uppercase font-semibold">Portfolio Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
                {formatCurrency(analyticsData?.totalRevenue || 0)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Closed won deals across active businesses</span>
              </div>
            </div>

            {/* Total Operating Expenses & Bills */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <span className="uppercase font-semibold">Operating Expenses</span>
                <FileSpreadsheet className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
                {formatCurrency(analyticsData?.totalExpenses || 0)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <span>Facilities, supplies, cloud & payroll bills</span>
              </div>
            </div>

            {/* Consolidated Net Operating Profit / Loss */}
            <div
              className={`p-5 rounded-2xl border shadow-xs space-y-2 ${
                (analyticsData?.totalNetProfit || 0) >= 0
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span
                  className={`uppercase font-bold ${
                    (analyticsData?.totalNetProfit || 0) >= 0 ? 'text-emerald-800' : 'text-rose-800'
                  }`}
                >
                  Net Operating Profit
                </span>
                {(analyticsData?.totalNetProfit || 0) >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div
                className={`text-2xl font-black font-mono ${
                  (analyticsData?.totalNetProfit || 0) >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {formatCurrency(analyticsData?.totalNetProfit || 0)}
              </div>
              <div
                className={`text-[11px] font-semibold ${
                  (analyticsData?.totalNetProfit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                Portfolio Net Margin: {analyticsData?.portfolioMargin || 0}%
              </div>
            </div>

            {/* Health Classification Summary */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <span className="uppercase font-semibold">Entity Health Matrix</span>
                <Activity className="w-4 h-4 text-[#9A3412]" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                  {analyticsData?.profitableCount || profitableBusinesses.length} Profitable
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-mono text-xs font-bold border border-rose-200">
                  {analyticsData?.lossMakingCount || lossMakingBusinesses.length} Loss Making
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] pt-1">
                {activeFleetEntities.length} active business units in portfolio
              </div>
            </div>
          </div>

          {/* Section 1: PROFITABLE BUSINESSES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Profitable Businesses (Generating Positive Net Cashflow)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {profitableBusinesses.length} Entities
              </span>
            </div>

            {profitableBusinesses.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                No active business has recorded net positive closed revenue yet. Create closed won sales in your active workspaces to track profitability.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profitableBusinesses.map((entity) => {
                  const Icon = iconMap[entity.id] || Building2;
                  const isCurrent = profileId === entity.id;

                  return (
                    <div
                      key={entity.id}
                      className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-emerald-200 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{entity.name}</h4>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                              {entity.badge}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          PROFITABLE
                        </span>
                      </div>

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Net Profit</span>
                          <span className="text-base font-bold text-emerald-800 font-mono">
                            +{formatCurrency(entity.netProfit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Profit Margin</span>
                          <span className="text-base font-bold text-emerald-800 font-mono">
                            +{entity.profitMargin}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Revenue</span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {formatCurrency(entity.revenue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Expenses</span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {formatCurrency(entity.expenses)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[var(--text-muted)] text-[11px]">
                          {entity.wonDealsCount} Won Deals • {entity.billsCount} Bills
                        </span>
                        <button
                          onClick={() => handleSwitchWorkspace(entity.id)}
                          className="font-bold text-[#9A3412] hover:underline text-xs flex items-center gap-1"
                        >
                          <span>{isCurrent ? 'Current Workspace' : 'Inspect & Switch'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: LOSS MAKING BUSINESSES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-600" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Loss-Making & At-Risk Businesses (Operating In The Red)
                </h3>
              </div>
              <span className="text-xs font-mono text-rose-800 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {lossMakingBusinesses.length} Entities
              </span>
            </div>

            {lossMakingBusinesses.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                Great news! None of your active businesses are currently operating at a net loss.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lossMakingBusinesses.map((entity) => {
                  const Icon = iconMap[entity.id] || Building2;
                  const isCurrent = profileId === entity.id;

                  return (
                    <div
                      key={entity.id}
                      className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-rose-200 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{entity.name}</h4>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                              {entity.badge}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold font-mono">
                          <AlertOctagon className="w-3 h-3 text-rose-600" />
                          LOSS MAKING
                        </span>
                      </div>

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-rose-800 uppercase block font-semibold">Net Deficit</span>
                          <span className="text-base font-bold text-rose-800 font-mono">
                            {formatCurrency(entity.netProfit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-800 uppercase block font-semibold">Deficit Ratio</span>
                          <span className="text-base font-bold text-rose-800 font-mono">
                            {entity.profitMargin}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Revenue</span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {formatCurrency(entity.revenue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Expenses</span>
                          <span className="font-semibold text-rose-800">
                            {formatCurrency(entity.expenses)}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                        ⚠️ High liabilities detected: {formatCurrency(entity.pendingExpenses)} in pending/overdue payables. Reduce procurement burn.
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[var(--text-muted)] text-[11px]">
                          Pipeline: {formatCurrency(entity.pipelineValue)}
                        </span>
                        <button
                          onClick={() => handleSwitchWorkspace(entity.id)}
                          className="font-bold text-[#9A3412] hover:underline text-xs flex items-center gap-1"
                        >
                          <span>{isCurrent ? 'Current Workspace' : 'Switch & Fix'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Clean Slate / Standby Businesses */}
          {standbyBusinesses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-400" />
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Clean Slate / Standby Businesses (Fresh 0-Record Baseline)
                  </h3>
                </div>
                <span className="text-xs font-mono text-zinc-600 font-bold bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                  {standbyBusinesses.length} Standby
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {standbyBusinesses.map((entity) => {
                  const Icon = iconMap[entity.id] || Building2;
                  const isCurrent = profileId === entity.id;

                  return (
                    <div
                      key={entity.id}
                      className="p-5 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF6EF] text-[#9A3412] border border-[var(--border-color)] flex items-center justify-center font-bold">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{entity.name}</h4>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                              {entity.badge}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-bold font-mono">
                          CLEAN SLATE
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Operating with zero initial records. Ready to record sales transactions and purchase bills.
                      </p>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-color)]">
                        <span className="text-[var(--text-muted)] font-mono text-[11px]">
                          0 Invoices • 0 Deals
                        </span>
                        <button
                          onClick={() => handleSwitchWorkspace(entity.id)}
                          className="font-bold text-[#9A3412] hover:underline text-xs flex items-center gap-1"
                        >
                          <span>{isCurrent ? 'Current Workspace' : 'Open Workspace'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed All-Business Comparison Matrix Table */}
          <div className="rounded-2xl p-6 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-semibold">
                  Cross-Business Performance Ranking
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Portfolio Profit & Loss Leaderboard
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Ranked by net operating profitability
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[11px] font-mono uppercase text-[var(--text-muted)]">
                    <th className="py-2.5 px-3">Business Entity</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Operating Costs</th>
                    <th className="py-2.5 px-3 text-right">Net Profit / Loss</th>
                    <th className="py-2.5 px-3 text-right">Net Margin</th>
                    <th className="py-2.5 px-3 text-center">Financial Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {[...activeFleetEntities]
                    .sort((a, b) => b.netProfit - a.netProfit)
                    .map((entity) => {
                      const Icon = iconMap[entity.id] || Building2;
                      const isCurrent = profileId === entity.id;
                      const isProfit = entity.status === 'PROFITABLE';
                      const isLoss = entity.status === 'LOSS_MAKING';

                      return (
                        <tr key={entity.id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#9A3412]" />
                            <span>{entity.name}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[var(--text-secondary)]">
                            <span className="px-2 py-0.5 rounded bg-[#FAF6EF] border border-[var(--border-color)]">
                              {entity.badge}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-[var(--text-primary)]">
                            {formatCurrency(entity.revenue)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[var(--text-secondary)]">
                            {formatCurrency(entity.expenses)}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-mono font-bold ${
                              isProfit
                                ? 'text-emerald-800'
                                : isLoss
                                ? 'text-rose-800'
                                : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {isProfit ? `+${formatCurrency(entity.netProfit)}` : formatCurrency(entity.netProfit)}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-mono font-semibold ${
                              isProfit
                                ? 'text-emerald-800'
                                : isLoss
                                ? 'text-rose-800'
                                : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {entity.profitMargin}%
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {isProfit ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                PROFITABLE
                              </span>
                            ) : isLoss ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold">
                                LOSS MAKING
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px]">
                                CLEAN SLATE
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isCurrent ? (
                              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Current
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSwitchWorkspace(entity.id)}
                                className="text-[11px] font-bold text-[#9A3412] hover:text-[#7C2D12] hover:underline"
                              >
                                Switch &rarr;
                              </button>
                            )}
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

      {/* ========================================================================= */}
      {/* POPUP MODAL: NICHE CHANGE & DATA PURGE WARNING (GROWTH PACK)             */}
      {/* ========================================================================= */}
      {purgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFFFF] border border-[var(--border-strong)] p-6 sm:p-7 shadow-2xl relative space-y-5 text-[var(--text-primary)]">
            {/* Close Button */}
            <button
              onClick={() => setPurgeModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#FAF6EF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-800 flex-shrink-0">
                <Trash2 className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-rose-800 font-bold tracking-wider">
                  ⚠️ Growth Pack Niche Replacement
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Confirm Niche Decommission & Data Purge
                </h3>
              </div>
            </div>

            {/* Explanatory Notice */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed space-y-2">
              <p className="font-bold">
                Warning: Changing your active business vertical slot will permanently purge data!
              </p>
              <p className="text-[11px] text-rose-800 leading-snug">
                Your Growth Pack license permits up to 3 simultaneous business verticals. Decommissioning an active vertical completely wipes all of its transaction records, invoices, sales pipeline, inventory stock, and customer accounts to provision a clean slate for the incoming niche.
              </p>
            </div>

            {/* Choice of Which Niche to Replace (If user has multiple active niches) */}
            {purgeModal.availableOutgoing && purgeModal.availableOutgoing.length > 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--text-primary)]">
                  Select which active niche vertical to decommission & purge:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {purgeModal.availableOutgoing.map((outId) => {
                    const prof = BUSINESS_PROFILES[outId] || { name: outId };
                    const isSelected = selectedOutgoing === outId;

                    return (
                      <button
                        key={outId}
                        type="button"
                        onClick={() => setSelectedOutgoing(outId)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600'
                            : 'border-[var(--border-color)] bg-[#FAF6EF] text-[var(--text-primary)] hover:border-rose-300'
                        }`}
                      >
                        <span className="truncate">{prof.name}</span>
                        {isSelected && <Trash2 className="w-3.5 h-3.5 text-rose-700 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Niche Swap Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Outgoing Niche */}
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold font-mono text-[10px] uppercase">
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Decommissioning Niche</span>
                </div>
                <div className="font-bold text-rose-900 text-sm">
                  {BUSINESS_PROFILES[selectedOutgoing]?.name || selectedOutgoing}
                </div>
                <span className="text-[10px] text-rose-700 block font-mono">
                  All bills, sales & SKU data will be purged to 0.
                </span>
              </div>

              {/* Incoming Niche */}
              {purgeModal.incomingNiche ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-mono text-[10px] uppercase">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Incoming New Niche</span>
                  </div>
                  <div className="font-bold text-emerald-900 text-sm">
                    {BUSINESS_PROFILES[purgeModal.incomingNiche]?.name || purgeModal.incomingNiche}
                  </div>
                  <span className="text-[10px] text-emerald-700 block font-mono">
                    Provisioned with fresh 0-record clean slate.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">
                    Slot Status
                  </span>
                  <div className="font-bold text-zinc-700 text-sm">Slot Freed Up</div>
                  <span className="text-[10px] text-zinc-500 block font-mono">
                    You can activate another niche anytime.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={handleConfirmPurgeAndSwap}
                disabled={isPurging || !selectedOutgoing}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isPurging
                    ? 'Purging Niche Data...'
                    : `Confirm Swap & Purge ${BUSINESS_PROFILES[selectedOutgoing]?.shortName || selectedOutgoing}`}
                </span>
              </button>

              <button
                onClick={() => setPurgeModal(null)}
                disabled={isPurging}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs transition-colors"
              >
                Cancel / Retain Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleBusinessView;
