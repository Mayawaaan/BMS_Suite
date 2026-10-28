import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const bomComponentSchema = new mongoose.Schema(
  {
    rawProductId: { type: String },
    rawProductName: { type: String, required: true },
    rawSku: { type: String, required: true },
    quantityRequired: { type: Number, required: true, default: 1 },
    unitCost: { type: Number, required: true, default: 0 },
    scrapFactorPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const bomSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    bomNumber: { type: String, required: true },
    name: { type: String, required: true },
    finishedProductId: { type: String, required: true },
    finishedProductName: { type: String, required: true },
    finishedSku: { type: String, required: true },
    components: [bomComponentSchema],
    laborCost: { type: Number, default: 0 },
    overheadCost: { type: Number, default: 0 },
    totalUnitCost: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bomSchema.index({ tenantId: 1, bomNumber: 1 }, { unique: true });
bomSchema.index({ tenantId: 1, finishedSku: 1 });
bomSchema.plugin(tenantScopingPlugin);

export const Bom = mongoose.models.Bom || mongoose.model('Bom', bomSchema);
export default Bom;
