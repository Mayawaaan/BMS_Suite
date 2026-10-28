import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  Calculator,
  Calendar,
  Sparkles,
  Package,
  Users,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../../shared/utils/formatters';
import { customersService } from '../customers/CustomersService';
import { productsService } from '../products/ProductsService';
import { getStatusInfo, PAYMENT_METHODS } from '../../core/config/systemConfig';

export const CreateInvoiceModal = ({
  isOpen,
  onClose,
  onSubmit,
  activeProfile,
  profileId,
}) => {
  const [mode, setMode] = useState('itemized'); // 'itemized' | 'quick'
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [title, setTitle] = useState('');
  const [vendorOrClient, setVendorOrClient] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('pending');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Wire');
  const [notes, setNotes] = useState('');
  const [businessType, setBusinessType] = useState('software');

  // Multi Line Items State
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);

  // Tax and Discount State
  const [taxRate, setTaxRate] = useState(10); // 10%
  const [discount, setDiscount] = useState(0);

  // Quick mode single amount
  const [quickAmount, setQuickAmount] = useState('');

  // Auto-generate invoice number & dates on open
  useEffect(() => {
    if (isOpen) {
      const year = new Date().getFullYear();
      const randomId = Math.floor(100 + Math.random() * 900);
      const prefix = profileId && profileId !== 'all' ? profileId.toUpperCase() : 'INV';
      setInvoiceNumber(`${prefix}-${year}-${randomId}`);
      
      const today = new Date().toISOString().split('T')[0];
      setIssueDate(today);
      
      // Default Net 30
      const net30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDueDate(net30);

      setBusinessType(profileId !== 'all' ? profileId : 'software');
      setCategory(activeProfile?.quickActionPreset?.billCategory || 'General');

      // Preload customers and products
      customersService.getAll(profileId).then((data) => setCustomers(data || []));
      productsService.getAll(profileId).then((data) => setProducts(data || []));
    }
  }, [isOpen, profileId, activeProfile]);

  // Line item helpers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const qty = Number(updated[index].quantity) || 0;
    const price = Number(updated[index].unitPrice) || 0;
    updated[index].total = qty * price;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const selectProductToItem = (index, prod) => {
    const updated = [...items];
    updated[index] = {
      description: `${prod.name} (${prod.sku})`,
      quantity: 1,
      unitPrice: prod.price,
      total: prod.price,
    };
    setItems(updated);
  };

  const selectCustomer = (cust) => {
    setVendorOrClient(cust.company || cust.name);
    setClientEmail(cust.email || '');
    if (!title) {
      setTitle(`Invoice for ${cust.company || cust.name}`);
    }
  };

  // Preset Date Helper
  const setDueDatePreset = (days) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setDueDate(d.toISOString().split('T')[0]);
  };

  // Calculations
  const subtotal = mode === 'itemized'
    ? items.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
    : Number(quickAmount) || 0;

  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - (Number(discount) || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vendorOrClient) return;

    const payload = {
      title: title || `Invoice to ${vendorOrClient}`,
      invoiceNumber,
      vendorOrClient,
      clientEmail,
      clientAddress,
      amount: grandTotal,
      subtotal,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      discount: Number(discount) || 0,
      issueDate,
      dueDate,
      category,
      status,
      paymentMethod,
      notes,
      businessType,
      items: mode === 'itemized' ? items : [
        {
          description: title || 'Operational Bill / Invoice',
          quantity: 1,
          unitPrice: grandTotal,
          total: grandTotal,
        }
      ],
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl rounded-3xl bg-[#0B0F19] border border-white/15 shadow-2xl shadow-black/90 z-10 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:px-8 bg-slate-900/90 border-b border-white/10 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Invoice & Bill Creation Studio
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeProfile?.theme?.badgeBg || 'bg-indigo-500/10 text-indigo-400'}`}>
                  {activeProfile?.name || 'Enterprise'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generate itemized customer invoices, commercial payables, or quick store receipts
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('itemized')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    mode === 'itemized'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Itemized Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setMode('quick')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    mode === 'quick'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quick Bill
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Scroll Area */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Top Row: Invoice #, Title, Customer selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Invoice / Bill Number
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl bg-white/5 border border-white/10 text-indigo-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bill / Invoice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Enterprise Software Services & Support"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Billed To / Entity & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Client / Payee Entity</span>
                  {customers.length > 0 && (
                    <span className="text-[10px] text-indigo-400 font-mono">Quick Pick</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Fintech Corp"
                    value={vendorOrClient}
                    onChange={(e) => setVendorOrClient(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {/* Fast customer chip pills */}
                {customers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {customers.slice(0, 3).map((c) => (
                      <button
                        type="button"
                        key={c.id || c._id}
                        onClick={() => selectCustomer(c)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-white/5 transition-colors"
                      >
                        {c.company || c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="billing@client.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="General">General Invoicing</option>
                  <option value="Cloud Hosting">Cloud Hosting & Infra</option>
                  <option value="Raw Materials">Raw Materials & Stamping</option>
                  <option value="Store Supplies">Store Supplies & Goods</option>
                  <option value="Equipment Lease">Equipment Lease & Capex</option>
                  <option value="3PL Shipping">3PL Logistics & Freight</option>
                  <option value="Facilities">Facilities & Lease</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>
            </div>

            {/* Dates & Terms Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-1 mt-1 text-[10px]">
                  <button type="button" onClick={() => setDueDatePreset(0)} className="text-slate-400 hover:text-white">Due Today</button>
                  <span className="text-slate-600">•</span>
                  <button type="button" onClick={() => setDueDatePreset(15)} className="text-slate-400 hover:text-white">Net 15</button>
                  <span className="text-slate-600">•</span>
                  <button type="button" onClick={() => setDueDatePreset(30)} className="text-indigo-400 hover:text-indigo-300">Net 30</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                >
                  {['pending', 'paid', 'overdue'].map((s) => (
                    <option key={s} value={s}>{getStatusInfo(s).label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode 1: Itemized Multi-Line Items */}
            {mode === 'itemized' && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400" />
                    Itemized Line Items
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 grid grid-cols-12 gap-3 items-center"
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Item name, description, SKU..."
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                        />
                        {/* Quick pick product dropdown if available */}
                        {products.length > 0 && !item.description && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {products.slice(0, 2).map((p) => (
                              <button
                                key={p.id || p._id}
                                type="button"
                                onClick={() => selectProductToItem(index, p)}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 hover:text-indigo-300 truncate max-w-[140px]"
                              >
                                + {p.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5 sm:hidden">Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono text-center rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5 sm:hidden">Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono text-right rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-1 text-right font-mono font-bold text-xs text-white">
                        {formatCurrency(item.total)}
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: Quick Expense Single Amount */}
            {mode === 'quick' && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Total Bill Amount (USD)
                </label>
                <div className="relative max-w-sm">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="4500.00"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-base font-mono font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Tax, Discount, Notes & Live Totals */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Left Column: Notes & Business Type */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Invoice Notes & Payment Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Bank transfer due within Net 30 days. Remit to SWIFT: OMNI9923..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operating Vertical
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="software">Software & Cloud Tech</option>
                    <option value="shop">Retail Shop & POS</option>
                    <option value="factory">Manufacturing & Factory</option>
                    <option value="industry">Heavy Industries & EPC</option>
                    <option value="ecommerce">E-Commerce & D2C Brands</option>
                    <option value="all">Universal (All Verticals)</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Calculation Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white text-sm font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-400">GST / Tax (%):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-16 px-2 py-1 text-xs font-mono text-right rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    />
                    <span className="font-mono text-slate-300 w-20 text-right">
                      +{formatCurrency(taxAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-400">Discount (₹):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono text-right rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    />
                    <span className="font-mono text-emerald-400 w-20 text-right">
                      -{formatCurrency(Number(discount) || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Grand Total Due:</span>
                  <span className="text-xl font-black font-mono text-indigo-400">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Issue Invoice ({formatCurrency(grandTotal)})</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
