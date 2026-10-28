import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BadgeDollarSign,
  PackageOpen,
  LineChart,
  Users2,
  Boxes,
  Sparkles,
  Building2,
  Lock,
  Landmark,
  Crown,
  CreditCard,
  Users,
  X,
} from 'lucide-react';
import { useBusinessProfile } from '../contexts/BusinessProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { getRoleInfo } from '../config/systemConfig';

export const navigationItems = [
  { id: 'dashboard', label: 'Executive Pulse', icon: LayoutDashboard, badge: 'Live', badgeColor: 'emerald' },
  { id: 'multibusiness', label: 'Multi-Business Hub', icon: Building2 },
  { id: 'financials', label: 'CFO & Financial Health', icon: Landmark, badge: 'CFO', badgeColor: 'emerald' },
  { id: 'bills', label: 'Bills & Invoicing', icon: ReceiptText },
  { id: 'sales', label: 'Sales & Deals', icon: BadgeDollarSign },
  { id: 'products', label: 'Product Catalog', icon: PackageOpen },
  { id: 'revenue', label: 'Revenue & MRR', icon: LineChart },
  { id: 'customers', label: 'Customer CRM', icon: Users2 },
  { id: 'stock', label: 'Stock & Inventory', icon: Boxes },
  { id: 'employees', label: 'Company Staff', icon: Users, badge: 'Admin', adminOnly: true },
  { id: 'payments', label: 'Payments & Plan', icon: CreditCard },
];

export const Sidebar = ({ activeTab, onSelectTab, isCollapsed, onToggleCollapse, onCloseMobile, onOpenSuperAdmin }) => {
  const { activeProfile, terminology } = useBusinessProfile();
  const { user, can } = useAuth();

  return (
    <aside
      className={`relative z-30 flex flex-col h-screen transition-all duration-300 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-[72px] px-5 border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-brand)] shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[var(--bg-secondary)]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                  ZSYIO BMS
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#9A3412]/30 bg-[#9A3412]/10 text-[#9A3412] font-bold">
                  {activeProfile.badge || 'PRO'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{activeProfile.name}</p>
            </div>
          )}
        </div>

        {/* Mobile Drawer Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all flex-shrink-0 ml-2"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {!isCollapsed ? `${activeProfile.shortName} Modules` : 'Apps'}
        </div>

        {navigationItems.map((item) => {
          if (item.adminOnly && !(user?.role === 'admin' || user?.role === 'superadmin')) {
            return null;
          }
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const customLabel = item.id === 'dashboard' ? 'Executive Pulse' : terminology[item.id] || item.label;
          const isRestricted = item.id === 'revenue' && typeof can === 'function' && !can('viewRevenue');
          const isMulti = item.id === 'multibusiness';
          const dynamicBadge = isMulti
            ? (user?.planTier === 'enterprise'
                ? { text: 'Unlimited', color: 'emerald' }
                : user?.planTier === 'growth'
                ? { text: '3 Verticals', color: 'brand' }
                : { text: '3 Slots', color: 'brand' })
            : null;
          const displayBadge = dynamicBadge ? dynamicBadge.text : item.badge;
          const displayColor = dynamicBadge ? dynamicBadge.color : item.badgeColor;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'text-[var(--text-primary)] bg-[#FFFFFF] border border-[var(--border-strong)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-transparent'
              }`}
            >
              {/* Active Indicator Bar (Solid) */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[var(--accent-brand)] rounded-r-full" />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#9A3412]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                }`}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate text-xs">{customLabel}</span>
                  {isRestricted ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 border border-rose-500/20 flex-shrink-0 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Staff Lock</span>
                    </span>
                  ) : (
                    displayBadge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          displayColor === 'emerald'
                            ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                            : 'bg-[#9A3412]/10 text-[#9A3412] border border-[#9A3412]/20'
                        }`}
                      >
                        {displayBadge}
                      </span>
                    )
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Compact Vertical Indicator */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-[#B4833E] flex-shrink-0" />
              <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{activeProfile.shortName}</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#9A3412]/20 bg-[#9A3412]/10 text-[#9A3412] font-semibold">
              {activeProfile.badge}
            </span>
          </div>
        </div>
      )}

      {/* SaaS Platform Panel Quick Access (Owner Only - Hidden to Regular Users) */}
      {user?.role === 'superadmin' && (
        <div className="px-3 pb-2">
          <button
            onClick={() => onSelectTab('admin_panel')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all group active:scale-95 shadow-xs ${
              activeTab === 'admin_panel'
                ? 'bg-[#9A3412] text-white border-[#9A3412]'
                : 'bg-[#FFFFFF] hover:bg-[var(--bg-surface-hover)] border-[var(--border-strong)] text-[var(--text-primary)]'
            }`}
            title="Open BMS Platform Governance Page"
          >
            <span className="flex items-center gap-2">
              <Crown className={`w-4 h-4 ${activeTab === 'admin_panel' ? 'text-white' : 'text-[#B4833E]'}`} />
              {!isCollapsed && <span>Platform Governance</span>}
            </span>
            {!isCollapsed && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activeTab === 'admin_panel'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#9A3412]/10 text-[#9A3412] border border-[#9A3412]/20'
                }`}
              >
                Owner
              </span>
            )}
          </button>
        </div>
      )}

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-xs">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#9A3412]/30 flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-emerald-800 font-mono flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="uppercase font-bold">{getRoleInfo(user?.role).shortLabel}</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="truncate text-[var(--text-muted)] capitalize">{user?.companyType || 'all'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
