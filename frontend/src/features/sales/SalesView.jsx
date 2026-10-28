import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeDollarSign,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Trash2,
  User,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Modal } from '../../shared/components/Modal';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { salesService } from './SalesService';
import { salesAnimations } from './SalesAnimations';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { useAuth } from '../../core/contexts/AuthContext';
import { PIPELINE_STAGES } from '../../core/config/systemConfig';
import './SalesStyles.css';

export const SalesView = () => {
  const { profileId, terminology, activeProfile } = useBusinessProfile();
  const { can } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Deal State
  const [newDeal, setNewDeal] = useState({
    dealName: '',
    customerName: '',
    customerEmail: '',
    amount: '',
    stage: 'prospect',
    probability: 25,
    rep: 'Elena Vance',
  });

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await salesService.getAll(profileId);
      setDeals(data || []);
    } catch (err) {
      console.error('Failed to load sales pipeline', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [profileId]);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!newDeal.dealName || !newDeal.customerName || !newDeal.amount) return;

    try {
      const created = await salesService.create({
        ...newDeal,
        businessType: profileId !== 'all' ? profileId : 'software',
      });
      setDeals([created, ...deals]);
      setIsModalOpen(false);
      setNewDeal({
        dealName: '',
        customerName: '',
        customerEmail: '',
        amount: '',
        stage: 'prospect',
        probability: 25,
        rep: 'Elena Vance',
      });
    } catch (err) {
      console.error('Error creating deal', err);
    }
  };

  const handleMoveStage = async (dealId, nextStage) => {
    const stageObj = PIPELINE_STAGES.find((s) => s.id === nextStage);
    const prob = stageObj ? stageObj.defaultProb : 50;

    try {
      const updated = await salesService.updateStage(dealId, nextStage, prob);
      setDeals(deals.map((d) => (d.id === dealId || d._id === dealId ? updated : d)));
    } catch (err) {
      console.error('Error moving stage', err);
    }
  };

  const handleDelete = async (id) => {
    if (!can('delete')) {
      alert('Permission Denied: Deleting deals requires Admin or Superadmin clearance.');
      return;
    }
    try {
      await salesService.delete(id);
      setDeals(deals.filter((d) => d.id !== id && d._id !== id));
    } catch (err) {
      console.error('Error deleting deal', err);
    }
  };

  // Pipeline metrics
  const totalPipeline = deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const wonAmount = wonDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  return (
    <motion.div
      variants={salesAnimations.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Pipeline Value Bar (Solid Ivory & Beige Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-[var(--text-muted)] font-semibold">Total Active Pipeline</span>
            <div className="text-2xl font-black text-[var(--text-primary)] font-mono mt-1">
              {formatCurrency(totalPipeline)}
            </div>
          </div>
          <span className="text-xs text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border-color)] block font-medium">
            {deals.length} enterprise opportunities
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-800 font-semibold">Closed & Won Revenue</span>
            <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
              {formatCurrency(wonAmount)}
            </div>
          </div>
          <span className="text-xs text-emerald-800 mt-2 pt-2 border-t border-[var(--border-color)] block font-medium">
            Booked ARR conversion
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-[var(--accent-brand)] font-semibold">Pipeline Win Rate</span>
            <div className="text-2xl font-black text-[var(--accent-brand)] font-mono mt-1">
              {winRate}%
            </div>
          </div>
          <span className="text-xs text-[var(--text-secondary)] mt-2 pt-2 border-t border-[var(--border-color)] block font-medium">
            Conversion velocity
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2.5">
          <BadgeDollarSign className="w-5 h-5 text-[var(--accent-brand)]" />
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Visual Sales Pipeline & Opportunity Board</h2>
        </div>

        {can('create') ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 flex items-center gap-2 px-4 text-xs font-bold rounded-xl bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Deal</span>
          </button>
        ) : (
          <div className="h-10 flex items-center gap-2 px-3.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditor (Read-Only)</span>
          </div>
        )}
      </div>

      {/* Kanban Board Columns (Solid Beige Well & Ivory Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((col, colIdx) => {
          const colDeals = deals.filter((d) => d.stage === col.id);
          const colTotal = colDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

          return (
            <div
              key={col.id}
              className="pipeline-column flex flex-col rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 min-h-[550px] shadow-xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{col.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
                    {colDeals.length}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[var(--accent-brand)]">
                  {formatCurrency(colTotal)}
                </span>
              </div>

              {/* Deals in this Stage */}
              <div className="flex-1 mt-3 space-y-3 overflow-y-auto">
                {colDeals.map((deal) => {
                  const dealId = deal.id || deal._id;
                  const isWon = col.id === 'closed_won';

                  return (
                    <motion.div
                      key={dealId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`deal-card p-4 rounded-xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-xs relative group ${
                        isWon ? 'border-emerald-600/40 ring-1 ring-emerald-600/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                          {deal.dealName}
                        </h4>
                        {can('delete') ? (
                          <button
                            onClick={() => handleDelete(dealId)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-600 transition-all"
                            title="Delete Deal (Admin Clearance)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-2 text-xs font-semibold text-[var(--text-secondary)]">
                        {deal.customerName}
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-sm font-black font-mono text-[var(--text-primary)]">
                          {formatCurrency(deal.amount)}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--accent-brand)] font-bold">
                          {deal.probability}% Prob
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[var(--text-muted)]" />
                          {deal.rep || 'Elena V.'}
                        </span>

                        {/* Stage Steppers */}
                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              onClick={() => handleMoveStage(dealId, PIPELINE_STAGES[colIdx - 1].id)}
                              title="Move Backward"
                              className="p-1 rounded bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {colIdx < PIPELINE_STAGES.length - 1 && (
                            <button
                              onClick={() => handleMoveStage(dealId, PIPELINE_STAGES[colIdx + 1].id)}
                              title="Advance Deal"
                              className="p-1 rounded bg-[var(--accent-brand-dim)] hover:bg-[var(--accent-brand)] text-[var(--accent-brand)] hover:text-white border border-[var(--accent-brand-border)] transition-colors"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {isWon && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-800 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              WON
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {colDeals.length === 0 && (
                  <div className="h-32 flex items-center justify-center border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-muted)] text-xs">
                    No deals in stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Deal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Enterprise Sales Opportunity"
        subtitle="Track potential client deal value, representative, and close probability"
      >
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Deal Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise License 250 Seats"
              value={newDeal.dealName}
              onChange={(e) => setNewDeal({ ...newDeal, dealName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Company / Customer
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vertex Aerospace"
                value={newDeal.customerName}
                onChange={(e) => setNewDeal({ ...newDeal, customerName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Deal Amount (USD / INR)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="75000.00"
                value={newDeal.amount}
                onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Stage</label>
              <select
                value={newDeal.stage}
                onChange={(e) => {
                  const s = e.target.value;
                  const found = PIPELINE_STAGES.find((st) => st.id === s);
                  setNewDeal({ ...newDeal, stage: s, probability: found ? found.defaultProb : 50 });
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.defaultProb}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Lead Account Rep
              </label>
              <input
                type="text"
                placeholder="Elena Vance"
                value={newDeal.rep}
                onChange={(e) => setNewDeal({ ...newDeal, rep: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white shadow-sm transition-all"
            >
              Add Deal
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default SalesView;
