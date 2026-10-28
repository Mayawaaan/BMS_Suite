import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Tenant } from '../models/Tenant.js';
import { Bill } from '../models/Bill.js';
import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { Stock } from '../models/Stock.js';
import { Customer } from '../models/Customer.js';
import { getDbStatus } from '../config/db.js';
import { redisService } from '../config/redis.js';
import { signToken } from '../middleware/authMiddleware.js';
import { VERTICAL_TO_TENANT_MAP, DEFAULT_TENANTS, getInMemoryTenants, updateInMemoryTenant } from '../middleware/tenantMiddleware.js';
import { provisionNewTenantWithData } from '../services/tenantProvisioningService.js';
import { otpService } from '../services/otpService.js';
import { getInMemoryBills, setInMemoryBills } from './billController.js';
import { getInMemorySales, setInMemorySales } from './saleController.js';
import { getInMemoryProducts, setInMemoryProducts } from './productController.js';
import { getInMemoryStock, setInMemoryStock } from './stockController.js';
import { getInMemoryCustomers, setInMemoryCustomers } from './customerController.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

/**
 * Hash a plain password using bcrypt with cryptographic salt rounds
 */
export const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(plainPassword, salt);
};

/**
 * Securely verify plain password against bcrypt salted hash
 */
export const verifyPassword = async (plainPassword, hashedPasswordOrPlain) => {
  if (!plainPassword || !hashedPasswordOrPlain) return false;
  if (hashedPasswordOrPlain.startsWith('$2a$') || hashedPasswordOrPlain.startsWith('$2b$')) {
    return await bcrypt.compare(plainPassword, hashedPasswordOrPlain);
  }
  return plainPassword === hashedPasswordOrPlain;
};

// Bcrypt salted hash of default 'password123' (10 rounds)
const DEFAULT_HASHED_PASSWORD = '$2b$10$7t2E94WvyzeWTvTvDdoswuTvT0AwXKzAL5GyZHo4Tphb14/TZ.0US';

// Clean, curated accounts: Super Admin + Retail Shop (Admin, Staff, Auditor)
export const demoUsers = [
  {
    id: 'user-superadmin',
    name: 'Elena Vance',
    email: 'superadmin@zsyio.io',
    password: DEFAULT_HASHED_PASSWORD,
    role: 'superadmin',
    tenantId: 'tenant-universal',
    companyName: 'ZSYIO Global BMS',
    companyType: 'all',
    department: 'Platform Governance & Architecture',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Super Admin with universal platform governance, tenant control, and database authority.',
  },
  {
    id: 'user-shop-admin',
    name: 'Raj Patel',
    email: 'admin@retailshop.io',
    password: DEFAULT_HASHED_PASSWORD,
    role: 'admin',
    tenantId: 'tenant-retail',
    companyName: 'ZSYIO Retail Store & POS',
    companyType: 'shop',
    department: 'Store Management',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Store Proprietor overseeing counter registers, vendor invoices, inventory and sales.',
  },
  {
    id: 'user-shop-staff',
    name: 'Maya Lin',
    email: 'staff@retailshop.io',
    password: DEFAULT_HASHED_PASSWORD,
    role: 'staff',
    tenantId: 'tenant-retail',
    companyName: 'ZSYIO Retail Store & POS',
    companyType: 'shop',
    department: 'Front Counter Checkout',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Front Checkout Cashier with POS order entry, inventory lookups and receipt issuance.',
  },
  {
    id: 'user-shop-auditor',
    name: 'David Chen',
    email: 'auditor@retailshop.io',
    password: DEFAULT_HASHED_PASSWORD,
    role: 'auditor',
    tenantId: 'tenant-retail',
    companyName: 'ZSYIO Retail Store & POS',
    companyType: 'shop',
    department: 'Financial Compliance',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Store Auditor with read-only inspection access across retail payables, sales and tax ledgers.',
  },
];

let inMemoryUsers = [...demoUsers];

export const getInMemoryUsers = () => inMemoryUsers;
export const addInMemoryUser = (user) => {
  inMemoryUsers.unshift(user);
  return user;
};
export const updateInMemoryUser = (id, updates) => {
  const idx = inMemoryUsers.findIndex((u) => u.id === id || u._id === id);
  if (idx >= 0) {
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...updates };
    return inMemoryUsers[idx];
  }
  return null;
};
export const deleteInMemoryUser = (id) => {
  const idx = inMemoryUsers.findIndex((u) => u.id === id || u._id === id);
  if (idx >= 0) {
    const deleted = inMemoryUsers.splice(idx, 1);
    return deleted[0];
  }
  return null;
};

export const getDemoUsers = async (req, res) => {
  try {
    return res.json({
      success: true,
      count: inMemoryUsers.length,
      data: inMemoryUsers.map(({ password: _, ...safeUser }) => safeUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Token-based Secure Authentication with Bcrypt Salting
 */
export const login = async (req, res) => {
  try {
    const { email, password, demoId, role, companyType, tenantId } = req.body;

    if (email && typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        code: 'AUTH_MALFORMED_INPUT',
        message: 'Email must be a valid string.',
      });
    }

    if (password && typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        code: 'AUTH_MALFORMED_INPUT',
        message: 'Password must be a valid string.',
      });
    }

    let matchedUser = null;

    // 1. Direct Demo ID Selection
    if (demoId) {
      matchedUser = inMemoryUsers.find((u) => u.id === demoId);
    }

    // 2. Email / Password Match with Bcrypt Verification
    if (!matchedUser && email) {
      matchedUser = inMemoryUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      // If user not in memory and DB connected
      if (!matchedUser && getDbStatus().connected) {
        matchedUser = await User.findOne({ email: email.toLowerCase() });
      }

      if (matchedUser && password) {
        const isPasswordValid = await verifyPassword(password, matchedUser.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Invalid email or password. Please verify your credentials or use Forgot Password.',
          });
        }
      } else if (!matchedUser) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_USER_NOT_FOUND',
          message: 'No active account found with this email address.',
        });
      }
    }

    // 3. Fallback persona selection
    if (!matchedUser) {
      const targetVertical = companyType || 'all';
      matchedUser = inMemoryUsers.find(
        (u) => u.companyType === targetVertical && (role ? u.role === role : true)
      ) || inMemoryUsers[0];
    }

    // Resolved Tenant ID
    const effectiveTenantId =
      tenantId ||
      matchedUser.tenantId ||
      (matchedUser.companyType && VERTICAL_TO_TENANT_MAP[matchedUser.companyType]) ||
      'tenant-universal';

    const inMemoryTenants = getInMemoryTenants();
    const tenantObj =
      inMemoryTenants.find((t) => (t.id || t._id) === effectiveTenantId) ||
      DEFAULT_TENANTS.find((t) => (t.id || t._id) === effectiveTenantId) ||
      DEFAULT_TENANTS[0];

    const effectivePlan = tenantObj.planTier || matchedUser.planTier || 'starter';
    const computedMax = effectivePlan === 'enterprise' ? 99 : effectivePlan === 'growth' ? 3 : 1;
    let allowedVerts = matchedUser.allowedVerticals || tenantObj.allowedVerticals;
    if (!allowedVerts || !Array.isArray(allowedVerts) || allowedVerts.length === 0) {
      if (effectivePlan === 'enterprise') {
        allowedVerts = ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'];
      } else if (effectivePlan === 'growth') {
        allowedVerts = [matchedUser.companyType || 'shop', 'ecommerce', 'factory'];
      } else {
        allowedVerts = [matchedUser.companyType || 'shop'];
      }
    }

    const sessionUser = {
      id: matchedUser.id || matchedUser._id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: role || matchedUser.role,
      tenantId: effectiveTenantId,
      companyName: matchedUser.companyName || tenantObj.name,
      companyType: companyType || matchedUser.companyType || tenantObj.vertical,
      department: matchedUser.department,
      avatar: matchedUser.avatar,
      bio: matchedUser.bio,
      planTier: effectivePlan,
      maxBusinesses: computedMax,
      allowedVerticals: allowedVerts,
    };

    // Sign cryptographic multi-tenant JWT
    const token = signToken({
      userId: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.role,
      tenantId: sessionUser.tenantId,
      companyType: sessionUser.companyType,
    });

    return res.json({
      success: true,
      message: `Authenticated securely as ${sessionUser.name} (${sessionUser.role.toUpperCase()}) for tenant [${sessionUser.tenantId}]`,
      token,
      user: sessionUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Register Account with Bcrypt Password Salting & Dedicated Tenant
 * Supports Primary Vertical + Up to 3 Verticals in Growth Pack + All Verticals in Enterprise
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      companyName,
      companyType,
      department,
      tenantId,
      planTier = 'starter',
      billingCycle = 'monthly',
      selectedVerticals = [],
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const primaryVert = companyType || 'shop';
    let computedAllowed = [primaryVert];
    const maxBusinesses = planTier === 'enterprise' ? 99 : planTier === 'growth' ? 3 : 1;

    if (planTier === 'growth') {
      const additional = Array.isArray(selectedVerticals) ? selectedVerticals.filter((v) => v !== primaryVert && v !== 'all') : [];
      computedAllowed = [primaryVert, ...additional].slice(0, 3);
      if (computedAllowed.length === 1) {
        // Provide friendly defaults if user only selected primary
        const defaults = ['ecommerce', 'factory', 'software'].filter(v => v !== primaryVert);
        computedAllowed = [primaryVert, ...defaults.slice(0, 2)];
      }
    } else if (planTier === 'enterprise') {
      computedAllowed = ['all', 'shop', 'factory', 'industry', 'software', 'ecommerce'];
    }

    let finalTenantId = tenantId;
    let tenantObj = null;

    if (!finalTenantId) {
      // Automatically provision a new dedicated Tenant with 0 initial records
      const provisioned = await provisionNewTenantWithData({
        name: companyName || `${name}'s Organization`,
        vertical: primaryVert,
        planTier: planTier || 'starter',
        billingCycle: billingCycle || 'monthly',
        email,
        selectedVerticals: computedAllowed,
      });
      finalTenantId = provisioned.tenant.id;
      tenantObj = provisioned.tenant;
    } else {
      const inMemoryTenants = getInMemoryTenants();
      tenantObj =
        inMemoryTenants.find((t) => (t.id || t._id) === finalTenantId) ||
        DEFAULT_TENANTS.find((t) => (t.id || t._id) === finalTenantId) ||
        DEFAULT_TENANTS[0];
    }

    const hashedPassword = await hashPassword(password || 'password123');

    const newUser = {
      id: `user-${Date.now()}`,
      tenantId: finalTenantId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'admin',
      companyName: companyName || tenantObj.name || 'My Enterprise Corp',
      companyType: primaryVert,
      department: department || 'Operations',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      bio: `${role ? role.toUpperCase() : 'ADMIN'} at ${companyName || tenantObj.name}`,
      planTier,
      maxBusinesses,
      allowedVerticals: computedAllowed,
    };

    if (getDbStatus().connected) {
      const created = await User.create(newUser);
      const token = signToken({
        userId: created._id,
        email: created.email,
        role: created.role,
        tenantId: created.tenantId,
        companyType: created.companyType,
      });

      const { password: _, ...safeCreated } = created.toObject();

      return res.status(201).json({
        success: true,
        message: `Account created successfully with unique business '${tenantObj.name}'.`,
        token,
        user: { ...safeCreated, planTier: tenantObj.planTier, maxBusinesses: tenantObj.limits?.maxBusinesses, allowedVerticals: tenantObj.allowedVerticals },
      });
    }

    inMemoryUsers.unshift(newUser);
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
      companyType: newUser.companyType,
    });

    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: `Account registered successfully with unique business '${tenantObj.name}'.`,
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Request a 6-digit OTP for Forgot Password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    let userExists = inMemoryUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (!userExists && getDbStatus().connected) {
      const dbUser = await User.findOne({ email: cleanEmail });
      if (dbUser) userExists = true;
    }

    if (!userExists) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: `No registered account found with email '${cleanEmail}'. Please check your spelling.`,
      });
    }

    const otpResult = await otpService.generateOtp(cleanEmail);

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Valid for ${otpResult.expiresInMinutes} minutes.`,
      expiresAt: otpResult.expiresAt,
      devOtp: process.env.NODE_ENV !== 'production' ? otpResult.otp : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Verify 6-digit OTP code and receive password reset authorization token
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required.' });
    }

    const result = await otpService.verifyOtp(email, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reset Password using verified resetToken & Bcrypt Salting
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset authorization token, and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match.',
      });
    }

    const isTokenValid = await otpService.validateResetToken(email, resetToken);
    if (!isTokenValid) {
      return res.status(403).json({
        success: false,
        code: 'INVALID_RESET_TOKEN',
        message: 'Reset authorization token is invalid or has expired. Please restart the verification flow.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await hashPassword(newPassword);

    // Update in-memory user
    const memUser = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (memUser) {
      memUser.password = hashedPassword;
    }

    // Update in MongoDB
    if (getDbStatus().connected) {
      await User.findOneAndUpdate(
        { email: cleanEmail },
        { $set: { password: hashedPassword } }
      );
    }

    // Invalidate reset token
    await otpService.consumeResetToken(cleanEmail);

    return res.json({
      success: true,
      message: 'Your password has been successfully reset with cryptographic salting. You may now log in.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update active business verticals in user portfolio
 * Enforces maximum 3 for Growth Pack and unlimited (all) for Enterprise
 */
export const updatePortfolioVerticals = async (req, res) => {
  try {
    const { tenantId, verticals } = req.body;
    const targetTenantId = tenantId || req.tenantId || 'tenant-retail';

    if (!Array.isArray(verticals) || verticals.length === 0) {
      return res.status(400).json({ success: false, message: 'Verticals must be a non-empty array.' });
    }

    const inMemoryTenants = getInMemoryTenants();
    const tenant = inMemoryTenants.find((t) => (t.id || t._id) === targetTenantId) || DEFAULT_TENANTS[0];
    const planTier = tenant?.planTier || 'starter';
    const maxAllowed = planTier === 'enterprise' ? 99 : planTier === 'growth' ? 3 : 1;

    if (verticals.length > maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Plan '${planTier.toUpperCase()}' allows up to ${maxAllowed} business vertical${maxAllowed > 1 ? 's' : ''}. You selected ${verticals.length}.`,
      });
    }

    // Purge data for decommissioned verticals if requested
    if (req.body.purgedVerticals) {
      const toPurge = Array.isArray(req.body.purgedVerticals) ? req.body.purgedVerticals : [req.body.purgedVerticals];
      for (const p of toPurge) {
        await purgeVerticalData(targetTenantId, p);
      }
    } else if (req.body.purgedVertical) {
      await purgeVerticalData(targetTenantId, req.body.purgedVertical);
    }

    // Update in memory tenant
    tenant.allowedVerticals = verticals;
    updateInMemoryTenant(targetTenantId, { allowedVerticals: verticals });

    // Update all matching in-memory users
    inMemoryUsers.forEach((u) => {
      if (u.tenantId === targetTenantId) {
        u.allowedVerticals = verticals;
      }
    });

    if (getDbStatus().connected) {
      await Tenant.findOneAndUpdate(
        { $or: [{ _id: targetTenantId }, { id: targetTenantId }] },
        { $set: { allowedVerticals: verticals } }
      ).catch(() => {});
    }

    return res.json({
      success: true,
      message: `Business portfolio updated with ${verticals.length} active vertical${verticals.length > 1 ? 's' : ''}.`,
      allowedVerticals: verticals,
      maxBusinesses: maxAllowed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Permanently purge all transactional, inventory, customer, and billing data for a decommissioned niche
 */
export const purgeVerticalData = async (tenantId, vertical) => {
  if (!vertical) return;
  const isUniversal = tenantId === 'tenant-universal';

  try {
    setInMemoryBills(getInMemoryBills().filter((b) => !((b.businessType === vertical) && (isUniversal || b.tenantId === tenantId))));
    setInMemorySales(getInMemorySales().filter((s) => !((s.businessType === vertical) && (isUniversal || s.tenantId === tenantId))));
    setInMemoryProducts(getInMemoryProducts().filter((p) => !((p.businessType === vertical) && (isUniversal || p.tenantId === tenantId))));
    setInMemoryStock(getInMemoryStock().filter((st) => !((st.businessType === vertical) && (isUniversal || st.tenantId === tenantId))));
    setInMemoryCustomers(getInMemoryCustomers().filter((c) => !((c.businessType === vertical) && (isUniversal || c.tenantId === tenantId))));
  } catch (err) {
    console.warn('[purgeVerticalData in-memory error]:', err.message);
  }

  if (getDbStatus().connected) {
    const query = { businessType: vertical };
    if (!isUniversal) query.tenantId = tenantId;
    try {
      await Promise.all([
        Bill.deleteMany(query),
        Sale.deleteMany(query),
        Product.deleteMany(query),
        Stock.deleteMany(query),
        Customer.deleteMany(query),
      ]);
    } catch (err) {
      console.warn('[purgeVerticalData db error]:', err.message);
    }
  }

  try {
    await redisService.delByPattern(`crm:${tenantId}:*`);
    await redisService.delByPattern('crm:tenant-universal:*');
  } catch (err) {
    // Redis optional
  }
};

/**
 * Endpoint to explicitly decommission and purge a niche vertical from portfolio
 */
export const purgePortfolioVertical = async (req, res) => {
  try {
    const { tenantId, vertical, replacementVertical } = req.body;
    const targetTenantId = tenantId || req.tenantId || 'tenant-retail';

    if (!vertical) {
      return res.status(400).json({ success: false, message: 'Vertical to purge is required.' });
    }

    await purgeVerticalData(targetTenantId, vertical);

    const inMemoryTenants = getInMemoryTenants();
    const tenant = inMemoryTenants.find((t) => (t.id || t._id) === targetTenantId);
    let updatedVerticals = [];

    if (tenant) {
      let allowed = tenant.allowedVerticals || ['shop'];
      allowed = allowed.filter((v) => v !== vertical);
      if (replacementVertical && !allowed.includes(replacementVertical)) {
        allowed.push(replacementVertical);
      }
      tenant.allowedVerticals = allowed;
      updateInMemoryTenant(targetTenantId, { allowedVerticals: allowed });
      updatedVerticals = allowed;

      inMemoryUsers.forEach((u) => {
        if (u.tenantId === targetTenantId) {
          u.allowedVerticals = allowed;
          if (u.companyType === vertical && replacementVertical) {
            u.companyType = replacementVertical;
          }
        }
      });

      if (getDbStatus().connected) {
        await Tenant.findOneAndUpdate(
          { $or: [{ _id: targetTenantId }, { id: targetTenantId }] },
          { $set: { allowedVerticals: allowed } }
        ).catch(() => {});
      }
    }

    return res.json({
      success: true,
      message: `Niche vertical '${vertical}' decommissioned and all transaction data permanently purged.`,
      purgedVertical: vertical,
      replacementVertical: replacementVertical || null,
      allowedVerticals: updatedVerticals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getMe = async (req, res) => {
  try {
    if (req.user) {
      const user = inMemoryUsers.find((u) => u.id === req.user.userId || u.email === req.user.email) || req.user;
      const { password: _, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    }
    const { password: _, ...safeUser } = inMemoryUsers[0];
    return res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
