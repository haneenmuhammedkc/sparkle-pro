import mongoose from 'mongoose';

/**
 * Phone Number Normalization Helper
 * Keeps country code / digits, removes spaces, hyphens, and formatting symbols.
 * Example: "+1 (555) 019-2834" -> "+15550192834"
 */
export const normalizePhone = (phoneStr) => {
  if (!phoneStr || typeof phoneStr !== 'string') return '';
  const trimmed = phoneStr.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
};

const vehicleSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      required: [true, 'Vehicle plate number is required'],
      uppercase: true,
      trim: true,
    },
    model: {
      type: String,
      default: 'Standard Vehicle',
      trim: true,
    },
    category: {
      type: String,
      default: 'Car',
      trim: true,
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    vehicles: {
      type: [vehicleSchema],
      default: [],
    },
    firstVisitAt: {
      type: Date,
      default: Date.now,
    },
    lastVisitAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Tenant Isolation for Customer Phone Numbers
customerSchema.index({ businessId: 1, phone: 1 }, { unique: true });

// Pre-save Middleware: Normalize Phone & Email
customerSchema.pre('save', function (next) {
  if (this.phone) {
    this.phone = normalizePhone(this.phone);
  }
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
