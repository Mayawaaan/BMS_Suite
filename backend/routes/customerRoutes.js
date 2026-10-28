import express from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCustomers);
router.post('/', requireRole('superadmin', 'admin', 'manager', 'staff'), createCustomer);
router.put('/:id', requireRole('superadmin', 'admin', 'manager', 'staff'), updateCustomer);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteCustomer);

export default router;
