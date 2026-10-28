import express from 'express';
import { getSales, createSale, updateSaleStage, deleteSale } from '../controllers/saleController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSales);
router.post('/', requireRole('superadmin', 'admin', 'manager', 'staff'), createSale);
router.put('/:id/stage', requireRole('superadmin', 'admin', 'manager', 'staff'), updateSaleStage);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteSale);

export default router;
