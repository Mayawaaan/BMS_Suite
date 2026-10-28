import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    tenantId: { type: String, default: 'tenant-universal', index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, default: 'password123' },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'staff', 'auditor'],
      default: 'admin',
      index: true,
    },
    companyName: { type: String, default: 'OmniPulse Global Corp' },
    companyType: {
      type: String,
      enum: ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'],
      default: 'software',
    },
    department: { type: String, default: 'Operations' },
    avatar: { type: String },
    bio: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'invited'], default: 'active' },
  },
  { timestamps: true }
);

// Compound index scoping email uniqueness per tenant (Superadmins can belong to universal)
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
