import express from 'express';
import {
  register,
  resendVerificationOtp,
  verifyEmailOtp,
  login,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
  logout,
  refreshAccessToken,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email/resend', resendVerificationOtp);
router.post('/verify-email', verifyEmailOtp);
router.post('/login', login);
router.post('/forgot-password/request', requestPasswordResetOtp);
router.post('/forgot-password/verify', verifyPasswordResetOtp);
router.post('/forgot-password/reset', resetPasswordWithOtp);
router.post('/logout', logout);
router.post('/refresh', refreshAccessToken);
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
