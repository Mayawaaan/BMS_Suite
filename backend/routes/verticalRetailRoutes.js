import express from 'express';
import {
  openSession,
  scanBarcode,
  posCheckout,
  closeSession,
} from '../controllers/verticalRetailController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/session/open', requireRole('superadmin', 'admin', 'manager', 'staff'), openSession);
router.post('/session/:sessionId/close', requireRole('superadmin', 'admin', 'manager', 'staff'), closeSession);
router.get('/barcode/:code', scanBarcode);
router.post('/checkout', requireRole('superadmin', 'admin', 'manager', 'staff'), posCheckout);

export default router;
