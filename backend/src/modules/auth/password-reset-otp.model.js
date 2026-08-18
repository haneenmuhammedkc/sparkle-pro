import mongoose from 'mongoose';

const passwordResetOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastResendAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // Mongoose TTL Index: automatically purges document 2 minutes after creation
    },
  },
  {
    timestamps: true,
  }
);

const PasswordResetOTP = mongoose.model('PasswordResetOTP', passwordResetOTPSchema);

export default PasswordResetOTP;
