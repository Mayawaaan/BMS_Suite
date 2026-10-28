import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Landmark,
  BadgeDollarSign,
  PieChart,
  Percent,
  Activity,
  Layers,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Wallet,
  Clock,
  CircleDollarSign,
  Building,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { financialsService } from './FinancialsService';
import { useAuth } from '../../core/contexts/AuthContext';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { formatCurrency } from '../../shared/utils/formatters';
import './FinancialsStyles.css';

export const FinancialsView = () => {
  const { user } = useAuth();
  const { activeProfile } = useBusinessProfile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Valuation Simulator state
  const [ebitdaMultipleSlider, setEbitdaMultipleSlider] = useState(8.5);
  const [revenueMultipleSlider, setRevenueMultipleSlider] = useState(5.2);

  const fetchMetrics = async (fresh = false) => {
    try {
      const res = await financialsService.getExecutiveHealth(fresh);
      if (res) setData(res);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMetrics(true);
  }, [activeProfile?.id, user?.tenantId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics(true);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[#9A3412]/20 border-t-[#9A3412] animate-spin" />
        <span className="text-xs font-mono text-[var(--text-muted)]">Auditing Corporate Ledger & Solvency Ratios...</span>
      </div>
    );
  }

  const {
    headlineKpis,
    profitability,
    efficiencyAndReturns,
    balanceSheetOverview,
    liquidityAndSolvency,
    valuationMultiples,
  } = data;

  // Dynamic Valuation simulation calculations - purely calculated from real metrics
  const currentEbitda = Number(profitability?.ebitda) || 0;
  const currentRevenue = Number(profitability?.grossRevenue) || 0;
  const simulatedEbitdaValuation = Math.round(currentEbitda * ebitdaMultipleSlider);
  const simulatedRevenueValuation = Math.round(currentRevenue * revenueMultipleSlider);
  const blendedSimulatedValuation = Math.round(simulatedEbitdaValuation * 0.6 + simulatedRevenueValuation * 0.4);

  const isZeroState = currentRevenue === 0 && (Number(balanceSheetOverview?.totalAssets) || 0) === 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Intelligence Header (Solid Ivory Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FFFFFF] border border-[var(--border-strong)] shadow-[var(--shadow-card)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold badge-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              CFO EXECUTIVE INTELLIGENCE
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              As of {data.asOfDate || new Date().toISOString().split('T')[0]}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            Financial Health, Net Worth & Valuation
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Consolidated cross-ledger telemetry: EBITDA margin, Net Worth solvency, return on capital (ROI/ROA/ROE), liquidity ratios, and corporate valuation multiples.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--accent-brand)]' : ''}`} />
            <span>Recalculate Ratios</span>
          </button>
        </div>
      </div>

      {/* Zero State Alert Banner for Empty Accounts */}
      {isZeroState && (
        <div className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl badge-warning shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Clean State Detected — 0 Ledger Entries</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded badge-warning">
                  Ready For Real Data
                </span>
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                This business currently has no posted bills or won sales. All financial metrics (EBITDA, Net Profit, ROI, Net Worth) calculate dynamically at ₹0 without placeholder fallbacks. Create new products, sales, or supplier bills to see real-time calculated ratios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Core Five Business Numbers Grid (Solid Ivory Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* EBITDA */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">EBITDA</span>
              <div className="p-2 rounded-xl badge-success">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-mono">{headlineKpis.ebitda.formatted}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-color)] text-xs">
            <span className="text-[var(--text-muted)]">Margin</span>
            <span className="font-bold text-emerald-800 font-mono">{headlineKpis.ebitda.margin}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">Net Profit</span>
              <div className="p-2 rounded-xl badge-brand">
                <CircleDollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-mono">{headlineKpis.netProfit.formatted}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-color)] text-xs">
            <span className="text-[var(--text-muted)]">Net Margin</span>
            <span className="font-bold text-[var(--accent-brand)] font-mono">{headlineKpis.netProfit.margin}</span>
          </div>
        </div>

        {/* Net Worth */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">Net Worth</span>
              <div className="p-2 rounded-xl badge-info">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-mono">{headlineKpis.netWorth.formatted}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-color)] text-xs">
            <span className="text-[var(--text-muted)]">Book Equity</span>
            <span className="font-bold text-sky-800 font-mono">Assets - Liab</span>
          </div>
        </div>

        {/* Return on Investment (ROI) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">ROI Rate</span>
              <div className="p-2 rounded-xl badge-warning">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-mono">{headlineKpis.roi.formatted}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-color)] text-xs">
            <span className="text-[var(--text-muted)]">Capital Return</span>
            <span className="font-bold text-amber-800 font-mono">Annualized</span>
          </div>
        </div>

        {/* Enterprise Valuation */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)]">Enterprise Value</span>
              <div className="p-2 rounded-xl badge-brand">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-mono">{headlineKpis.enterpriseValuation.formatted}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-color)] text-xs">
            <span className="text-[var(--text-muted)]">Multiple</span>
            <span className="font-bold text-[var(--accent-brand)] font-mono">{headlineKpis.enterpriseValuation.multiple}</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Enterprise Valuation Simulator (Solid Ivory Card) */}
      <div className="rounded-3xl p-6 sm:p-8 space-y-6 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl badge-brand">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Dynamic Enterprise Valuation Multiple Simulator</h3>
              <p className="text-xs text-[var(--text-muted)]">Simulate market enterprise value (EV) based on prevailing industry benchmark multiples.</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-right">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-bold">Implied Valuation</span>
            <span className="text-xl sm:text-2xl font-black text-[var(--accent-brand)] font-mono">
              {formatCurrency(blendedSimulatedValuation)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]">
          {/* EBITDA Multiple Slider */}
          <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text-secondary)]">EBITDA Multiple Benchmark</span>
              <span className="font-mono font-bold text-emerald-800 px-2 py-0.5 rounded badge-success">
                {ebitdaMultipleSlider.toFixed(1)}x Multiple
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="16.0"
              step="0.5"
              value={ebitdaMultipleSlider}
              onChange={(e) => setEbitdaMultipleSlider(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent-brand)] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <span>Conservative (4x)</span>
              <span>Median (8.5x)</span>
              <span>Premium Growth (16x)</span>
            </div>
            <div className="pt-2 text-xs text-[var(--text-muted)] flex justify-between border-t border-[var(--border-color)]">
              <span>Implied EBITDA Valuation:</span>
              <span className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(simulatedEbitdaValuation)}</span>
            </div>
          </div>

          {/* Revenue Multiple Slider */}
          <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text-secondary)]">Revenue / ARR Multiple Benchmark</span>
              <span className="font-mono font-bold text-[var(--accent-brand)] px-2 py-0.5 rounded badge-brand">
                {revenueMultipleSlider.toFixed(1)}x Multiple
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="12.0"
              step="0.2"
              value={revenueMultipleSlider}
              onChange={(e) => setRevenueMultipleSlider(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent-brand)] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <span>Value (2x)</span>
              <span>Market Median (5.2x)</span>
              <span>Top Decile (12x)</span>
            </div>
            <div className="pt-2 text-xs text-[var(--text-muted)] flex justify-between border-t border-[var(--border-color)]">
              <span>Implied Revenue Valuation:</span>
              <span className="font-bold text-[var(--text-primary)] font-mono">{formatCurrency(simulatedRevenueValuation)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two Columns: Profitability & EBITDA Waterfall (Left) + Capital Efficiency & Balance Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Detailed Income Statement & EBITDA Waterfall */}
        <div className="rounded-3xl p-6 sm:p-7 space-y-5 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-[var(--text-primary)] text-base">EBITDA & Net Profit Waterfall</h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">FY 2026-27 Run Rate (INR ₹)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="financial-metric-row">
              <span className="text-[var(--text-secondary)] font-medium">Gross Commercial Revenue</span>
              <span className="font-mono font-bold text-[var(--text-primary)] text-sm">{formatCurrency(profitability.grossRevenue)}</span>
            </div>
            <div className="financial-metric-row text-rose-800">
              <span>Less: Cost of Goods Sold (COGS)</span>
              <span className="font-mono">-{formatCurrency(profitability.cogs)}</span>
            </div>
            <div className="financial-metric-row badge-success font-semibold">
              <span>Gross Profit ({profitability.grossMarginPct} Margin)</span>
              <span className="font-mono text-sm">{formatCurrency(profitability.grossProfit)}</span>
            </div>
            <div className="financial-metric-row text-rose-800">
              <span>Less: Operating Expenses (OPEX, Cloud, Leases)</span>
              <span className="font-mono">-{formatCurrency(profitability.operatingExpenses)}</span>
            </div>
            <div className="financial-metric-row">
              <span className="text-[var(--text-secondary)]">Operating Income (EBIT)</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{formatCurrency(profitability.ebit)}</span>
            </div>
            <div className="financial-metric-row text-sky-800">
              <span>Plus: Depreciation & Amortization (Non-Cash Addback)</span>
              <span className="font-mono">+{formatCurrency(profitability.depreciationAndAmortization)}</span>
            </div>
            <div className="financial-metric-row badge-brand font-bold text-sm">
              <span>EBITDA ({profitability.ebitdaMarginPct} Margin)</span>
              <span className="font-mono">{formatCurrency(profitability.ebitda)}</span>
            </div>
            <div className="financial-metric-row text-[var(--text-muted)]">
              <span>Less: Interest & Corporate Taxes</span>
              <span className="font-mono">-{formatCurrency(profitability.taxExpense + profitability.interestExpense)}</span>
            </div>
            <div className="financial-metric-row badge-success font-black text-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Net Operating Profit ({profitability.netProfitMarginPct})</span>
              </span>
              <span className="font-mono text-base">{formatCurrency(profitability.netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Right: Balance Sheet Solvency & Capital Efficiency Ratios */}
        <div className="space-y-6">
          {/* Capital Efficiency (ROI, ROA, ROE) */}
          <div className="rounded-3xl p-6 sm:p-7 space-y-4 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-color)]">
              <Scale className="w-5 h-5 text-[var(--accent-brand)]" />
              <h3 className="font-bold text-[var(--text-primary)] text-base">Capital Return & Efficiency (ROI / ROA / ROE)</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block tracking-wider">ROI</span>
                <span className="text-xl font-extrabold text-amber-800 font-mono mt-1 block">
                  {efficiencyAndReturns.roi}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Return on Capital</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block tracking-wider">ROA</span>
                <span className="text-xl font-extrabold text-sky-800 font-mono mt-1 block">
                  {efficiencyAndReturns.roa}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Return on Assets</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block tracking-wider">ROE</span>
                <span className="text-xl font-extrabold text-emerald-800 font-mono mt-1 block">
                  {efficiencyAndReturns.roe}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Return on Equity</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet & Liquidity Overview */}
          <div className="rounded-3xl p-6 sm:p-7 space-y-4 bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-sky-700" />
                <h3 className="font-bold text-[var(--text-primary)] text-base">Balance Sheet & Net Worth Structure</h3>
              </div>
              <span className="text-xs font-mono font-bold text-sky-800">
                Net Worth: {formatCurrency(balanceSheetOverview.netWorth)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Total Assets</span>
                <p className="text-lg font-black text-[var(--text-primary)] font-mono">{formatCurrency(balanceSheetOverview.totalAssets)}</p>
                <div className="text-[11px] text-[var(--text-muted)] space-y-1 pt-1 border-t border-[var(--border-color)]">
                  <div className="flex justify-between">
                    <span>Cash Liquidity:</span>
                    <span className="font-mono text-emerald-800">{formatCurrency(balanceSheetOverview.cashAndEquivalents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>A/R Receivables:</span>
                    <span className="font-mono text-sky-800">{formatCurrency(balanceSheetOverview.accountsReceivable)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Total Liabilities</span>
                <p className="text-lg font-black text-rose-800 font-mono">{formatCurrency(balanceSheetOverview.totalLiabilities)}</p>
                <div className="text-[11px] text-[var(--text-muted)] space-y-1 pt-1 border-t border-[var(--border-color)]">
                  <div className="flex justify-between">
                    <span>A/P Payables:</span>
                    <span className="font-mono text-rose-700">{formatCurrency(balanceSheetOverview.accountsPayable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Debt / Equity:</span>
                    <span className="font-mono text-emerald-800">{liquidityAndSolvency.debtToEquityRatio}x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Runway & Liquidity Meter (Solid subtle card) */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl badge-success">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Cash Runway & Burn Capacity</span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Net monthly burn: {formatCurrency(liquidityAndSolvency.monthlyBurnRate)}/mo
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-800 font-mono block">
                  {liquidityAndSolvency.cashRunwayMonths} Months
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Current Ratio: {liquidityAndSolvency.currentRatio}x ({liquidityAndSolvency.currentRatioStatus})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialsView;
