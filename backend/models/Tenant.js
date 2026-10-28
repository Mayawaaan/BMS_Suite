import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    vertical: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'past_due', 'suspended', 'locked'],
      default: 'active',
      index: true,
    },
    planTier: {
      type: String,
      enum: ['free', 'starter', 'growth', 'enterprise'],
      default: 'starter',
    },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    billing: {
      cycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
      nextBillingDate: { type: Date },
      failedPaymentAttempts: { type: Number, default: 0 },
      mrr: { type: Number, default: 0 },
    },
    limits: {
      maxUsers: { type: Number, default: 10 },
      maxSkus: { type: Number, default: 1000 },
      maxInvoicesPerMonth: { type: Number, default: 500 },
      storageMb: { type: Number, default: 5000 },
    },
    settings: {
      fiscalYearStart: { type: Number, default: 4 },
      taxId: { type: String, default: '' },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      enabledModules: {
        type: [String],
        default: ['bills', 'sales', 'products', 'stock', 'revenue', 'customers', 'gl_ledger', 'dashboard'],
      },
    },
  },
  { timestamps: true }
);

// Custom Indexes
tenantSchema.index({ vertical: 1 });

export const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
export default Tenant;
