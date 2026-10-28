import express from 'express';
import {
  getSystemStatus,
  getSystemTenants,
  createSystemTenant,
  updateTenantStatus,
  updateTenantPlan,
  updateTenantVertical,
  getRedisKeys,
  flushRedisCache,
  seedSystemData,
  getSystemUsers,
  updateUserRole,
} from '../controllers/systemController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// System Telemetry & Redis Inspector
router.get('/status', getSystemStatus);
router.get('/redis/keys', getRedisKeys);
router.post('/redis/flush', requireRole('superadmin', 'admin'), flushRedisCache);
router.post('/seed', requireRole('superadmin'), seedSystemData);

// Super Admin Multi-Tenant Governance
router.get('/tenants', requireRole('superadmin', 'admin'), getSystemTenants);
router.post('/tenants', requireRole('superadmin'), createSystemTenant);
router.put('/tenants/:id/status', requireRole('superadmin'), updateTenantStatus);
router.put('/tenants/:id/plan', requireRole('superadmin', 'admin'), updateTenantPlan);
router.put('/tenants/:id/vertical', requireRole('superadmin'), updateTenantVertical);

// Super Admin User Governance
router.get('/users', requireRole('superadmin', 'admin'), getSystemUsers);
router.put('/users/:userId/role', requireRole('superadmin'), updateUserRole);

export default router;
