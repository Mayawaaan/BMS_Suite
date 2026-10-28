import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const customerSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, required: true },
    phone: { type: String },
    status: {
      type: String,
      enum: ['active', 'lead', 'churned'],
      default: 'lead',
    },
    totalSpend: { type: Number, default: 0 },
    dealsCount: { type: Number, default: 0 },
    lastContacted: { type: String },
    avatar: { type: String },
    businessType: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
  },
  { timestamps: true }
);

// Compound index scoping customer email per tenant
customerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
customerSchema.index({ tenantId: 1, status: 1 });

customerSchema.plugin(tenantScopingPlugin);

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
