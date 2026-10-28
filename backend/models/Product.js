import mongoose from 'mongoose';
import { tenantScopingPlugin } from '../plugins/tenantScopingPlugin.js';

const productSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, default: 'General' },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    stockQty: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ['active', 'draft', 'discontinued'],
      default: 'active',
    },
    rating: { type: Number, default: 5.0 },
    salesCount: { type: Number, default: 0 },
    businessType: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring SKU uniqueness is scoped strictly per tenant
productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, status: 1 });

productSchema.plugin(tenantScopingPlugin);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
