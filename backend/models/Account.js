import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const accountSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['asset', 'liability', 'equity', 'revenue', 'cogs', 'expense'],
      required: true,
      index: true,
    },
    normalBalance: {
      type: String,
      enum: ['debit', 'credit'],
      required: true,
    },
    balance: { type: Number, default: 0 },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index scoping account code uniqueness strictly per tenant
accountSchema.index({ tenantId: 1, code: 1 }, { unique: true });
accountSchema.index({ tenantId: 1, type: 1 });

accountSchema.plugin(tenantScopingPlugin);

export const Account = mongoose.models.Account || mongoose.model('Account', accountSchema);
export default Account;
