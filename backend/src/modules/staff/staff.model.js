import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
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
      required: [true, 'Staff member name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Staff member phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: 'Technician',
      trim: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE'],
      default: 'AVAILABLE',
      index: true,
    },
    workingSince: {
      type: String,
      default: '8:00 AM',
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Tenant-scoped compound unique index on phone number per business
staffSchema.index({ businessId: 1, phone: 1 }, { unique: true });

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
