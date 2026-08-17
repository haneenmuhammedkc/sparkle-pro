import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Standard handler for rate-limited requests
 */
const rateLimitHandler = (message) => (req, res, next, options) => {
  return errorResponse(res, 429, message || 'Too many requests. Please try again later.');
};

// 1. Login Rate Limiter (5 requests / 15 minutes / IP)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many login attempts from this IP. Please try again after 15 minutes.'),
});

// 2. Registration Rate Limiter (5 requests / hour / IP)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many accounts created from this IP. Please try again after an hour.'),
});

// 3. OTP Verification Rate Limiter (10 requests / 15 minutes / IP)
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many verification attempts from this IP. Please try again after 15 minutes.'),
});

// 4. OTP Resend Rate Limiter (3 requests / 15 minutes / IP)
export const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many code resend requests from this IP. Please wait 15 minutes.'),
});

// 5. Forgot Password Rate Limiter (3 requests / 15 minutes / IP)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many password recovery requests from this IP. Please wait 15 minutes.'),
});

// 6. Token Refresh Rate Limiter (30 requests / 15 minutes / IP)
export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many token refresh requests. Please log in again.'),
});
