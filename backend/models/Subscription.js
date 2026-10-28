import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const subscriptionSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    subscriptionNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    planName: { type: String, required: true, default: 'Enterprise Growth Tier' },
    mrr: { type: Number, required: true, min: 0 },
    billingInterval: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'past_due', 'paused', 'cancelled'],
      default: 'active',
      index: true,
    },
    seats: { type: Number, default: 5 },
    currentPeriodStart: { type: String, required: true },
    currentPeriodEnd: { type: String, required: true },
    nextBillingDate: { type: String, required: true },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subscriptionSchema.index({ tenantId: 1, subscriptionNumber: 1 }, { unique: true });
subscriptionSchema.index({ tenantId: 1, status: 1 });
subscriptionSchema.plugin(tenantScopingPlugin);

export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
