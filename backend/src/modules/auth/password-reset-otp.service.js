import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import PasswordResetOTP from './password-reset-otp.model.js';
import User from '../../models/User.js';
import { sendPasswordResetOTPEmail } from './email.service.js';

// Production Password Reset OTP Expiration Duration: 2 Minutes (120,000 ms)
export const PASSWORD_RESET_OTP_EXPIRATION_MS = 2 * 60 * 1000;

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export const generate6DigitOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate, hash, persist, and send a password reset OTP email for a user
 */
export const generateAndSendPasswordResetOTP = async (email) => {
  if (!email) {
    const error = new Error('Email address is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // Account Enumeration Defense: Return true even if user doesn't exist
  if (!user) {
    return true;
  }

  const plainOTP = generate6DigitOTP();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(plainOTP, salt);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_OTP_EXPIRATION_MS); // Exactly 2 Minutes Expiry

  // Invalidate any previous password reset OTPs for this user email
  await PasswordResetOTP.deleteMany({ email: normalizedEmail });

  const otpDoc = new PasswordResetOTP({
    userId: user._id,
    email: normalizedEmail,
    otpHash,
    attempts: 0,
    lastResendAt: new Date(),
    expiresAt,
  });

  await otpDoc.save();

  try {
    // Send email via Brevo REST API
    await sendPasswordResetOTPEmail({
      toEmail: user.email,
      toName: user.fullName,
      otpCode: plainOTP,
    });
  } catch (emailErr) {
    // Rollback: delete OTP document if Brevo delivery fails
    await PasswordResetOTP.deleteMany({ email: normalizedEmail });
    const error = new Error('Failed to send password recovery email via Brevo API.');
    error.statusCode = 500;
    throw error;
  }

  return true;
};

/**
 * Verify a 6-digit password reset OTP
 */
export const verifyPasswordResetOTP = async (email, plainOTP) => {
  if (!email || !plainOTP) {
    const error = new Error('Email address and 6-digit recovery code are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find OTP document by email
  const otpDoc = await PasswordResetOTP.findOne({ email: normalizedEmail });
  if (!otpDoc) {
    const error = new Error('Recovery code has expired or does not exist. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // Check Expiration (2 Minutes Limit)
  if (new Date() > otpDoc.expiresAt) {
    await PasswordResetOTP.deleteOne({ _id: otpDoc._id });
    const error = new Error('Recovery code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // Check Attempt Limits (Max 5 attempts)
  if (otpDoc.attempts >= 5) {
    await PasswordResetOTP.deleteOne({ _id: otpDoc._id });
    const error = new Error('Too many failed attempts. This recovery code has been invalidated. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  // Compare OTP Hash
  const isMatch = await bcrypt.compare(plainOTP.trim(), otpDoc.otpHash);
  if (!isMatch) {
    otpDoc.attempts += 1;
    if (otpDoc.attempts >= 5) {
      await PasswordResetOTP.deleteOne({ _id: otpDoc._id });
      const error = new Error('Invalid recovery code. Maximum attempts reached. Please request a new code.');
      error.statusCode = 429;
      throw error;
    }
    await otpDoc.save();

    const remainingAttempts = 5 - otpDoc.attempts;
    const error = new Error(`Invalid recovery code. ${remainingAttempts} attempt(s) remaining.`);
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(otpDoc.userId);

  // Verification Succeeded: Purge OTP Document
  await PasswordResetOTP.deleteOne({ _id: otpDoc._id });

  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Resend password reset OTP with 60-second cooldown
 */
export const resendPasswordResetOTP = async (email) => {
  if (!email) {
    const error = new Error('Email address is required to resend recovery code');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Enumeration defense: Return cooldown response silently
    return { cooldownSeconds: 60 };
  }

  // Check Cooldown (60 seconds)
  const existingOTP = await PasswordResetOTP.findOne({ email: normalizedEmail });
  if (existingOTP && existingOTP.lastResendAt) {
    const secondsSinceLastResend = (Date.now() - new Date(existingOTP.lastResendAt).getTime()) / 1000;
    if (secondsSinceLastResend < 60) {
      const waitSeconds = Math.ceil(60 - secondsSinceLastResend);
      const error = new Error(`Please wait ${waitSeconds} second(s) before requesting another recovery code.`);
      error.statusCode = 429;
      throw error;
    }
  }

  // Generate new OTP and send
  const plainOTP = generate6DigitOTP();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(plainOTP, salt);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_OTP_EXPIRATION_MS); // Exactly 2 Minutes Expiry

  // Invalidate any old OTP records
  await PasswordResetOTP.deleteMany({ email: normalizedEmail });

  const newOtpDoc = new PasswordResetOTP({
    userId: user._id,
    email: normalizedEmail,
    otpHash,
    attempts: 0,
    lastResendAt: new Date(),
    expiresAt,
  });

  await newOtpDoc.save();

  // Send email via Brevo REST API
  await sendPasswordResetOTPEmail({
    toEmail: user.email,
    toName: user.fullName,
    otpCode: plainOTP,
  });

  return { cooldownSeconds: 60 };
};
