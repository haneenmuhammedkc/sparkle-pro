import * as authService from './auth.service.js';
import { successResponse } from '../../utils/apiResponse.js';

/**
 * Cookie options helper for HttpOnly Refresh Token Cookie
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
});

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const result = await authService.registerUser({ fullName, email, password });
    return successResponse(res, 201, 'User registered successfully. Please verify your email.', result);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail({
      email,
      otp,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Set Refresh Token in HttpOnly cookie
    if (result.refreshToken) {
      res.cookie('sparklepro_refresh_token', result.refreshToken, getCookieOptions());
      delete result.refreshToken; // Do not leak in JSON response
    }

    return successResponse(res, 200, 'Email address verified successfully!', result);
  } catch (error) {
    next(error);
  }
};

export const resendVerificationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationOTP(email);
    return successResponse(res, 200, 'A new verification code has been sent to your email.', result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({
      email,
      password,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Set Refresh Token in HttpOnly cookie
    if (result.refreshToken) {
      res.cookie('sparklepro_refresh_token', result.refreshToken, getCookieOptions());
      delete result.refreshToken; // Do not leak in JSON response
    }

    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const tokenInput = req.cookies?.sparklepro_refresh_token || req.body?.refreshToken;
    const result = await authService.refreshAccessToken({
      refreshToken: tokenInput,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Set updated Refresh Token in HttpOnly cookie (RTR)
    if (result.refreshToken) {
      res.cookie('sparklepro_refresh_token', result.refreshToken, getCookieOptions());
      delete result.refreshToken; // Do not leak in JSON response
    }

    return successResponse(res, 200, 'Access token refreshed successfully', result);
  } catch (error) {
    // If refresh fails or reuse detected, clear cookie
    res.clearCookie('sparklepro_refresh_token', { path: '/api/auth' });
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const tokenInput = req.cookies?.sparklepro_refresh_token || req.body?.refreshToken;
    const userId = req.user?.userId;

    await authService.logoutUser({ userId, refreshToken: tokenInput });

    // Clear HttpOnly refresh token cookie
    res.clearCookie('sparklepro_refresh_token', { path: '/api/auth' });

    return successResponse(res, 200, 'Logged out successfully', null);
  } catch (error) {
    res.clearCookie('sparklepro_refresh_token', { path: '/api/auth' });
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await authService.getMe(userId);
    return successResponse(res, 200, 'User retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const verifyPasswordResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyPasswordResetOTP({ email, otp });
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const resendPasswordResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendPasswordResetOTP(email);
    return successResponse(res, 200, 'A new recovery code has been sent to your email.', result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword, token } = req.body;
    const effectiveToken = resetToken || token;
    const result = await authService.resetPassword({ resetToken: effectiveToken, newPassword });

    // Clear HttpOnly refresh token cookie to force clean re-login
    res.clearCookie('sparklepro_refresh_token', { path: '/api/auth' });

    return successResponse(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};
