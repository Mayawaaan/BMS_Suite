import express from 'express';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Company Employee & Workforce Management
router.get('/', requireRole('superadmin', 'admin'), getEmployees);
router.post('/', requireRole('superadmin', 'admin'), createEmployee);
router.put('/:id', requireRole('superadmin', 'admin'), updateEmployee);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteEmployee);

export default router;
