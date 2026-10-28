// ZSYIO BMS Enterprise OS API Engine
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';

import billRoutes from './routes/billRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import verticalRetailRoutes from './routes/verticalRetailRoutes.js';
import verticalMfgRoutes from './routes/verticalMfgRoutes.js';
import verticalSaasRoutes from './routes/verticalSaasRoutes.js';
import { redisService } from './config/redis.js';
import { authenticate } from './middleware/authMiddleware.js';
import { resolveTenant } from './middleware/tenantMiddleware.js';
import {
  apiLimiter,
  authLimiter,
  injectionSanitizer,
  securityHeaders,
} from './middleware/securityMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurable Enterprise CORS (Supports localhost, all Vercel deployments, Render apps & custom origins)
const LOCALHOST_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const VERCEL_REGEX = /^https:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.vercel\.app$/;
const RENDER_REGEX = /^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/;

const rawCorsOrigin = process.env.CORS_ORIGIN || '';
const configuredOrigins = rawCorsOrigin
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.trim().replace(/\/+$/, '');

    if (
      allowedOrigins.includes(cleanOrigin) ||
      allowedOrigins.includes('*') ||
      LOCALHOST_REGEX.test(cleanOrigin) ||
      VERCEL_REGEX.test(cleanOrigin) ||
      RENDER_REGEX.test(cleanOrigin)
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked]: Origin "${cleanOrigin}" not allowed. Configured:`, allowedOrigins);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Tenant-ID',
    'X-Access-Token',
    'X-Tenant-Slug',
    'X-Business-Type',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Cache', 'X-Tenant-ID'],
  optionsSuccessStatus: 200,
};

// Mount CORS before other middlewares and handle preflight OPTIONS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Enterprise Security Headers & DDoS Protection
app.use(securityHeaders);
app.use(apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(injectionSanitizer);

// Request logger with tenant telemetry
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const tenantSlug = req.tenant?.slug || 'no-tenant';
    const role = req.user?.role || 'anon';
    console.log(`[API ${req.method}] ${req.originalUrl} [${tenantSlug} | ${role}] -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Initialize Database Connection
connectDB();

// Global Auth & Multi-Tenant Resolution Middlewares
app.use(authenticate);
app.use(resolveTenant);

// Mount Modular Routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/vertical/retail', verticalRetailRoutes);
app.use('/api/vertical/manufacturing', verticalMfgRoutes);
app.use('/api/vertical/saas', verticalSaasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/system', systemRoutes);

// Health check endpoint with Multi-Tenant & Redis Telemetry
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'ZSYIO BMS Modular Business OS / ERP API',
    database: getDbStatus(),
    redis: redisService.getStatus(),
    activeTenant: req.tenant ? {
      id: req.tenant.id || req.tenant._id,
      name: req.tenant.name,
      slug: req.tenant.slug,
      vertical: req.tenant.vertical,
      status: req.tenant.status,
      planTier: req.tenant.planTier,
    } : null,
    isolation: 'AsyncLocalStorage + Compound Index Isolation Active',
    version: '2.4.0-enterprise',
    modules: ['tenants', 'bills', 'sales', 'products', 'revenue', 'customers', 'stock', 'dashboard', 'system'],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 [ZSYIO BMS Backend] Server running on http://localhost:${PORT}`);
  console.log(`📡 [API Health Check]: http://localhost:${PORT}/api/health`);
});
