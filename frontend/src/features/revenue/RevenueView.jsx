import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChart,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
  ShieldAlert,
  Sparkles,
  Lock,
  Zap,
} from 'lucide-react';
import { StatCard } from '../../shared/components/StatCard';
import { ChartSparkline } from '../../shared/components/ChartSparkline';
import { formatCurrency, formatCompactNumber } from '../../shared/utils/formatters';
import { revenueService } from './RevenueService';
import { revenueAnimations } from './RevenueAnimations';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { useAuth } from '../../core/contexts/AuthContext';
import './RevenueStyles.css';

export const RevenueView = () => {
  const { profileId, terminology, activeProfile } = useBusinessProfile();
  const { user, can } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!can('viewRevenue')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] p-8 text-center bg-[#FFFFFF] rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-card)] space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#9A3412]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3ECE0] text-[#9A3412] border border-[var(--border-color)] text-xs font-mono font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>FINANCIAL ACCESS RESTRICTED</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
          Financial Analytics Restricted
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
          Your active account role is <span className="text-[#9A3412] font-bold uppercase">{user?.role}</span>. Executive revenue streams, corporate balance sheets, and MRR projections are reserved for <strong className="text-[var(--text-primary)]">Admin</strong> and <strong className="text-[var(--text-primary)]">Auditor</strong> personnel of your organization.
        </p>
      </div>
    );
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    revenueService.getAnalytics(profileId).then((res) => {
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
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Financial Model...</span>
        </div>
      </div>
    );
  }

  const { overview, monthlyTrends, revenueStreams } = data;

  const mrrSeries = monthlyTrends.map((t) => t.mrr);
  const monthLabels = monthlyTrends.map((t) => t.month);

  return (
    <motion.div
      variants={revenueAnimations.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={overview.mrr}
          formattedValue={formatCurrency(overview.mrr)}
          change={`+${overview.growthRateMoM}% MoM`}
          isPositive={true}
          icon={TrendingUp}
          accentColor="indigo"
        />
        <StatCard
          title="Annualized Run Rate (ARR)"
          value={overview.arr}
          formattedValue={formatCurrency(overview.arr)}
          change="842 Paid Seats"
          isPositive={true}
          icon={DollarSign}
          accentColor="cyan"
        />
        <StatCard
          title="Gross Margin"
          value={overview.grossMargin}
          formattedValue={`${overview.grossMargin}%`}
          change="+3.2% vs target"
          isPositive={true}
          icon={Percent}
          accentColor="emerald"
        />
        <StatCard
          title="Net Logo Churn"
          value={overview.churnRate}
          formattedValue={`${overview.churnRate}%`}
          change="Industry leading"
          isPositive={true}
          icon={Shield}
          accentColor="amber"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Curve */}
        <div className="lg:col-span-2 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-semibold">
                MRR Expansion Telemetry
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Trailing 6 Months ARR Acceleration</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9A3412]" />
              <span className="text-xs font-mono text-[var(--text-secondary)]">Net MRR Growth</span>
            </div>
          </div>

          <div className="mt-6">
            <ChartSparkline
              data={mrrSeries}
              labels={monthLabels}
              height={190}
              strokeColor="#9A3412"
              valuePrefix="₹"
            />
          </div>

          {/* Month by Month Comparative Table */}
          <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Monthly P&L Run Performance
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {monthlyTrends.map((m) => (
                <div
                  key={m.month}
                  className="p-3 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-center shadow-2xs"
                >
                  <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                    {m.month}
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] font-mono mt-1">
                    {formatCompactNumber(m.revenue)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-semibold">
                    +{formatCompactNumber(m.profit)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Streams Breakdown */}
        <div className="rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#9A3412]" />
                Revenue Streams
              </h3>
              <span className="text-xs font-mono text-[var(--text-muted)]">Q4 Breakdown</span>
            </div>

            <div className="mt-5 space-y-4">
              {revenueStreams.map((stream, idx) => {
                const colors = ['bg-[#9A3412]', 'bg-[#B4833E]', 'bg-[#15803D]', 'bg-[#8B263E]'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={stream.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-secondary)] truncate max-w-[180px]">
                        {stream.category}
                      </span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {formatCurrency(stream.amount)}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-[#E5DDD0] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${stream.percentage}%` }}
                      />
                    </div>

                    <div className="text-[10px] font-mono text-[var(--text-muted)] text-right">
                      {stream.percentage}% of overall gross revenue
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[#FAF6EF] border border-[var(--border-strong)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#9A3412] font-semibold">
                  Target Run Rate
                </span>
                <div className="text-lg font-black text-[var(--text-primary)] font-mono mt-0.5">$250,000 / mo</div>
              </div>
              <span className="text-xs font-mono text-[#9A3412] font-bold">73.8% to Target</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
