import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Business from '../models/Business.js';
import RefreshToken from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
} from '../utils/generateToken.js';
import { validatePasswordPolicy } from '../utils/passwordPolicy.js';
import * as otpService from './otpService.js';
import * as passwordResetOtpService from './passwordResetOtpService.js';

/**
 * Helper to generate, hash, and persist a new RefreshToken session document
 */
const createRefreshTokenSession = async ({ userId, role, businessId, familyId = null, userAgent = null, ipAddress = null }) => {
  const jti = crypto.randomUUID();
  const tokenFamily = familyId || crypto.randomUUID();

  const payload = {
    userId: userId.toString(),
    role,
    businessId: businessId ? businessId.toString() : null,
    jti,
    familyId: tokenFamily,
  };

  const plainRefreshToken = generateRefreshToken(payload);
  const salt = await bcrypt.genSalt(10);
  const tokenHash = await bcrypt.hash(plainRefreshToken, salt);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days Expiry

  const sessionDoc = new RefreshToken({
    userId,
    jti,
    tokenHash,
    familyId: tokenFamily,
    isRevoked: false,
    userAgent,
    ipAddress,
    expiresAt,
  });

  await sessionDoc.save();

  return {
    refreshToken: plainRefreshToken,
    jti,
    familyId: tokenFamily,
  };
};

/**
 * Register a new business owner and send verification OTP via Brevo
 */
export const registerUser = async ({ fullName, email, password }) => {
  if (!fullName || !email || !password) {
    const error = new Error('Full name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  // Validate Password Complexity Policy
  const passCheck = validatePasswordPolicy(password);
  if (!passCheck.isValid) {
    const error = new Error(passCheck.message);
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // Create new Owner user (isEmailVerified defaults to false)
  const user = new User({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: 'OWNER',
    isEmailVerified: false,
  });

  await user.save();

  // Generate 6-digit OTP, hash, store, and send Brevo email
  await otpService.generateAndSendOTP(user);

  return {
    email: user.email,
    fullName: user.fullName,
    requiresVerification: true,
  };
};

/**
 * Verify Email with 6-digit OTP
 */
export const verifyEmail = async ({ email, otp, userAgent, ipAddress }) => {
  if (!email || !otp) {
    const error = new Error('Email address and 6-digit verification code are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('Account not found for this email address');
    error.statusCode = 404;
    throw error;
  }

  if (user.isEmailVerified) {
    const error = new Error('This account email is already verified. Please sign in directly.');
    error.statusCode = 400;
    throw error;
  }

  // Verify OTP code
  await otpService.verifyOTP(normalizedEmail, otp);

  // Update user as email verified
  user.isEmailVerified = true;
  user.refreshToken = null; // Purge legacy plaintext token field
  await user.save();

  const business = await Business.findOne({ ownerId: user._id });

  const payload = {
    userId: user._id.toString(),
    role: user.role,
    businessId: business ? business._id.toString() : null,
  };

  const accessToken = generateAccessToken(payload);
  const session = await createRefreshTokenSession({
    userId: user._id,
    role: user.role,
    businessId: business ? business._id : null,
    userAgent,
    ipAddress,
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: true,
      businessId: business ? business._id : null,
      setupCompleted: business ? business.setupCompleted : false,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken: session.refreshToken,
  };
};

/**
 * Resend Verification OTP
 */
export const resendVerificationOTP = async (email) => {
  return await otpService.resendOTP(email);
};

/**
 * Authenticate existing user
 */
export const loginUser = async ({ email, password, userAgent, ipAddress }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select password
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Compare passwords
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    const error = new Error('Your email address is not verified. Please verify your email before logging in.');
    error.statusCode = 403;
    error.data = {
      requiresVerification: true,
      email: user.email,
    };
    throw error;
  }

  // Purge legacy plaintext refresh token if present
  if (user.refreshToken) {
    user.refreshToken = null;
    await user.save();
  }

  const business = await Business.findOne({ ownerId: user._id });

  const payload = {
    userId: user._id.toString(),
    role: user.role,
    businessId: business ? business._id.toString() : null,
  };

  const accessToken = generateAccessToken(payload);
  const session = await createRefreshTokenSession({
    userId: user._id,
    role: user.role,
    businessId: business ? business._id : null,
    userAgent,
    ipAddress,
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: true,
      businessId: business ? business._id : null,
      setupCompleted: business ? business.setupCompleted : false,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken: session.refreshToken,
  };
};

/**
 * Generate a new access token and rotate refresh token using RTR with Token Reuse Detection
 */
export const refreshAccessToken = async ({ refreshToken, userAgent, ipAddress }) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const { userId, jti, familyId } = decoded;

  if (!jti || !familyId) {
    const error = new Error('Invalid refresh token structure');
    error.statusCode = 401;
    throw error;
  }

  // Locate Session Document by jti
  const session = await RefreshToken.findOne({ jti });

  // REUSE DETECTION: If token was already revoked, token theft is detected!
  if (session && session.isRevoked) {
    // Revoke all sessions belonging to this token family
    await RefreshToken.updateMany({ familyId }, { isRevoked: true });
    const error = new Error('Token reuse detected. All active sessions have been revoked for security.');
    error.statusCode = 401;
    throw error;
  }

  if (!session) {
    // Token not found in DB
    await RefreshToken.updateMany({ familyId }, { isRevoked: true });
    const error = new Error('Invalid refresh token session');
    error.statusCode = 401;
    throw error;
  }

  // Verify presented plaintext token against bcrypt tokenHash
  const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);
  if (!isMatch) {
    await RefreshToken.updateMany({ familyId }, { isRevoked: true });
    const error = new Error('Refresh token verification failed');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Authenticated user account no longer exists');
    error.statusCode = 401;
    throw error;
  }

  const business = await Business.findOne({ ownerId: user._id });

  // ROTATION (RTR): Revoke old token session
  session.isRevoked = true;
  await session.save();

  // Issue new Refresh Token under same familyId
  const newSession = await createRefreshTokenSession({
    userId: user._id,
    role: user.role,
    businessId: business ? business._id : null,
    familyId,
    userAgent,
    ipAddress,
  });

  const payload = {
    userId: user._id.toString(),
    role: user.role,
    businessId: business ? business._id.toString() : null,
  };

  const newAccessToken = generateAccessToken(payload);

  return {
    accessToken: newAccessToken,
    refreshToken: newSession.refreshToken,
  };
};

/**
 * Revoke session on logout
 */
export const logoutUser = async ({ userId, refreshToken }) => {
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded && decoded.jti) {
        await RefreshToken.updateOne({ jti: decoded.jti }, { isRevoked: true });
      }
    } catch (err) {
      // Ignore token verification errors during logout
    }
  }

  if (userId) {
    const user = await User.findById(userId).select('+refreshToken');
    if (user && user.refreshToken) {
      user.refreshToken = null;
      await user.save();
    }
  }

  return true;
};

/**
 * Retrieve current user profile
 */
export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const business = await Business.findOne({ ownerId: user._id });

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : false,
    businessId: business ? business._id : null,
    setupCompleted: business ? business.setupCompleted : false,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

/**
 * Initiate OTP Password Recovery Flow
 */
export const forgotPassword = async (email) => {
  if (!email) {
    const error = new Error('Email address is required');
    error.statusCode = 400;
    throw error;
  }

  await passwordResetOtpService.generateAndSendPasswordResetOTP(email);

  return {
    message: 'If an account with that email exists, a 6-digit recovery code has been sent.',
    email: email.toLowerCase().trim(),
  };
};

/**
 * Verify Password Reset OTP and issue short-lived signed reset authorization token
 */
export const verifyPasswordResetOTP = async ({ email, otp }) => {
  const user = await passwordResetOtpService.verifyPasswordResetOTP(email, otp);

  // Issue short-lived signed JWT reset authorization token (15m expiry)
  const resetToken = generateResetToken({
    userId: user._id.toString(),
    purpose: 'PASSWORD_RESET',
    issuedAt: Date.now(),
  });

  return {
    message: 'Recovery code verified successfully.',
    resetToken,
  };
};

/**
 * Resend Password Reset OTP
 */
export const resendPasswordResetOTP = async (email) => {
  return await passwordResetOtpService.resendPasswordResetOTP(email);
};

/**
 * Reset password using signed reset authorization token
 */
export const resetPassword = async ({ resetToken, newPassword }) => {
  if (!resetToken || !newPassword) {
    const error = new Error('Reset authorization token and new password are required');
    error.statusCode = 400;
    throw error;
  }

  // Validate Password Complexity Policy
  const passCheck = validatePasswordPolicy(newPassword);
  if (!passCheck.isValid) {
    const error = new Error(passCheck.message);
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyResetToken(resetToken);
  } catch (err) {
    const error = new Error('Invalid or expired password reset authorization token');
    error.statusCode = 401;
    throw error;
  }

  // Ensure purpose is strictly PASSWORD_RESET
  if (decoded.purpose !== 'PASSWORD_RESET') {
    const error = new Error('Invalid authorization token purpose');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId).select('+password +refreshToken');
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  // Single-use token enforcement: prevent token reuse if password was changed after token issuance
  if (user.passwordChangedAt && decoded.issuedAt < new Date(user.passwordChangedAt).getTime()) {
    const error = new Error('This password reset authorization has already been used. Please request a new code.');
    error.statusCode = 401;
    throw error;
  }

  // Update password & record passwordChangedAt timestamp
  user.password = newPassword;
  user.refreshToken = null; // Clear legacy plaintext token field
  user.passwordChangedAt = new Date();
  await user.save();

  // Revoke ALL active RefreshToken sessions for this user
  await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

  return { message: 'Password has been reset successfully. Please log in with your new password.' };
};
