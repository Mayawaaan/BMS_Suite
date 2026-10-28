import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Layers,
  Store,
  Factory,
  HardHat,
  Cpu,
  ShoppingBag,
  Check,
  Building2,
  LogOut,
  Shield,
  User,
  Users,
  Sparkles,
  Lock,
  Crown,
  X,
  Menu,
} from 'lucide-react';
import { useBusinessProfile } from '../contexts/BusinessProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { getRoleInfo } from '../config/systemConfig';

const iconMap = {
  Layers,
  Store,
  Factory,
  HardHat,
  Cpu,
  ShoppingBag,
};

export const Header = ({
  activeTitle,
  onSelectTab,
  onToggleMobileMenu,
  onOpenQuickAction,
  onGlobalSearch,
  apiStatus = { online: true, fallback: false },
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVerticalSelector, setShowVerticalSelector] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lockedModal, setLockedModal] = useState(null);

  const { profileId, activeProfile, profiles, switchProfile } = useBusinessProfile();
  const { user, logout, switchCompanyType, isPlatformOwner } = useAuth();

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const canSwitchVertical = isPlatformOwner || user?.role === 'superadmin' || user?.companyType === 'all';

  const getVerticalLockStatus = (profile) => {
    if (isPlatformOwner || user?.role === 'superadmin') {
      return { isLocked: false };
    }

    const planTier = user?.planTier || 'starter';
    const allowed = user?.allowedVerticals || [user?.companyType || 'shop'];
    const maxBusinesses = user?.maxBusinesses || (planTier === 'enterprise' ? 99 : planTier === 'growth' ? 3 : 1);

    if (profile.id === 'all' && planTier !== 'enterprise') {
      return {
        isLocked: true,
        badge: 'Enterprise Only',
        reason: 'Universal Multi-Vertical mode requires an Enterprise subscription.',
        requiredTier: 'enterprise',
        maxBusinesses,
      };
    }

    if (!allowed.includes(profile.id)) {
      const isSingleBusiness = maxBusinesses <= 1;
      return {
        isLocked: true,
        badge: isSingleBusiness ? 'Locked • 1 Store' : `Locked • Max ${maxBusinesses} Stores`,
        reason: isSingleBusiness
          ? `Your subscription (${planTier.toUpperCase()}) allows 1 business (${activeProfile.name}). Upgrade to Growth to unlock ${profile.name}.`
          : `Your subscription has reached its limit of ${maxBusinesses} businesses. Upgrade to Enterprise to unlock all verticals.`,
        requiredTier: isSingleBusiness ? 'growth' : 'enterprise',
        maxBusinesses,
      };
    }

    return { isLocked: false };
  };

  const notifications = [
    { id: 1, title: 'Receivables Settled', desc: 'Retail POS register batch remitted successfully', time: '12m ago', unread: true },
    { id: 2, title: 'Quota Status', desc: 'Organization database partition operating within safety limits', time: '1h ago', unread: true },
    { id: 3, title: 'Telemetry Live', desc: 'Zero uncollected receivables on active store registers', time: '3h ago', unread: false },
  ];

  // Outside click listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowVerticalSelector(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const CurrentIcon = iconMap[activeProfile.icon] || Building2;

  return (
    <header className="sticky top-0 z-20 w-full h-16 shrink-0 bg-[#FFFFFF] border-b border-[var(--border-color)] shadow-xs">
      <div className="w-full max-w-[1600px] mx-auto h-full px-3 sm:px-5 lg:px-7 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        
        {/* Left Section: Mobile Menu + Title & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 max-w-[220px] sm:max-w-xs md:max-w-sm lg:max-w-md">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex-shrink-0"
            title="Toggle Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)] leading-none truncate">
              <span>ZSYIO BMS</span>
              <span>/</span>
              <span className="uppercase font-semibold text-[#9A3412] truncate">{activeProfile.shortName}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 min-w-0">
              <h1
                className="text-xs sm:text-sm lg:text-base font-bold text-[var(--text-primary)] truncate tracking-tight leading-tight"
                title={activeTitle}
              >
                {activeTitle}
              </h1>
              <span
                className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 animate-pulse hidden xs:inline-block"
                title="System Operational & Live"
              />
            </div>
          </div>
        </div>

        {/* Center Section: Responsive Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs justify-center px-2 min-w-0">
          <div className="relative w-full max-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search records, SKUs..."
              onChange={(e) => onGlobalSearch && onGlobalSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#9A3412] focus:bg-[#FFFFFF] transition-all"
            />
          </div>
        </div>

        {/* Right Section: Compact Responsive Action Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Operating Vertical Selector Popover */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVerticalSelector(!showVerticalSelector)}
              className="h-9 flex items-center gap-1.5 px-2.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold transition-all active:scale-95"
              title="Switch Operating Business Vertical"
            >
              <CurrentIcon className="w-3.5 h-3.5 text-[#9A3412] flex-shrink-0" />
              <span className="hidden sm:inline truncate max-w-[110px]">
                {activeProfile.shortName || activeProfile.name}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${
                  showVerticalSelector ? 'rotate-180 text-[#9A3412]' : ''
                }`}
              />
            </button>

            {/* Vertical Selector Dropdown Menu */}
            {showVerticalSelector && (
              <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)] px-1">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] block">
                      Operating Vertical
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Switch business terminology
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FAF6EF] text-[#9A3412] border border-[var(--border-color)]">
                    {profiles.length} Modes
                  </span>
                </div>

                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {profiles.map((profile) => {
                    const IconComponent = iconMap[profile.icon] || Building2;
                    const isSelected = profile.id === profileId;
                    const lockStatus = getVerticalLockStatus(profile);

                    return (
                      <button
                        key={profile.id}
                        onClick={() => {
                          if (lockStatus.isLocked) {
                            setLockedModal({ profile, ...lockStatus });
                            setShowVerticalSelector(false);
                            return;
                          }
                          switchProfile(profile.id);
                          if (switchCompanyType && profile.id !== 'all') {
                            switchCompanyType(profile.id);
                          }
                          setShowVerticalSelector(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[#9A3412]/10 text-[#9A3412] font-bold border border-[#9A3412]/20'
                            : lockStatus.isLocked
                            ? 'opacity-60 text-[var(--text-muted)] hover:opacity-100 hover:bg-[#FAF6EF]'
                            : 'hover:bg-[#FAF6EF] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#9A3412]' : 'text-[var(--text-muted)]'}`} />
                          <span className="truncate">{profile.name}</span>
                        </div>
                        {lockStatus.isLocked && <Lock className="w-3 h-3 text-amber-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Direct Link to Multi-Business Portfolio Hub */}
                <div className="pt-2 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      setShowVerticalSelector(false);
                      if (onSelectTab) onSelectTab('multibusiness');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] text-[#9A3412] text-xs font-bold border border-[#9A3412]/20 transition-all group"
                  >
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span>Multi-Business Hub</span>
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[#9A3412] transition-colors">
                      {user?.planTier === 'enterprise' ? 'All (5)' : user?.planTier === 'growth' ? '3 Active' : 'Upgrade ↗'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Platform Governance Link (Owner Only) */}
          {user?.role === 'superadmin' && (
            <button
              onClick={() => onSelectTab && onSelectTab('admin_panel')}
              className="h-9 flex items-center gap-1.5 px-2.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#9A3412] border border-[#FDE68A] text-xs font-bold transition-all active:scale-95"
              title="Open Platform Governance Page"
            >
              <Crown className="w-3.5 h-3.5 text-[#9A3412]" />
              <span className="hidden md:inline">Platform Admin</span>
            </button>
          )}

          {/* Global Quick Action Button */}
          <button
            onClick={onOpenQuickAction}
            className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Create New Operational Transaction"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Action</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#9A3412]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    System Alerts
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">3 Updates</span>
                </div>
                <div className="space-y-1.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-primary)]">{n.title}</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-9 flex items-center gap-2 pl-2 pr-1 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] transition-all"
                title="Account Menu"
              >
                <div className="text-right hidden xl:block min-w-0 max-w-[100px]">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate leading-none">
                    {user.name}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase text-[#9A3412] mt-0.5 leading-none">
                    {getRoleInfo(user.role).shortLabel}
                  </div>
                </div>

                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-[var(--border-color)] flex-shrink-0"
                />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-3">
                  <div className="pb-3 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-[var(--border-color)]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name}</div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">{user.email}</div>
                        <div className="text-[10px] text-[#9A3412] font-semibold mt-0.5 truncate">{user.companyName}</div>
                      </div>
                    </div>
                  </div>

                  {/* Owner Platform Governance Link */}
                  {user?.role === 'superadmin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onSelectTab) onSelectTab('admin_panel');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#9A3412] border border-[#FDE68A] text-xs font-bold transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 text-[#9A3412]" />
                        <span>Platform Governance</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#9A3412]/10 text-[#9A3412] font-mono">
                        Owner
                      </span>
                    </button>
                  )}

                  {/* Company Employee Management (Company Admin / Superadmin) */}
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onSelectTab) onSelectTab('employees');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[#9A3412]/40 text-xs font-semibold transition-all group shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#9A3412]" />
                        <span>Manage Employees</span>
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[#9A3412]/10 text-[#9A3412] font-mono font-bold">
                        Staff & Team
                      </span>
                    </button>
                  )}

                  {/* Log Out Button */}
                  <div className="pt-2 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF6EF] hover:bg-rose-50 border border-[var(--border-color)] hover:border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Switch Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subscription & Business Quota Locked Modal */}
      {lockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[var(--border-strong)] p-6 shadow-2xl relative space-y-4 text-[var(--text-primary)]">
            <button
              onClick={() => setLockedModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#FAF6EF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-800 font-bold tracking-wider">
                  Subscription Quota
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {lockedModal.profile.name} is Locked
                </h3>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Current Plan:</span>
                <span className="font-mono font-bold text-[var(--text-primary)] uppercase">
                  {user?.planTier || 'Starter'} Tier
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Allowed Stores:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {lockedModal.maxBusinesses} Store{lockedModal.maxBusinesses > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {lockedModal.reason}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setLockedModal(null);
                  if (onSelectTab) onSelectTab('multibusiness');
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <Building2 className="w-4 h-4" />
                <span>Multi-Business Hub</span>
              </button>
              <button
                onClick={() => {
                  setLockedModal(null);
                  if (onSelectTab) onSelectTab('payments');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-[#9A3412]" />
                <span>Upgrade Plan</span>
              </button>
              <button
                onClick={() => setLockedModal(null)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
