import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const revenueMetricSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    period: { type: String, required: true },
    mrr: { type: Number, required: true },
    arr: { type: Number, required: true },
    netRevenue: { type: Number, required: true },
    expenses: { type: Number, required: true },
    profitMargin: { type: Number, required: true },
    activeSubscriptions: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    growthRate: { type: Number, default: 0 },
    businessType: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
  },
  { timestamps: true }
);

revenueMetricSchema.index({ tenantId: 1, period: 1 });
revenueMetricSchema.plugin(tenantScopingPlugin);

export const RevenueMetric = mongoose.models.RevenueMetric || mongoose.model('RevenueMetric', revenueMetricSchema);
export default RevenueMetric;
