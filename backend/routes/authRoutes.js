import express from 'express';
import {
  login,
  register,
  getDemoUsers,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updatePortfolioVerticals,
  purgePortfolioVertical,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.put('/portfolio/verticals', updatePortfolioVerticals);
router.post('/portfolio/purge-vertical', purgePortfolioVertical);
router.get('/demo-users', getDemoUsers);
router.get('/me', getMe);

export default router;
