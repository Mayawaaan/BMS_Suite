import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
  Calendar,
  AlertCircle,
  Building2,
  Check,
  Zap,
  Lock,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import { systemService } from '../../core/services/systemService';
import { formatCurrency } from '../../shared/utils/formatters';

const TIERS = [
  {
    id: 'starter',
    name: 'Starter Hub',
    monthlyPrice: 29,
    annualPrice: 24, // $288/year
    description: 'Essential billing, POS, and inventory controls for single retail shops & startups.',
    features: [
      'Up to 500 Product SKUs',
      'Up to 500 Invoices / Month',
      '1 Store Location / Terminal',
      'Executive Telemetry & POS Terminal',
      'Standard Cash & Ledger Accounting',
      'Community & Standard Email Support',
    ],
    limits: {
      maxSkus: 500,
      maxInvoices: 500,
      maxBusinesses: 1,
    },
    popular: false,
    accentColor: '#B4833E',
  },
  {
    id: 'growth',
    name: 'Growth Enterprise',
    monthlyPrice: 99,
    annualPrice: 79, // $948/year
    description: 'Expanded operational capacity for thriving retail networks and multi-counter stores.',
    features: [
      'Up to 2,500 Product SKUs',
      'Up to 2,500 Invoices / Month',
      'Up to 3 Store Branches & Terminals',
      'Automated Accounts Receivable & Dunning',
      'Real-time MRR, ARR & Revenue Projections',
      'Priority 24/7 Operations Support',
    ],
    limits: {
      maxSkus: 2500,
      maxInvoices: 2500,
      maxBusinesses: 3,
    },
    popular: true,
    accentColor: '#9A3412',
  },
  {
    id: 'enterprise',
    name: 'Unlimited Suite',
    monthlyPrice: 299,
    annualPrice: 239, // $2,868/year
    description: 'High-volume enterprise tier with unmetered throughput and dedicated partitions.',
    features: [
      'Unlimited Product SKUs (∞)',
      'Unlimited Monthly Invoices (∞)',
      'Unlimited Branch Locations',
      'Custom ERP & Warehouse Integrations',
      'Multi-Currency & Global Tax Compliance',
      'Dedicated Account Architect & SLA',
    ],
    limits: {
      maxSkus: 999999,
      maxInvoices: 999999,
      maxBusinesses: 99,
    },
    popular: false,
    accentColor: '#1E293B',
  },
];

export const PaymentsView = () => {
  const { user, switchTenant } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [currentTier, setCurrentTier] = useState(user?.planTier || 'starter');
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Upgrade Modal State
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'wire' | 'upi'
  const [processingPayment, setProcessingPayment] = useState(false);

  // Card Simulator Form
  const [cardDetails, setCardDetails] = useState({
    name: user?.name || 'Authorized Director',
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvv: '888',
  });

  // Dynamic Billing History
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-SUB-9021',
      date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      description: `ZSYIO BMS - ${currentTier.toUpperCase()} Hub Subscription`,
      amount: currentTier === 'enterprise' ? 299 : currentTier === 'growth' ? 99 : 29,
      status: 'paid',
      method: 'Card •••• 4242',
    },
  ]);

  useEffect(() => {
    if (user?.planTier) {
      setCurrentTier(user.planTier);
    }
  }, [user?.planTier]);

  const activeTierConfig = TIERS.find((t) => t.id === currentTier) || TIERS[0];

  const handleOpenUpgrade = (tier) => {
    if (tier.id === currentTier) return;
    setSelectedPlanForUpgrade(tier);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) return;

    try {
      setProcessingPayment(true);
      const newPlanId = selectedPlanForUpgrade.id;

      // Update tenant subscription tier on backend
      const tenantId = user?.tenantId || 'tenant-retail';
      await systemService.updateTenantPlan(tenantId, newPlanId);

      // Update local auth context
      if (switchTenant) {
        switchTenant(tenantId, user?.companyName, newPlanId, selectedPlanForUpgrade.limits.allowedVerticals, selectedPlanForUpgrade.limits.maxBusinesses);
      }
      setCurrentTier(newPlanId);

      // Add receipt to billing history
      const price = billingCycle === 'annual' ? selectedPlanForUpgrade.annualPrice * 12 : selectedPlanForUpgrade.monthlyPrice;
      const newReceipt = {
        id: `INV-SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        description: `ZSYIO BMS - ${selectedPlanForUpgrade.name} (${billingCycle.toUpperCase()})`,
        amount: price,
        status: 'paid',
        method: paymentMethod === 'card' ? 'Card •••• 4242' : paymentMethod === 'wire' ? 'ACH Wire Transfer' : 'Instant UPI',
      };
      setInvoices((prev) => [newReceipt, ...prev]);

      setAlertMsg({
        type: 'success',
        text: `Payment successful! Upgraded to ${selectedPlanForUpgrade.name}. New limits and features active immediately.`,
      });
      setSelectedPlanForUpgrade(null);
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Payment processing failed. Please check payment credentials.',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadReceipt = (inv) => {
    const receiptContent = `================================================
ZSYIO BUSINESS MANAGEMENT SYSTEM (BMS)
OFFICIAL SUBSCRIPTION TAX INVOICE
================================================
Invoice Number : ${inv.id}
Date           : ${inv.date}
Organization   : ${user?.companyName || 'Retail Store & POS'}
Tenant ID      : ${user?.tenantId || 'tenant-retail'}
Billed To      : ${user?.name} (${user?.email})
Description    : ${inv.description}
Billing Cycle  : ${billingCycle.toUpperCase()}
Total Amount   : $${inv.amount}.00 USD
Payment Method : ${inv.method}
Payment Status : PAID (Electronic Settlement Verified)
================================================
Thank you for using ZSYIO BMS Enterprise Platform!
Support: billing@zsyio.io
================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}-receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#9A3412] shadow-xs">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Payments & Subscriptions
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                Active Tier
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Manage organization subscription tier, upgrade computational quotas, and download billing invoices.
            </p>
          </div>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)]">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              billingCycle === 'annual'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
            alertMsg.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-slate-500 hover:text-black font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Active Subscription Summary Card */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#9A3412] uppercase tracking-wider font-bold">
              Current Active License
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                {activeTierConfig.name}
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                Active & Verified
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl">
              {activeTierConfig.description} Bound to tenant partition{' '}
              <strong className="text-[var(--text-primary)] font-mono">{user?.tenantId}</strong> ({user?.companyName}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 lg:border-l border-[var(--border-color)] pt-4 lg:pt-0 lg:pl-6">
            <div className="text-left">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase font-mono block">Recurring Fee</span>
              <span className="text-2xl font-extrabold text-[var(--text-primary)]">
                ${billingCycle === 'annual' ? activeTierConfig.annualPrice : activeTierConfig.monthlyPrice}
                <span className="text-xs text-[var(--text-muted)] font-normal"> / mo</span>
              </span>
            </div>

            <div className="text-left">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase font-mono block">Next Renewal</span>
              <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-[#9A3412]" />
                <span>Nov 28, 2026</span>
              </span>
            </div>

            <div className="text-left">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase font-mono block">SKU Limit</span>
              <span className="text-sm font-bold text-[var(--text-primary)] mt-1 block">
                {activeTierConfig.limits.maxSkus > 90000 ? 'Unlimited' : `${activeTierConfig.limits.maxSkus} SKUs`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Upgrade Tier Cards */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Available Subscription Tiers
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Upgrade or scale your plan dynamically. Quotas apply instantly across all store registers and ledger systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const isCurrent = tier.id === currentTier;
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl bg-[#FFFFFF] border p-6 shadow-[var(--shadow-card)] flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#9A3412] ring-2 ring-[#9A3412]/30'
                    : 'border-[var(--border-color)] hover:border-[#9A3412]/50'
                }`}
              >
                {tier.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#9A3412] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Current Plan
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-[var(--text-primary)]">{tier.name}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 min-h-[36px]">{tier.description}</p>

                  <div className="my-5 pb-5 border-b border-[var(--border-color)]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[var(--text-primary)]">${price}</span>
                      <span className="text-xs text-[var(--text-muted)]">/ month</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <span className="text-[11px] text-emerald-700 font-mono font-semibold block mt-1">
                        Billed annually (${price * 12}/year)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-6">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--text-secondary)] font-bold block">
                      Plan Inclusions:
                    </span>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                        <Check className="w-3.5 h-3.5 text-[#9A3412] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] cursor-default flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Active Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenUpgrade(tier)}
                      className="w-full py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span>Upgrade to {tier.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing Invoices & Receipts History */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-[#9A3412]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Billing Receipts & Payment History
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Download verified tax invoices and review electronic payment settlements.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FAF6EF]/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">{inv.id}</td>
                  <td className="py-3 px-3 text-[var(--text-secondary)] font-mono">{inv.date}</td>
                  <td className="py-3 px-3 font-medium text-[var(--text-primary)]">{inv.description}</td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">{inv.method}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">${inv.amount}.00</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{inv.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDownloadReceipt(inv)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5 transition-all"
                      title="Download receipt"
                    >
                      <Download className="w-3 h-3 text-[#9A3412]" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Checkout Simulator Modal */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[var(--border-strong)] p-6 shadow-2xl text-[var(--text-primary)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#9A3412] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Confirm Tier Upgrade
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Upgrading to {selectedPlanForUpgrade.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="text-slate-400 hover:text-black font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Price Overview Banner */}
            <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-secondary)] font-medium block">Subscription Fee</span>
                <span className="text-lg font-bold text-[var(--text-primary)]">
                  ${billingCycle === 'annual' ? selectedPlanForUpgrade.annualPrice * 12 : selectedPlanForUpgrade.monthlyPrice}.00 USD
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block capitalize">
                  {billingCycle} billing cycle (No setup fees)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-300">
                Instant Activation
              </span>
            </div>

            {/* Payment Method Selector */}
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#9A3412] bg-[#9A3412]/10 text-[#9A3412]'
                        : 'border-[var(--border-color)] bg-[#FAF6EF] text-[var(--text-secondary)]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'wire'
                        ? 'border-[#9A3412] bg-[#9A3412]/10 text-[#9A3412]'
                        : 'border-[var(--border-color)] bg-[#FAF6EF] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bank Wire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#9A3412] bg-[#9A3412]/10 text-[#9A3412]'
                        : 'border-[var(--border-color)] bg-[#FAF6EF] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>UPI / Net</span>
                  </button>
                </div>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)]">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                        Exp / CVV
                      </label>
                      <input
                        type="text"
                        required
                        value={`${cardDetails.expiry} ${cardDetails.cvv}`}
                        onChange={(e) => {}}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'wire' && (
                <div className="p-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs space-y-1.5 font-mono">
                  <div className="text-[var(--text-secondary)]">Beneficiary: <strong className="text-[var(--text-primary)]">ZSYIO Systems Corp</strong></div>
                  <div className="text-[var(--text-secondary)]">ACH Routing: <strong className="text-[var(--text-primary)]">021000021</strong></div>
                  <div className="text-[var(--text-secondary)]">Account: <strong className="text-[var(--text-primary)]">9482-1049-2819</strong></div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">Instant electronic settlement enabled</div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs space-y-2">
                  <label className="block text-[11px] font-bold text-[var(--text-primary)]">Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    defaultValue="retailshop@okhdfcbank"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono"
                  />
                  <div className="text-[10px] text-emerald-800 font-bold">Fast UPI autopay simulated for instant checkout</div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF6EF] hover:bg-[#F3ECE0] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold shadow-xs flex items-center gap-2"
                >
                  {processingPayment ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{processingPayment ? 'Processing...' : 'Complete Payment & Upgrade'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
