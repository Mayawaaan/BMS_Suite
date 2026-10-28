import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Tag,
  Star,
  Percent,
  TrendingUp,
  Trash2,
  Edit2,
  Box,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Modal } from '../../shared/components/Modal';
import { formatCurrency } from '../../shared/utils/formatters';
import { productsService } from './ProductsService';
import { productsAnimations } from './ProductsAnimations';
import { useBusinessProfile } from '../../core/contexts/BusinessProfileContext';
import { useAuth } from '../../core/contexts/AuthContext';
import './ProductsStyles.css';

export const ProductsView = () => {
  const { profileId, terminology, activeProfile } = useBusinessProfile();
  const { can } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Product Form State
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    category: 'General',
    price: '',
    costPrice: '',
    stockQty: 100,
    minStockLevel: 10,
    status: 'active',
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll(profileId);
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [profileId]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;

    try {
      const created = await productsService.create({
        ...newProd,
        businessType: profileId !== 'all' ? profileId : 'software',
      });
      setProducts([created, ...products]);
      setIsModalOpen(false);
      setNewProd({
        name: '',
        sku: '',
        category: 'Software Subscription',
        price: '',
        costPrice: '',
        stockQty: 100,
        minStockLevel: 10,
        status: 'active',
      });
    } catch (err) {
      console.error('Error creating product', err);
    }
  };

  const handleDelete = async (id) => {
    if (!can('delete')) {
      alert('Permission Denied: Deleting products requires Admin or Superadmin clearance.');
      return;
    }
    try {
      await productsService.delete(id);
      setProducts(products.filter((p) => p.id !== id && p._id !== id));
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Analytics
  const avgMargin =
    products.length > 0
      ? Math.round(
          products.reduce((acc, p) => {
            const margin = p.price > 0 ? ((p.price - (p.costPrice || 0)) / p.price) * 100 : 0;
            return acc + margin;
          }, 0) / products.length
        )
      : 0;

  return (
    <motion.div
      variants={productsAnimations.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">Total SKUs in Catalog</span>
            <div className="text-2xl font-black text-white font-mono mt-1">{products.length}</div>
          </div>
          <span className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/5 block">Active product variants</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-800 font-semibold">Average Profit Margin</span>
            <div className="text-2xl font-black text-emerald-800 font-mono mt-1">{avgMargin}%</div>
          </div>
          <span className="text-xs text-emerald-800/80 mt-2 pt-2 border-t border-emerald-500/20 block font-medium">Across all catalog units</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#9A3412]/10 border border-[#9A3412]/20 backdrop-blur-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#9A3412] font-semibold">Catalog Health</span>
            <div className="text-2xl font-black text-[#9A3412] font-mono mt-1">100% Active</div>
          </div>
          <span className="text-xs text-[#9A3412]/80 mt-2 pt-2 border-t border-[#9A3412]/20 block font-medium">Zero discontinued items</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search product name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[#9A3412] transition-all"
            />
          </div>

          <div className="h-10 flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`h-full px-3 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {can('create') ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 flex items-center justify-center gap-2 px-5 text-xs font-bold rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white shadow-md shadow-[#9A3412]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Product SKU</span>
          </button>
        ) : (
          <div className="h-10 flex items-center gap-2 px-4 rounded-xl bg-[#FAF6EF] border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditor (Read-Only)</span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((prod) => {
          const prodId = prod.id || prod._id;
          const margin =
            prod.price > 0
              ? Math.round(((prod.price - (prod.costPrice || 0)) / prod.price) * 100)
              : 0;

          return (
            <motion.div
              key={prodId}
              variants={productsAnimations.cardVariants}
              className="product-card rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-xl relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-400">
                    {prod.sku}
                  </span>
                  <Badge status={prod.status} size="xs" />
                </div>

                <h3 className="mt-3 text-base font-bold text-white tracking-tight">{prod.name}</h3>
                <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3" />
                  {prod.category}
                </span>

                <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Retail Price</span>
                    <div className="text-base font-black text-white font-mono mt-0.5">
                      {formatCurrency(prod.price)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Cost Price</span>
                    <div className="text-base font-semibold text-slate-300 font-mono mt-0.5">
                      {formatCurrency(prod.costPrice || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="margin-chip px-2.5 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {margin}% Margin
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {prod.salesCount || 0} sales
                  </span>
                  {can('delete') ? (
                    <button
                      onClick={() => handleDelete(prodId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Product (Admin Clearance)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-white/10 text-slate-400">
          No products found matching your search criteria.
        </div>
      )}

      {/* Create Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Catalog Product"
        subtitle="Define SaaS software license, hardware appliance, or SLA package"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI Vision Edge Processor Module"
              value={newProd.name}
              onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code</label>
              <input
                type="text"
                placeholder="OP-AI-EDGE-01"
                value={newProd.sku}
                onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={newProd.category}
                onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Software Subscription">Software Subscription</option>
                <option value="Hardware Devices">Hardware Devices</option>
                <option value="Add-on Module">Add-on Module</option>
                <option value="Hardware Appliances">Hardware Appliances</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Selling Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="1200.00"
                value={newProd.price}
                onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cost Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="240.00"
                value={newProd.costPrice}
                onChange={(e) => setNewProd({ ...newProd, costPrice: e.target.value })}
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
              Save Product SKU
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
