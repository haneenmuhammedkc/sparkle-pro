import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import EmailVerificationOTP from '../models/EmailVerificationOTP.js';
import User from '../models/User.js';
import { sendOTPEmail } from './emailService.js';

// Production OTP Expiration Duration: 2 Minutes (120,000 ms)
export const OTP_EXPIRATION_MS = 2 * 60 * 1000;

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export const generate6DigitOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate, hash, persist, and send an OTP email for a user
 */
export const generateAndSendOTP = async (user) => {
  const plainOTP = generate6DigitOTP();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(plainOTP, salt);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS); // Exactly 2 Minutes Expiry

  // Invalidate all previous OTPs for this user email
  await EmailVerificationOTP.deleteMany({ email: user.email.toLowerCase() });

  const otpDoc = new EmailVerificationOTP({
    userId: user._id,
    email: user.email.toLowerCase(),
    otpHash,
    attempts: 0,
    lastResendAt: new Date(),
    expiresAt,
  });

  await otpDoc.save();

  try {
    // Send email via Brevo REST API
    await sendOTPEmail({
      toEmail: user.email,
      toName: user.fullName,
      otpCode: plainOTP,
    });
  } catch (emailErr) {
    // Rollback: delete OTP doc and created user doc if Brevo delivery fails
    await EmailVerificationOTP.deleteMany({ email: user.email.toLowerCase() });
    await User.findByIdAndDelete(user._id);

    const error = new Error('Failed to send verification email via Brevo API. Account creation rolled back.');
    error.statusCode = 500;
    throw error;
  }

  return true;
};

/**
 * Verify a 6-digit OTP entered by the user
 */
export const verifyOTP = async (email, plainOTP) => {
  if (!email || !plainOTP) {
    const error = new Error('Email address and 6-digit verification code are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find OTP document by email
  const otpDoc = await EmailVerificationOTP.findOne({ email: normalizedEmail });
  if (!otpDoc) {
    const error = new Error('Verification code has expired or does not exist. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // Check Expiration (2 Minutes Limit)
  if (new Date() > otpDoc.expiresAt) {
    await EmailVerificationOTP.deleteOne({ _id: otpDoc._id });
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // Check Attempt Limits (Max 5 attempts)
  if (otpDoc.attempts >= 5) {
    await EmailVerificationOTP.deleteOne({ _id: otpDoc._id });
    const error = new Error('Too many failed attempts. This code has been invalidated. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  // Compare OTP Hash
  const isMatch = await bcrypt.compare(plainOTP.trim(), otpDoc.otpHash);
  if (!isMatch) {
    otpDoc.attempts += 1;
    if (otpDoc.attempts >= 5) {
      await EmailVerificationOTP.deleteOne({ _id: otpDoc._id });
      const error = new Error('Invalid verification code. Maximum attempts reached. Please request a new code.');
      error.statusCode = 429;
      throw error;
    }
    await otpDoc.save();

    const remainingAttempts = 5 - otpDoc.attempts;
    const error = new Error(`Invalid verification code. ${remainingAttempts} attempt(s) remaining.`);
    error.statusCode = 400;
    throw error;
  }

  // Verification Succeeded: Purge OTP Document
  await EmailVerificationOTP.deleteOne({ _id: otpDoc._id });
  return true;
};

/**
 * Resend verification OTP with 60-second cooldown
 */
export const resendOTP = async (email) => {
  if (!email) {
    const error = new Error('Email address is required to resend verification code');
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

  // Check Cooldown (60 seconds)
  const existingOTP = await EmailVerificationOTP.findOne({ email: normalizedEmail });
  if (existingOTP && existingOTP.lastResendAt) {
    const secondsSinceLastResend = (Date.now() - new Date(existingOTP.lastResendAt).getTime()) / 1000;
    if (secondsSinceLastResend < 60) {
      const waitSeconds = Math.ceil(60 - secondsSinceLastResend);
      const error = new Error(`Please wait ${waitSeconds} second(s) before requesting another verification code.`);
      error.statusCode = 429;
      throw error;
    }
  }

  // Generate new OTP and send
  const plainOTP = generate6DigitOTP();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(plainOTP, salt);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS); // Exactly 2 Minutes Expiry

  // Invalidate any old OTP records
  await EmailVerificationOTP.deleteMany({ email: normalizedEmail });

  const newOtpDoc = new EmailVerificationOTP({
    userId: user._id,
    email: normalizedEmail,
    otpHash,
    attempts: 0,
    lastResendAt: new Date(),
    expiresAt,
  });

  await newOtpDoc.save();

  // Send email via Brevo REST API
  await sendOTPEmail({
    toEmail: user.email,
    toName: user.fullName,
    otpCode: plainOTP,
  });

  return { cooldownSeconds: 60 };
};
