import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReceiptText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  FileText,
  DollarSign,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { billsService } from './BillsService';
import { billsAnimations } from './BillsAnimations';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { useAuth } from '../../core/contexts/AuthContext';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceViewerModal } from './InvoiceViewerModal';
import { BILL_STATUS_FILTERS } from '../../core/config/systemConfig';
import './BillsStyles.css';

export const BillsView = ({ initialCreateOpen = false, onClearInitialCreate }) => {
  const { profileId, terminology, activeProfile } = useBusinessProfile();
  const { can } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateOpen);
  const [selectedBillForPreview, setSelectedBillForPreview] = useState(null);

  useEffect(() => {
    if (initialCreateOpen) {
      setIsCreateModalOpen(true);
      if (onClearInitialCreate) onClearInitialCreate();
    }
  }, [initialCreateOpen, onClearInitialCreate]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await billsService.getAll(profileId);
      setBills(data || []);
    } catch (err) {
      console.error('Failed to load bills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [profileId]);

  const handleCreateBill = async (payload) => {
    try {
      const created = await billsService.create(payload);
      setBills([created, ...bills]);
      setIsCreateModalOpen(false);
      // Auto-preview newly created invoice
      setSelectedBillForPreview(created);
    } catch (err) {
      console.error('Error creating bill', err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const updated = await billsService.updateStatus(id, status);
      setBills(bills.map((b) => (b.id === id || b._id === id ? updated : b)));
      if (selectedBillForPreview && (selectedBillForPreview.id === id || selectedBillForPreview._id === id)) {
        setSelectedBillForPreview({ ...selectedBillForPreview, status });
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await billsService.delete(id);
      setBills(bills.filter((b) => b.id !== id && b._id !== id));
      if (selectedBillForPreview && (selectedBillForPreview.id === id || selectedBillForPreview._id === id)) {
        setSelectedBillForPreview(null);
      }
    } catch (err) {
      console.error('Error deleting bill', err);
    }
  };

  // Filtered bills
  const filtered = bills.filter((b) => {
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorOrClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Calculate Metrics
  const totalAmount = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const paidAmount = bills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const pendingAmount = bills
    .filter((b) => b.status === 'pending')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const overdueCount = bills.filter((b) => b.status === 'overdue').length;

  return (
    <motion.div
      variants={billsAnimations.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Metric Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Invoiced</span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {formatCurrency(totalAmount)}
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/5 block">{bills.length} total records</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-800 font-semibold">Settled (Paid)</span>
            <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
              {formatCurrency(paidAmount)}
            </div>
          </div>
          <span className="text-xs text-emerald-800/80 mt-2 pt-2 border-t border-emerald-500/20 block font-medium">Successfully reconciled</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono uppercase text-amber-800 font-semibold">Pending Payables</span>
            <div className="text-2xl font-black text-amber-800 font-mono mt-1">
              {formatCurrency(pendingAmount)}
            </div>
          </div>
          <span className="text-xs text-amber-800/80 mt-2 pt-2 border-t border-amber-500/20 block font-medium">Awaiting remittance</span>
        </div>

        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 backdrop-blur-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono uppercase text-rose-800 font-semibold">Overdue Alerts</span>
            <div className="text-2xl font-black text-rose-800 font-mono mt-1">
              {overdueCount} Invoices
            </div>
          </div>
          <span className="text-xs text-rose-800/80 mt-2 pt-2 border-t border-rose-500/20 block font-medium">Requires priority attention</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and New Bill Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search vendor, invoice #, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[#9A3412] transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="h-10 flex items-center p-1 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs">
            {BILL_STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`h-full px-3.5 rounded-lg font-semibold capitalize flex items-center transition-all ${
                  filterStatus === f.id
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        {can('create') ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 flex items-center justify-center gap-2 px-5 text-xs font-bold rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white shadow-md shadow-[#9A3412]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Bill / Invoice</span>
          </button>
        ) : (
          <div className="h-10 flex items-center gap-2 px-4 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditor Read-Only Mode</span>
          </div>
        )}
      </div>

      {/* Bills Data Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-5">Title & Client / Vendor</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
                <th className="py-3.5 px-5 text-center">Due Date</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((bill) => (
                <tr key={bill.id || bill._id} className="bill-row-hover transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-white whitespace-nowrap">
                    <button
                      onClick={() => setSelectedBillForPreview(bill)}
                      className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-left"
                      title="Click to view full invoice"
                    >
                      <span>{bill.invoiceNumber || 'INV-2026-X'}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 opacity-60" />
                    </button>
                  </td>
                  <td className="py-3.5 px-5">
                    <div
                      onClick={() => setSelectedBillForPreview(bill)}
                      className="font-semibold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                    >
                      {bill.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{bill.vendorOrClient}</span>
                      {profileId === 'all' && bill.businessType && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 uppercase">
                          {bill.businessType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px]">
                      {bill.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-white text-right whitespace-nowrap bill-amount-tag">
                    {formatCurrency(bill.amount)}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400 text-center whitespace-nowrap">
                    {formatDate(bill.dueDate)}
                  </td>
                  <td className="py-3.5 px-5 text-center whitespace-nowrap">
                    <Badge status={bill.status} />
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* View & Print Invoice Button */}
                      <button
                        onClick={() => setSelectedBillForPreview(bill)}
                        title="View & Print Official Invoice"
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Status Toggle (Staff/Manager/Admin) */}
                      {can('edit') && bill.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(bill.id || bill._id, 'paid')}
                          title="Mark as Paid"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {can('edit') && bill.status === 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(bill.id || bill._id, 'pending')}
                          title="Mark as Pending"
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete (Admin Only) */}
                      {can('delete') && (
                        <button
                          onClick={() => handleDelete(bill.id || bill._id)}
                          title="Delete Bill (Admin Clearance)"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No bills or invoices match the current filter. Click "Create Bill / Invoice" above to issue one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Create Invoice & Bill Studio Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBill}
        activeProfile={activeProfile}
        profileId={profileId}
      />

      {/* Official Invoice Viewer & Print Preview Modal */}
      <InvoiceViewerModal
        isOpen={Boolean(selectedBillForPreview)}
        onClose={() => setSelectedBillForPreview(null)}
        bill={selectedBillForPreview}
        onMarkPaid={handleUpdateStatus}
      />
    </motion.div>
  );
};
