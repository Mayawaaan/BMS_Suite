import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  Plus,
  Search,
  Warehouse,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Trash2,
  TrendingDown,
  ArrowUpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Modal } from '../../shared/components/Modal';
import { formatDate } from '../../shared/utils/formatters';
import { stockService } from './StockService';
import { stockAnimations } from './StockAnimations';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { useAuth } from '../../core/contexts/AuthContext';
import './StockStyles.css';

export const StockView = () => {
  const { profileId, terminology, activeProfile } = useBusinessProfile();
  const { can } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Stock Form State
  const [newItem, setNewItem] = useState({
    productName: '',
    sku: '',
    warehouse: 'Main Hub Depot',
    currentStock: 50,
    reservedStock: 0,
    minThreshold: 15,
  });

  const loadStock = async () => {
    try {
      setLoading(true);
      const data = await stockService.getAll(profileId);
      setStockItems(data || []);
    } catch (err) {
      console.error('Failed to load stock', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, [profileId]);

  const handleCreateStock = async (e) => {
    e.preventDefault();
    if (!newItem.productName) return;

    try {
      const created = await stockService.create({
        ...newItem,
        businessType: profileId !== 'all' ? profileId : 'software',
      });
      setStockItems([created, ...stockItems]);
      setIsModalOpen(false);
      setNewItem({
        productName: '',
        sku: '',
        warehouse: 'North America Hub (Chicago)',
        currentStock: 50,
        reservedStock: 0,
        minThreshold: 15,
      });
    } catch (err) {
      console.error('Error creating stock item', err);
    }
  };

  const handleQuickRestock = async (id, currentQty, addQty) => {
    if (!can('edit')) {
      alert('Permission Denied: Inventory adjustments require Staff, Manager, or Admin clearance.');
      return;
    }
    try {
      const newQty = currentQty + addQty;
      const updated = await stockService.updateLevel(id, newQty);
      setStockItems(stockItems.map((item) => (item.id === id || item._id === id ? updated : item)));
    } catch (err) {
      console.error('Error restocking', err);
    }
  };

  const handleDelete = async (id) => {
    if (!can('delete')) {
      alert('Permission Denied: Deleting inventory records requires Admin or Superadmin clearance.');
      return;
    }
    try {
      await stockService.delete(id);
      setStockItems(stockItems.filter((i) => i.id !== id && i._id !== id));
    } catch (err) {
      console.error('Error deleting stock record', err);
    }
  };

  const warehouses = ['all', ...new Set(stockItems.map((s) => s.warehouse))];

  const filtered = stockItems.filter((item) => {
    const matchesWh = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesWh && matchesSearch;
  });

  // Metrics
  const totalUnits = stockItems.reduce((sum, s) => sum + (Number(s.currentStock) || 0), 0);
  const lowStockCount = stockItems.filter((s) => s.status === 'low_stock').length;
  const outOfStockCount = stockItems.filter((s) => s.status === 'out_of_stock').length;

  return (
    <motion.div
      variants={stockAnimations.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400">Total Units in Network</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {totalUnits.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Across all warehouses</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-amber-800 font-semibold">Low Stock Threshold</span>
          <div className="text-2xl font-black text-amber-800 font-mono mt-1">
            {lowStockCount} SKUs
          </div>
          <span className="text-xs text-amber-800/80 mt-1 block font-medium">Approaching reorder point</span>
        </div>

        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 backdrop-blur-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-rose-800 font-semibold">Depleted / Stockout</span>
          <div className="text-2xl font-black text-rose-800 font-mono mt-1">
            {outOfStockCount} SKUs
          </div>
          <span className="text-xs text-rose-800/80 mt-1 block font-medium">Immediate procurement needed</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search hardware, sensor, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[#9A3412]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs">
            {warehouses.map((wh) => (
              <button
                key={wh}
                onClick={() => setSelectedWarehouse(wh)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedWarehouse === wh
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {wh === 'all' ? 'All Hubs' : wh}
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
            <span>New Stock SKU</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditor (Read-Only)</span>
          </div>
        )}
      </div>

      {/* Stock Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6">Hardware SKU & Name</th>
                <th className="py-4 px-6">Warehouse Facility</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6">Reserved</th>
                <th className="py-4 px-6">Min Threshold</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item) => {
                const itemId = item.id || item._id;
                const ratio = Math.min(100, Math.round((item.currentStock / (item.minThreshold * 3)) * 100));

                return (
                  <tr
                    key={itemId}
                    className={`transition-colors ${
                      item.status === 'out_of_stock'
                        ? 'stock-row-out'
                        : item.status === 'low_stock'
                        ? 'stock-row-low'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm">{item.productName}</div>
                      <span className="text-[11px] font-mono text-indigo-400">{item.sku}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                        {item.warehouse}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-white text-base">
                        {item.currentStock} units
                      </div>
                      <div className="w-24 h-1.5 rounded-full stock-meter-bg mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.currentStock === 0
                              ? 'bg-rose-500'
                              : item.currentStock <= item.minThreshold
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${item.currentStock === 0 ? 100 : Math.max(10, ratio)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {item.reservedStock || 0} units
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {item.minThreshold} units
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={item.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {can('edit') && (
                          <button
                            onClick={() => handleQuickRestock(itemId, item.currentStock, 25)}
                            title="Restock +25 Units"
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-mono font-bold transition-all"
                          >
                            +25 Restock
                          </button>
                        )}
                        {can('delete') ? (
                          <button
                            onClick={() => handleDelete(itemId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Stock Record (Admin Clearance)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No inventory records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Inventory Item SKU"
        subtitle="Track physical units across regional fulfillment centers"
      >
        <form onSubmit={handleCreateStock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hardware Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Edge Gateway Compute Node Gen-4"
              value={newItem.productName}
              onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code</label>
              <input
                type="text"
                placeholder="HW-NODE-G4"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse</label>
              <select
                value={newItem.warehouse}
                onChange={(e) => setNewItem({ ...newItem, warehouse: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="North America Hub (Chicago)">North America Hub (Chicago)</option>
                <option value="EU Central Hub (Frankfurt)">EU Central Hub (Frankfurt)</option>
                <option value="APAC Hub (Singapore)">APAC Hub (Singapore)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Stock Qty
              </label>
              <input
                type="number"
                required
                value={newItem.currentStock}
                onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Min Safety Threshold
              </label>
              <input
                type="number"
                required
                value={newItem.minThreshold}
                onChange={(e) => setNewItem({ ...newItem, minThreshold: e.target.value })}
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
              Save Stock Item
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
