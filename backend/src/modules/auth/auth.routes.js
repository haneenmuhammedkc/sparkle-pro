import express from 'express';
import * as authController from './auth.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import {
  loginLimiter,
  registerLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
  forgotPasswordLimiter,
  refreshTokenLimiter,
} from '../../middleware/rateLimiter.js';

const router = express.Router();

// Public Auth Routes with Dedicated Rate Limiters
router.post('/register', registerLimiter, authController.register);
router.post('/verify-email', otpVerifyLimiter, authController.verifyEmail);
router.post('/resend-verification-otp', otpResendLimiter, authController.resendVerificationOTP);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh-token', refreshTokenLimiter, authController.refreshToken);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/verify-password-reset-otp', otpVerifyLimiter, authController.verifyPasswordResetOTP);
router.post('/resend-password-reset-otp', otpResendLimiter, authController.resendPasswordResetOTP);
router.post('/reset-password', authController.resetPassword);

// Protected Auth Routes
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

export default router;
