import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const stockSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    warehouse: { type: String, default: 'Main Hub' },
    currentStock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },
    minThreshold: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    lastRestocked: { type: String },
    businessType: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
  },
  { timestamps: true }
);

stockSchema.index({ tenantId: 1, productId: 1, warehouse: 1 });
stockSchema.index({ tenantId: 1, status: 1 });

stockSchema.plugin(tenantScopingPlugin);

export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);
export default Stock;
