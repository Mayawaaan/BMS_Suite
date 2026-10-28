import express from 'express';
import { getBills, createBill, updateBillStatus, deleteBill } from '../controllers/billController.js';
import { enforceQuota } from '../middleware/subscriptionGuard.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getBills);
router.post('/', requireRole('superadmin', 'admin', 'manager', 'staff'), enforceQuota('invoices'), createBill);
router.put('/:id/status', requireRole('superadmin', 'admin', 'manager', 'staff'), updateBillStatus);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteBill);

export default router;
