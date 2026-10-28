import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const saleSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    dealName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    stage: {
      type: String,
      enum: ['prospect', 'qualified', 'proposal', 'closed_won', 'closed_lost'],
      default: 'prospect',
    },
    probability: { type: Number, default: 20 },
    expectedCloseDate: { type: String },
    rep: { type: String, default: 'Unassigned' },
    businessType: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
  },
  { timestamps: true }
);

saleSchema.index({ tenantId: 1, stage: 1 });
saleSchema.index({ tenantId: 1, expectedCloseDate: 1 });

saleSchema.plugin(tenantScopingPlugin);

export const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
export default Sale;
