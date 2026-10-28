import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const workOrderSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    bomId: { type: String, required: true },
    targetProductId: { type: String, required: true },
    targetProductName: { type: String, required: true },
    targetSku: { type: String, required: true },
    quantityToProduce: { type: Number, required: true, min: 1 },
    quantityProduced: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    warehouse: { type: String, default: 'Plant Depot Alpha' },
    startDate: { type: String },
    completionDate: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

workOrderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });
workOrderSchema.index({ tenantId: 1, status: 1 });
workOrderSchema.plugin(tenantScopingPlugin);

export const WorkOrder = mongoose.models.WorkOrder || mongoose.model('WorkOrder', workOrderSchema);
export default WorkOrder;
