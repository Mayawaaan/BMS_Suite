import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { enforceQuota } from '../middleware/subscriptionGuard.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', requireRole('superadmin', 'admin', 'manager', 'staff'), enforceQuota('skus'), createProduct);
router.put('/:id', requireRole('superadmin', 'admin', 'manager', 'staff'), updateProduct);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteProduct);

export default router;
