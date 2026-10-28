import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const billSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true },
    title: { type: String, required: true },
    vendorOrClient: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    category: { type: String, default: 'General' },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'Wire Transfer' },
    notes: { type: String },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    clientEmail: { type: String },
    clientAddress: { type: String },
    issueDate: { type: String },
    businessType: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring invoice uniqueness is scoped strictly per tenant
billSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
billSchema.index({ tenantId: 1, status: 1 });
billSchema.index({ tenantId: 1, dueDate: 1 });

billSchema.plugin(tenantScopingPlugin);

export const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
export default Bill;
