import express from 'express';
import {
  getTenants,
  getTenantById,
  updateTenant,
  createTenant,
} from '../controllers/tenantController.js';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Company Employee Management (Admin & Superadmin of company)
router.get('/employees', requireRole('superadmin', 'admin'), getEmployees);
router.post('/employees', requireRole('superadmin', 'admin'), createEmployee);
router.put('/employees/:id', requireRole('superadmin', 'admin'), updateEmployee);
router.delete('/employees/:id', requireRole('superadmin', 'admin'), deleteEmployee);

// Public/tenant list for switcher
router.get('/', getTenants);
router.get('/:id', getTenantById);

// Governance: Superadmin & Admin only
router.post('/', requireRole('superadmin'), createTenant);
router.put('/:id', requireRole('superadmin', 'admin'), updateTenant);

export default router;

