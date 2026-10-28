import express from 'express';
import {
  getBoms,
  createBom,
  getWorkOrders,
  createWorkOrder,
  completeWorkOrder,
} from '../controllers/verticalMfgController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/bom', getBoms);
router.post('/bom', requireRole('superadmin', 'admin', 'manager'), createBom);
router.get('/work-orders', getWorkOrders);
router.post('/work-orders', requireRole('superadmin', 'admin', 'manager'), createWorkOrder);
router.post('/work-orders/:id/complete', requireRole('superadmin', 'admin', 'manager'), completeWorkOrder);

export default router;
