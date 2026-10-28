import rateLimit from 'express-rate-limit';

/**
 * Enterprise DDoS Protection & Global Rate Limiting
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded: Too many requests from this IP. Please wait before retrying.',
  },
});

/**
 * Strict Rate Limiter for Login, Registration & OTP Password Resets (Brute Force Defense)
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '15', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Security threshold exceeded: Too many authentication or OTP attempts. Please wait 15 minutes.',
  },
});

/**
 * Recursive deep sanitizer preventing SQL Injection & NoSQL Operator Injections
 */
const SQL_INJECTION_REGEX = /(\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|TABLE|ALTER|EXEC|EXECUTE|SHUTDOWN)\b|--|\/\*|\*\/|;\s*--|'\s*OR\s*'\w+'\s*=\s*'\w+|'\s*OR\s*1\s*=\s*1|"\s*OR\s*1\s*=\s*1)/i;

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // 1. Prevent NoSQL Operator Injection: block keys beginning with '$' or containing '.'
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[SECURITY] Blocked potential NoSQL injection key: "${key}"`);
      const err = new Error(`Illegal query operator detected: "${key}"`);
      err.code = 'INJECTION_DETECTED';
      throw err;
    }

    // 2. Sanitize string values against harmful SQL injection or XSS payloads
    if (typeof value === 'string') {
      let sanitizedVal = value;
      // Strip script tags
      sanitizedVal = sanitizedVal.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      // Detect SQL injection signatures
      if (SQL_INJECTION_REGEX.test(sanitizedVal)) {
        console.warn(`[SECURITY] Detected potential SQL injection pattern in field "${key}": ${sanitizedVal}`);
        const err = new Error(`SQL injection pattern detected in field: "${key}"`);
        err.code = 'INJECTION_DETECTED';
        throw err;
      }
      clean[key] = sanitizedVal;
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
};

/**
 * Middleware: SQL & NoSQL Injection Firewall
 */
export const injectionSanitizer = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      code: 'INJECTION_ATTEMPT_BLOCKED',
      message: 'Malicious operator or SQL injection pattern detected and blocked by enterprise security firewall.',
      error: err.message,
    });
  }
};

/**
 * Middleware: Essential Enterprise Security Headers
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
};
