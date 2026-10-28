import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const posSessionSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    sessionNumber: { type: String, required: true },
    registerId: { type: String, default: 'Register #1' },
    cashierId: { type: String, required: true },
    cashierName: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true,
    },
    openingFloat: { type: Number, required: true, default: 200.0 },
    closingCash: { type: Number, default: 0 },
    expectedCash: { type: Number, default: 0 },
    cashDiscrepancy: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    transactionsCount: { type: Number, default: 0 },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

posSessionSchema.index({ tenantId: 1, sessionNumber: 1 }, { unique: true });
posSessionSchema.plugin(tenantScopingPlugin);

export const PosSession = mongoose.models.PosSession || mongoose.model('PosSession', posSessionSchema);
export default PosSession;
