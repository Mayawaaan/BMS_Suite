import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { getStatusInfo, APP_CONFIG } from '../../core/config/systemConfig';

export const InvoiceViewerModal = ({ isOpen, onClose, bill, onMarkPaid }) => {
  const printRef = useRef(null);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = Array.isArray(bill.items) && bill.items.length > 0
    ? bill.items
    : [
        {
          description: bill.title || 'Enterprise SaaS Services / Operational Overheads',
          quantity: 1,
          unitPrice: bill.amount,
          total: bill.amount,
        },
      ];

  const subtotal = bill.subtotal || items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const taxAmount = bill.taxAmount || 0;
  const discount = bill.discount || 0;
  const totalAmount = bill.amount;
  const statusInfo = getStatusInfo(bill.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C1917]/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl rounded-3xl bg-[#FFFFFF] border border-[var(--border-strong)] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] text-[var(--text-primary)]"
        >
          {/* Action Toolbar Header */}
          <div className="flex items-center justify-between p-4 sm:px-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
              <FileText className="w-4 h-4 text-[var(--accent-brand)]" />
              <span>Official Invoice Preview • {bill.invoiceNumber || 'INV-2026-X'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-brand)] hover:bg-[var(--accent-brand-hover)] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              {bill.status !== 'paid' && onMarkPaid && (
                <button
                  onClick={() => onMarkPaid(bill.id || bill._id, 'paid')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl badge-success text-xs font-semibold transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Paid</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet Body */}
          <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-[#FFFFFF] print:p-0 print:bg-white print:text-black">
            {/* Invoice Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-[var(--border-color)]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-brand)] flex items-center justify-center text-white font-black text-lg shadow-xs">
                    Z
                  </div>
                  <span className="text-xl font-black text-[var(--text-primary)] tracking-tight">{APP_CONFIG.name}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">{APP_CONFIG.tagline}</p>
                <p className="text-[11px] text-[var(--text-dim)] font-mono mt-0.5">Tax ID: {APP_CONFIG.taxId}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight block">
                  INVOICE
                </span>
                <span className="text-sm font-mono font-bold text-[var(--accent-brand)]">
                  {bill.invoiceNumber || 'INV-2026-X'}
                </span>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${statusInfo.badgeClass}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Billed To / Dates Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[var(--border-color)] text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider block mb-1">
                  Billed To / Payee:
                </span>
                <div className="text-base font-bold text-[var(--text-primary)]">{bill.vendorOrClient}</div>
                {bill.clientEmail && (
                  <div className="text-[var(--text-muted)] mt-0.5">{bill.clientEmail}</div>
                )}
                {bill.clientAddress && (
                  <div className="text-[var(--text-muted)] mt-0.5 whitespace-pre-line">{bill.clientAddress}</div>
                )}
                <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  Category: {bill.category}
                </div>
              </div>

              <div className="space-y-2 sm:text-right">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">Issue Date:</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">
                    {formatDate(bill.issueDate || bill.createdAt || bill.dueDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">Payment Due:</span>
                  <span className="font-mono text-[var(--accent-brand)] font-bold">
                    {formatDate(bill.dueDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">Payment Method:</span>
                  <span className="font-mono text-[var(--text-secondary)]">
                    {bill.paymentMethod || 'Corporate Wire'}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Lines Table */}
            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[10px] font-mono uppercase text-[var(--text-muted)] bg-[var(--bg-card-subtle)]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-surface-hover)]">
                      <td className="py-3 px-3 text-[var(--text-primary)] font-medium">
                        {item.description}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-[var(--text-secondary)]">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-[var(--text-secondary)]">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[var(--text-primary)]">
                        {formatCurrency(item.total || (item.quantity * item.unitPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Totals Breakdown */}
            <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="max-w-xs text-xs text-[var(--text-muted)]">
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block mb-1">
                  Payment Instructions & Terms:
                </span>
                <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                  {bill.notes || 'Please remit payment within the agreed invoice due date. Wire instructions available via corporate banking portal.'}
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Tax ({bill.taxRate || 0}%):</span>
                    <span className="font-mono text-[var(--text-primary)]">+{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-strong)]">
                  <span>Total Due:</span>
                  <span className="font-mono text-[var(--accent-brand)] text-lg">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InvoiceViewerModal;
