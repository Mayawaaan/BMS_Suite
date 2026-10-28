import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Modal } from '../../shared/components/Modal';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { customersService } from './CustomersService';
import { customersAnimations } from './CustomersAnimations';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { useAuth } from '../../core/contexts/AuthContext';
import { CUSTOMER_STATUS_FILTERS } from '../../core/config/systemConfig';
import './CustomersStyles.css';

export const CustomersView = () => {
  const { profileId, terminology, activeProfile } = useBusinessProfile();
  const { can } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    status: 'lead',
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersService.getAll(profileId);
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [profileId]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email || !newCust.company) return;

    try {
      const created = await customersService.create({
        ...newCust,
        businessType: profileId !== 'all' ? profileId : 'software',
      });
      setCustomers([created, ...customers]);
      setIsModalOpen(false);
      setNewCust({
        name: '',
        email: '',
        company: '',
        phone: '',
        status: 'lead',
      });
    } catch (err) {
      console.error('Error creating customer', err);
    }
  };

  const handleDelete = async (id) => {
    if (!can('delete')) {
      alert('Permission Denied: Deleting customer accounts requires Admin or Superadmin clearance.');
      return;
    }
    try {
      await customersService.delete(id);
      setCustomers(customers.filter((c) => c.id !== id && c._id !== id));
    } catch (err) {
      console.error('Error deleting customer', err);
    }
  };

  const filtered = customers.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalSpend = customers.reduce((sum, c) => sum + (Number(c.totalSpend) || 0), 0);
  const activeCount = customers.filter((c) => c.status === 'active').length;

  return (
    <motion.div
      variants={customersAnimations.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400">Total Accounts</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{customers.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">{activeCount} active retained</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-emerald-800 font-semibold">Total Client LTV</span>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
            {formatCurrency(totalSpend)}
          </div>
          <span className="text-xs text-emerald-800/80 mt-1 block font-medium">Cumulative customer revenue</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#9A3412]/10 border border-[#9A3412]/20 backdrop-blur-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-[#9A3412] font-semibold">Average Spend Per Logo</span>
          <div className="text-2xl font-black text-[#9A3412] font-mono mt-1">
            {formatCurrency(customers.length ? totalSpend / customers.length : 0)}
          </div>
          <span className="text-xs text-[#9A3412]/80 mt-1 block font-medium">Account expansion index</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search company, contact, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[#9A3412]"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs">
            {CUSTOMER_STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                  statusFilter === f.id
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {can('create') ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white shadow-md shadow-[#9A3412]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditor (Read-Only)</span>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6">Customer & Company</th>
                <th className="py-4 px-6">Direct Contact</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Deals</th>
                <th className="py-4 px-6">Total LTV Spend</th>
                <th className="py-4 px-6">Last Touch</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((cust) => {
                const custId = cust.id || cust._id;

                return (
                  <tr key={custId} className="customer-card-hover transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            cust.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              cust.name
                            )}`
                          }
                          alt={cust.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{cust.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {cust.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-300 font-mono flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        {cust.email}
                      </div>
                      {cust.phone && (
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {cust.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={cust.status} />
                    </td>
                    <td className="py-4 px-6 font-mono text-white">
                      {cust.dealsCount || 0} Deals
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                      {formatCurrency(cust.totalSpend || 0)}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {formatDate(cust.lastContacted)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {can('delete') ? (
                        <button
                          onClick={() => handleDelete(custId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Customer (Admin Clearance)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Customer / Account"
        subtitle="Create an enterprise CRM profile to log deals, invoices, and activity"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. David Sterling"
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sterling Capital LLC"
                value={newCust.company}
                onChange={(e) => setNewCust({ ...newCust, company: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={newCust.status}
                onChange={(e) => setNewCust({ ...newCust, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="lead">Lead</option>
                <option value="active">Active Customer</option>
                <option value="churned">Churned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                required
                placeholder="david@sterlingcap.com"
                value={newCust.email}
                onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (555) 019-2834"
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
