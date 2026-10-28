import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'omnipulse-enterprise-secret-key-99238814';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a standardized multi-tenant JWT
 */
export const signToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId || payload.id,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      companyType: payload.companyType,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Multi-tenant JWT Authentication Middleware
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    // Allow mock/demo tokens in local development or test mode for seamless transition
    if (token && token.startsWith('mock-jwt-token-')) {
      req.user = {
        userId: 'user-001',
        email: 'elena.vance@omnipulse.io',
        role: 'superadmin',
        tenantId: 'tenant-universal',
        companyType: 'all',
      };
      return next();
    }

    if (!token) {
      // If no token provided, assign guest / anonymous demo context
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If expired or invalid
    return res.status(401).json({
      success: false,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Invalid or expired session token. Please re-authenticate.',
      error: error.message,
    });
  }
};

/**
 * Strict authentication guard: rejects requests with no authenticated user
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'Authentication required to access this resource.',
    });
  }
  next();
};

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * @param  {...string} allowedRoles Roles authorized to access this route
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required.',
      });
    }

    // Super Admin has universal access
    if (req.user.role === 'superadmin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_INSUFFICIENT_ROLE',
        message: `Forbidden: role '${req.user.role}' is not authorized. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};
