import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Zap,
  Building2,
  Check,
} from 'lucide-react';
import { StatCard } from '../../shared/components/StatCard';
import { GlassCard } from '../../shared/components/GlassCard';
import { ChartSparkline } from '../../shared/components/ChartSparkline';
import { formatCurrency, formatCompactNumber } from '../../shared/utils/formatters';
import { dashboardService } from './DashboardService';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import './DashboardStyles.css';

export const DashboardView = ({ onNavigateTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profileId, activeProfile, terminology } = useBusinessProfile();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dashboardService.fetchSummary(profileId).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [profileId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin" />
          <span className="text-xs font-mono text-[var(--text-muted)]">Loading {activeProfile.name} Telemetry...</span>
        </div>
      </div>
    );
  }

  const { kpis, quickAlerts, recentActivity } = data;

  return (
    <div className="space-y-8">
      {/* Hero Executive Banner */}
      <div className="dashboard-hero-card rounded-3xl p-6 sm:p-8 overflow-hidden relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#9A3412]">
              <Zap className="w-3.5 h-3.5" />
              <span>{activeProfile.badge} • REAL-TIME OPERATING TELEMETRY</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {activeProfile.name}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              {activeProfile.tagline}. Multi-tenant BMS modules adapt dynamically to your inventory units, sales pipeline, and accounts payable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-[#FFFFFF] border border-[var(--border-strong)] shadow-xs">
              <span className="text-[11px] font-mono uppercase text-[var(--text-muted)]">Monthly Run Rate</span>
              <div className="text-2xl font-black text-[var(--text-primary)] font-mono">
                {formatCurrency(kpis.mrr)}
              </div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-[#9A3412]/10 border border-[#9A3412]/25 shadow-xs">
              <span className="text-[11px] font-mono uppercase text-[#9A3412] font-semibold">Annual Run Rate</span>
              <div className="text-2xl font-black text-[#9A3412] font-mono">
                {formatCurrency(kpis.arr)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={profileId === 'shop' ? 'Counter Monthly Volume' : profileId === 'factory' ? 'Monthly Production Value' : 'Monthly Recurring Revenue'}
          value={kpis.mrr}
          formattedValue={formatCurrency(kpis.mrr)}
          change={`+${kpis.growthMoM}%`}
          isPositive={true}
          icon={TrendingUp}
          accentColor="brand"
        />
        <StatCard
          title={terminology.sales}
          value={kpis.pipelineValue}
          formattedValue={formatCurrency(kpis.pipelineValue)}
          change={`${formatCompactNumber(kpis.closedWonValue)} won`}
          isPositive={true}
          icon={DollarSign}
          accentColor="emerald"
        />
        <StatCard
          title={terminology.bills}
          value={kpis.unpaidBillsAmount}
          formattedValue={formatCurrency(kpis.unpaidBillsAmount)}
          change={`${kpis.unpaidBillsCount} Due`}
          isPositive={false}
          icon={CreditCard}
          accentColor="rose"
        />
        <StatCard
          title={terminology.customers}
          value={kpis.activeCustomers}
          formattedValue={`${kpis.activeCustomers} / ${kpis.totalCustomers}`}
          change={`${terminology.customerUnit}`}
          isPositive={true}
          icon={Users}
          accentColor="gold"
        />
      </div>

      {/* Charts & Cross-Module Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Financial Velocity Graph */}
        <div className="lg:col-span-2 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-semibold">
                {activeProfile.shortName} Financial Momentum
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Operational Revenue & Conversion Velocity</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6EF] border border-[var(--border-color)] text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#9A3412]" />
                <span className="text-[var(--text-secondary)]">Velocity:</span>
                <span className="font-bold text-[#9A3412]">
                  {formatCurrency(data.velocitySeries?.currentVelocity ?? kpis.closedWonValue ?? 0)}
                </span>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('revenue')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#9A3412] hover:text-[#7C2D12] transition-colors"
              >
                <span>Detailed Breakdown</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <ChartSparkline
              data={data.velocitySeries?.data || (kpis.closedWonValue > 0 ? [Math.round(kpis.closedWonValue * 0.52), Math.round(kpis.closedWonValue * 0.64), Math.round(kpis.closedWonValue * 0.75), Math.round(kpis.closedWonValue * 0.84), Math.round(kpis.closedWonValue * 0.93), kpis.closedWonValue] : [0, 0, 0, 0, 0, 0])}
              labels={data.velocitySeries?.labels || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
              height={180}
              strokeColor="#9A3412"
              valuePrefix="₹"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-color)] grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] text-[var(--text-muted)]">Net Operating Margin</div>
              <div className="text-base font-bold text-emerald-700 font-mono">
                {kpis.closedWonValue > 0
                  ? (profileId === 'factory' ? '42.8%' : profileId === 'industry' ? '36.5%' : '82.4%')
                  : '0.0%'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--text-muted)]">Growth MoM</div>
              <div className="text-base font-bold text-[#9A3412] font-mono">
                {kpis.growthMoM > 0 ? `+${kpis.growthMoM}%` : '0.0%'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--text-muted)]">Inventory Alerts</div>
              <div className="text-base font-bold text-amber-700 font-mono">
                {kpis.lowStockAlerts > 0 ? `${kpis.lowStockAlerts} Below Threshold` : 'All Stock Healthy'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Alerts & System Health */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Action Required
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-500/25 font-semibold">
                {quickAlerts.length} Active
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {quickAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    const target = alert.link.replace('/', '');
                    onNavigateTab && onNavigateTab(target);
                  }}
                  className="p-3 rounded-xl bg-[#FAF6EF] hover:bg-[#F2ECE2] border border-[var(--border-color)] cursor-pointer transition-all flex items-start justify-between gap-3 group"
                >
                  <p className="text-xs text-[var(--text-secondary)] leading-snug group-hover:text-[var(--text-primary)] transition-colors font-medium">
                    {alert.text}
                  </p>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#9A3412] shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigator */}
          <div className="rounded-2xl bg-[#FAF6EF] border border-[var(--border-strong)] p-5 shadow-[var(--shadow-card)]">
            <span className="text-xs font-bold text-[#9A3412] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#9A3412]" />
              {activeProfile.shortName} Operational Hubs
            </span>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab && onNavigateTab('bills')}
                className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F5EFE6] border border-[var(--border-color)] text-left text-[var(--text-primary)] font-medium transition-colors truncate shadow-2xs"
              >
                🧾 {terminology.bills.split('&')[0].trim()}
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('sales')}
                className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F5EFE6] border border-[var(--border-color)] text-left text-[var(--text-primary)] font-medium transition-colors truncate shadow-2xs"
              >
                💼 {terminology.sales.split('&')[0].trim()}
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('products')}
                className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F5EFE6] border border-[var(--border-color)] text-left text-[var(--text-primary)] font-medium transition-colors truncate shadow-2xs"
              >
                📦 {terminology.products.split('&')[0].trim()}
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('stock')}
                className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F5EFE6] border border-[var(--border-color)] text-left text-[var(--text-primary)] font-medium transition-colors truncate shadow-2xs"
              >
                🏭 {terminology.stock.split('&')[0].trim()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Module Recent Activity Feed */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-semibold">Audit Log</span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Live {activeProfile.shortName} Activity Stream</h3>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">Auto-synced</span>
        </div>

        <div className="mt-5 space-y-4">
          {recentActivity.map((act) => (
            <div key={act.id} className="activity-node flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                <span className="text-sm">
                  {act.module === 'sales'
                    ? '💰'
                    : act.module === 'stock'
                    ? '📦'
                    : act.module === 'bills'
                    ? '🧾'
                    : '👥'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
                    {act.title}
                  </span>
                  {act.amount && (
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      +{formatCurrency(act.amount)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted)]">
                  <span className="uppercase font-mono text-[#9A3412] font-semibold">{act.module}</span>
                  <span>•</span>
                  <span>{act.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
