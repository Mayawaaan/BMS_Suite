import express from 'express';
import { getStock, createStockItem, updateStockLevel, deleteStockItem } from '../controllers/stockController.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getStock);
router.post('/', requireRole('superadmin', 'admin', 'manager', 'staff'), createStockItem);
router.put('/:id', requireRole('superadmin', 'admin', 'manager', 'staff'), updateStockLevel);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteStockItem);

export default router;
