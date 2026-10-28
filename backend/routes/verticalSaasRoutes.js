import express from 'express';
import {
  getSubscriptions,
  createSubscription,
  triggerBillingRun,
  cancelSubscription,
} from '../controllers/verticalSaasController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions', requireRole('superadmin', 'admin', 'manager'), createSubscription);
router.post('/billing-run', requireRole('superadmin', 'admin'), triggerBillingRun);
router.post('/subscriptions/:id/cancel', requireRole('superadmin', 'admin'), cancelSubscription);

export default router;
