import express from 'express';
import {
  getRevenueAnalytics,
  updateRevenueTarget,
  getPortfolioAnalytics,
} from '../controllers/revenueController.js';

const router = express.Router();

router.get('/', getRevenueAnalytics);
router.get('/analytics', getRevenueAnalytics);
router.get('/portfolio-analytics', getPortfolioAnalytics);
router.put('/target', updateRevenueTarget);

export default router;
