import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Store,
  Factory,
  Cpu,
  ShoppingBag,
  Layers,
  ArrowRight,
  Lock,
  Mail,
  User,
  CheckCircle2,
  CreditCard,
  KeyRound,
  Check,
  Crown,
  Users,
  AlertCircle,
  RotateCcw,
  Shield,
  HardHat,
} from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { authService } from '../../core/services/authService';
import { Modal } from '../../shared/components/Modal';
import { Footer } from '../../shared/components/Footer';

// Seed accounts for 1-click quick login (Super Admin + Retail Shop)
const QUICK_SEED_ACCOUNTS = [
  {
    roleTitle: 'Super Admin',
    name: 'Elena Vance',
    email: 'superadmin@zsyio.io',
    password: 'password123',
    company: 'ZSYIO Global BMS',
    badge: 'Owner',
    icon: Crown,
    isOwner: true,
  },
  {
    roleTitle: 'Shop Admin',
    name: 'Raj Patel',
    email: 'admin@retailshop.io',
    password: 'password123',
    company: 'ZSYIO Retail Store & POS',
    badge: 'Store Director',
    icon: Store,
  },
  {
    roleTitle: 'Shop Staff',
    name: 'Maya Lin',
    email: 'staff@retailshop.io',
    password: 'password123',
    company: 'ZSYIO Retail Store & POS',
    badge: 'Floor & POS',
    icon: Users,
  },
  {
    roleTitle: 'Shop Auditor',
    name: 'David Chen',
    email: 'auditor@retailshop.io',
    password: 'password123',
    company: 'ZSYIO Retail Store & POS',
    badge: 'Compliance & Ledger',
    icon: ShieldCheck,
  },
];

const ALL_PRIMARY_VERTICALS = [
  {
    id: 'shop',
    name: 'Retail Store & POS',
    desc: 'Counter sales, barcodes, walk-in shoppers, vendor payables',
    badge: 'Store POS',
    icon: Store,
  },
  {
    id: 'factory',
    name: 'Factory & Manufacturing',
    desc: 'Raw materials, BOM assembly, production lines, wholesale supply',
    badge: 'Manufacturing',
    icon: Factory,
  },
  {
    id: 'industry',
    name: 'Heavy Industry & EPC',
    desc: 'Capital tenders, capex machinery, yard logistics, site audits',
    badge: 'Heavy EPC',
    icon: HardHat,
  },
  {
    id: 'software',
    name: 'Software SaaS & Tech',
    desc: 'Recurring subscriptions, MRR/ARR, licenses, cloud infra',
    badge: 'SaaS Platform',
    icon: Cpu,
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & D2C Brands',
    desc: 'Online checkouts, 3PL couriers, packaging bins, return rates',
    badge: 'D2C Retail',
    icon: ShoppingBag,
  },
];

const SIGNUP_TIERS = [
  {
    id: 'starter',
    name: 'Starter Hub',
    monthlyPrice: 29,
    annualPrice: 24,
    description: '1 Primary Business Vertical. Standard POS, catalog & billing.',
    maxBusinesses: 1,
  },
  {
    id: 'growth',
    name: 'Growth Pack',
    monthlyPrice: 99,
    annualPrice: 79,
    description: 'Up to 3 Business Verticals + Multi-Business Hub & Portfolio Switcher.',
    popular: true,
    maxBusinesses: 3,
  },
  {
    id: 'enterprise',
    name: 'Highest Suite',
    monthlyPrice: 299,
    annualPrice: 239,
    description: 'All 5 Business Verticals + Unlimited Multi-Company Operations.',
    maxBusinesses: 99,
  },
];

export const LoginView = () => {
  const { login, register, loading } = useAuth();
  const { switchProfile } = useBusinessProfile();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Sign In Form State
  const [email, setEmail] = useState('admin@retailshop.io');
  const [password, setPassword] = useState('password123');

  // Sign Up Form State
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('password123');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('shop'); // Primary vertical
  const [selectedGrowthVerticals, setSelectedGrowthVerticals] = useState(['shop', 'ecommerce', 'factory']);
  const [planTier, setPlanTier] = useState('starter');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password & OTP Flow State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify' | 'reset' | 'success'
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState(null);

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg('');
  };

  const handleSelectPrimary = (vId) => {
    setCompanyType(vId);
    if (!selectedGrowthVerticals.includes(vId)) {
      if (selectedGrowthVerticals.length >= 3) {
        setSelectedGrowthVerticals([vId, selectedGrowthVerticals[0], selectedGrowthVerticals[1]]);
      } else {
        setSelectedGrowthVerticals([vId, ...selectedGrowthVerticals]);
      }
    }
  };

  const handleToggleGrowthVertical = (vId) => {
    if (vId === companyType) return; // Primary is always locked-in
    if (selectedGrowthVerticals.includes(vId)) {
      if (selectedGrowthVerticals.length <= 1) return;
      setSelectedGrowthVerticals(selectedGrowthVerticals.filter((id) => id !== vId));
    } else {
      if (selectedGrowthVerticals.length >= 3) return; // 3 max for Growth
      setSelectedGrowthVerticals([...selectedGrowthVerticals, vId]);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login({ email, password });
    if (res.success) {
      if (res.user?.companyType) switchProfile(res.user.companyType);
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const finalVerticals = planTier === 'enterprise'
      ? ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce']
      : planTier === 'growth'
      ? selectedGrowthVerticals
      : [companyType];

    const res = await register({
      name,
      email: registerEmail,
      password: registerPassword,
      role: 'admin',
      companyName: companyName || `${name}'s Organization`,
      companyType, // Primary vertical
      planTier,
      billingCycle,
      selectedVerticals: finalVerticals,
    });
    if (res.success) {
      switchProfile(companyType);
    } else {
      setErrorMsg(res.message || 'Failed to register account');
    }
  };

  // OTP Step 1: Request 6-digit code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otpEmail.trim()) {
      setOtpError('Please provide your registered corporate email.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await authService.forgotPassword(otpEmail.trim());
      if (res.success) {
        setOtpStep('verify');
        setOtpSuccessMsg(res.message || '6-digit OTP code dispatched.');
        if (res.devOtp) setDevOtpHint(res.devOtp);
      } else {
        setOtpError(res.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to connect to authentication server.');
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Step 2: Verify 6-digit code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('Please enter the exact 6-digit verification code.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await authService.verifyOtp(otpEmail.trim(), otpCode.trim());
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setOtpStep('reset');
        setOtpSuccessMsg('Code verified successfully. Enter your new password.');
      } else {
        setOtpError(res.message || 'Invalid verification code.');
      }
    } catch (err) {
      setOtpError(err.message || 'Error validating code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (newPassword.length < 6) {
      setOtpError('Password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError('Password confirmation does not match.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await authService.resetPassword({
        email: otpEmail.trim(),
        resetToken,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        setOtpStep('success');
        setPassword(newPassword);
        setEmail(otpEmail.trim());
      } else {
        setOtpError(res.message || 'Password reset failed.');
      }
    } catch (err) {
      setOtpError(err.message || 'Error executing password reset.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-between py-10 px-4 sm:px-6 relative overflow-y-auto">
      {/* Brand Header */}
      <div className="text-center max-w-lg mb-8 relative z-10 w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6EF] border border-[var(--border-color)] text-[#9A3412] text-xs font-mono mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ZSYIO BUSINESS MANAGEMENT SYSTEM • BMS v2.4</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#9A3412] shadow-sm flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            ZSYIO BMS
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          Clean Multi-Tenant Retail & Enterprise Cloud Operations
        </p>
      </div>

      {/* Main Auth Container Card */}
      <div className="w-full max-w-xl rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] overflow-hidden relative z-10 flex flex-col mb-8">
        {/* Navigation Tabs (Sign In / Sign Up) */}
        <div className="flex border-b border-[var(--border-color)] bg-[#FAF6EF] p-1.5 gap-1.5">
          <button
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              authMode === 'login'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In to Account</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              authMode === 'register'
                ? 'bg-[#9A3412] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Register New Organization</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 mx-6 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-black font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Tab 1: Clean Sign In */}
        {authMode === 'login' && (
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@retailshop.io"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('request');
                      setOtpEmail(email);
                      setOtpError('');
                      setOtpSuccessMsg('');
                      setDevOtpHint(null);
                      setIsForgotOpen(true);
                    }}
                    className="text-xs font-semibold text-[#9A3412] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#9A3412]" />
                  <span>Secured with Bcrypt Salting & HMAC SHA-256 JWT</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to BMS Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Fill Seed Accounts */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <span className="text-[11px] font-mono uppercase font-bold text-[var(--text-secondary)] block mb-2.5">
                Quick Fill Seed Credentials (Clean Setup):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUICK_SEED_ACCOUNTS.map((acc, idx) => {
                  const Icon = acc.icon;
                  const isSelected = email === acc.email;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#9A3412] bg-[#9A3412]/5 ring-1 ring-[#9A3412]'
                          : acc.isOwner
                          ? 'border-amber-300 bg-amber-50/60 hover:border-[#9A3412]'
                          : 'border-[var(--border-color)] bg-[#FAF6EF] hover:border-[#9A3412]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                          acc.isOwner
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-[#FFFFFF] border-[var(--border-color)] text-[#9A3412]'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                          acc.isOwner
                            ? 'bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                          {acc.roleTitle}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)] block truncate">
                          {acc.email}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clean Sign Up with Subscription Tier Selection */}
        {authMode === 'register' && (
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Sterling"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      required
                      placeholder="david@sterlinggoods.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sterling Retail Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Password (Bcrypt Encrypted)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Operating Vertical Selection - All 5 supported as primary */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Choose Primary Business Vertical
                  </label>
                  <span className="text-[10px] font-mono text-[#9A3412] font-semibold">
                    All 5 Supported as Primary
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_PRIMARY_VERTICALS.map((v) => {
                    const Icon = v.icon;
                    const isSelected = companyType === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectPrimary(v.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#9A3412] bg-[#9A3412]/5 ring-1 ring-[#9A3412]'
                            : 'border-[var(--border-color)] bg-[#FAF6EF] hover:border-[#9A3412]/40'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#9A3412] text-white shadow-xs' : 'bg-[#FFFFFF] text-[#9A3412] border border-[var(--border-color)]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {v.name}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#9A3412] shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--text-secondary)] line-clamp-1 block mt-0.5">
                            {v.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subscription Plan Tier Selector */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Select Subscription Tier & Quota
                  </label>
                  <div className="inline-flex p-0.5 rounded-lg bg-[#FAF6EF] border border-[var(--border-color)] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-2 py-0.5 rounded-md ${
                        billingCycle === 'monthly'
                          ? 'bg-[#9A3412] text-white font-bold'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-2 py-0.5 rounded-md ${
                        billingCycle === 'annual'
                          ? 'bg-[#9A3412] text-white font-bold'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      Annual (-20%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SIGNUP_TIERS.map((tier) => {
                    const isSelected = planTier === tier.id;
                    const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;

                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setPlanTier(tier.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? 'border-[#9A3412] bg-[#9A3412]/5 ring-1 ring-[#9A3412]'
                            : 'border-[var(--border-color)] bg-[#FAF6EF] hover:border-[#9A3412]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{tier.name}</span>
                          {tier.popular && (
                            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#9A3412] text-white font-mono">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <span className="text-base font-black text-[var(--text-primary)] font-mono">
                            ${price}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">/mo</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-snug">
                          {tier.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Growth Pack: Multi-Vertical Selector (Up to 3) */}
                {planTier === 'growth' && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#FAF6EF] border border-[#9A3412]/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#9A3412]" />
                        <span>Growth Pack: Select Up to 3 Business Verticals</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#9A3412] px-2 py-0.5 rounded bg-white border border-[#9A3412]/30">
                        {selectedGrowthVerticals.length} / 3 Selected
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Your primary vertical <strong className="text-[#9A3412]">{ALL_PRIMARY_VERTICALS.find(v => v.id === companyType)?.name}</strong> is included. Pick up to 2 additional business verticals for your portfolio:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {ALL_PRIMARY_VERTICALS.map((v) => {
                        const isPrimary = v.id === companyType;
                        const isChecked = selectedGrowthVerticals.includes(v.id);

                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleToggleGrowthVertical(v.id)}
                            disabled={isPrimary}
                            className={`p-2 rounded-lg border text-left text-[11px] font-medium flex items-center justify-between transition-all ${
                              isPrimary
                                ? 'bg-white border-[#9A3412] text-[#9A3412] font-bold cursor-default'
                                : isChecked
                                ? 'bg-[#9A3412]/10 border-[#9A3412] text-[var(--text-primary)] font-semibold'
                                : selectedGrowthVerticals.length >= 3
                                ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
                                : 'bg-white border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[#9A3412]/40'
                            }`}
                          >
                            <span className="truncate">{v.name.split('&')[0]}</span>
                            {isPrimary ? (
                              <span className="text-[8px] font-mono text-[#9A3412] uppercase shrink-0 font-bold">Primary</span>
                            ) : isChecked ? (
                              <Check className="w-3 h-3 text-[#9A3412] shrink-0" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Highest Suite: Unlimited Verticals Badge */}
                {planTier === 'enterprise' && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Highest Enterprise Suite: All 5 business verticals + Multi-Business Hub unlocked with unlimited capacity.</span>
                  </div>
                )}
              </div>

              {/* Zero-State Guarantee Callout */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  <strong>Clean Slate Guarantee:</strong> New registration automatically starts with strictly <strong>0 products, 0 bills, 0 sales, and $0 MRR/ARR</strong>. Metrics reactively calculate as transactions are recorded.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>{loading ? 'Creating Partition...' : 'Create Account & Start Fresh ($0 Metrics)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Enterprise Footer with ZSYIO Branding, Trademarks, Version, and Modals */}
      <div className="w-full max-w-5xl relative z-10">
        <Footer />
      </div>

      {/* Modal: Forgot Password & 6-Digit OTP Flow */}
      <Modal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Account Recovery & OTP Verification"
        subtitle="Reset your password securely with cryptographic 6-digit OTP verification"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {otpError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          {otpSuccessMsg && otpStep !== 'success' && (
            <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#9A3412] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          {/* Step 1: Request OTP */}
          {otpStep === 'request' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Registered Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@retailshop.io"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  A 6-digit one-time passcode will be issued for verification. Valid for 10 minutes.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[#FAF6EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#78350F] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {otpLoading ? 'Dispatching Code...' : 'Send 6-Digit OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Verify 6-digit OTP */}
          {otpStep === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Enter 6-Digit Code sent to:
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#9A3412] truncate max-w-[180px]">
                    {otpEmail}
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                />

                {devOtpHint && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono flex items-center justify-between">
                    <span>Active Dev OTP: <strong>{devOtpHint}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devOtpHint)}
                      className="underline font-bold"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2">
                  <span>Expires in 10 minutes</span>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-[#9A3412] font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpStep('request')}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[#FAF6EF]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length !== 6}
                  className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#78350F] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP Code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {otpStep === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  New Password (Bcrypt Salted)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#78350F] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-xs"
                >
                  {otpLoading ? 'Encrypting & Saving...' : 'Save New Password & Log In'}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Success confirmation */}
          {otpStep === 'success' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Password Successfully Reset!
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Your new password has been cryptographically salted and updated. You can now access your dashboard.
              </p>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#78350F] text-white text-xs font-bold uppercase tracking-wider"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LoginView;
