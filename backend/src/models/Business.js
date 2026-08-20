import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    businessType: {
      type: String,
      default: 'car-wash',
      trim: true,
      maxlength: [80, 'Business type must be 80 characters or less.'],
    },
    email: {
      type: String,
      required: [true, 'Business email is required'],
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      default: '',
    },
    whatsappNumber: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    openingTime: {
      type: String,
      default: '09:00 AM',
    },
    closingTime: {
      type: String,
      default: '06:00 PM',
    },
    weeklyHolidays: {
      type: [String],
      default: ['Sat', 'Sun'],
    },
    staffCount: {
      type: String,
      default: '1-5 Staff Members',
    },
    isSoloOperator: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: 'Indian Rupee (₹)',
    },
    servicesConfigured: {
      type: Array,
      default: [],
    },
    categoryPricing: {
      type: Object,
      default: {},
    },
    taxId: {
      type: String,
      default: '',
      trim: true,
    },
    capacity: {
      type: Number,
      default: 30,
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity cannot exceed 500'],
    },
    allowOverbooking: {
      type: Boolean,
      default: false,
    },
    peakSurge: {
      type: Boolean,
      default: true,
    },
    bays: {
      type: [
        {
          bayId: Number,
          name: {
            type: String,
            trim: true,
          },
          type: {
            type: String,
            trim: true,
          },
          active: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [
        {
          bayId: 1,
          name: 'Bay 1 (Foam Wash)',
          type: 'Washing',
          active: true,
        },
        {
          bayId: 2,
          name: 'Bay 2 (Interior Detailing)',
          type: 'Interior',
          active: true,
        },
        {
          bayId: 3,
          name: 'Bay 3 (Quality Inspection)',
          type: 'QC',
          active: true,
        },
        {
          bayId: 4,
          name: 'Bay 4 (Ceramic Coating Spa)',
          type: 'Coating',
          active: false,
        },
      ],
    },
    notificationPreferences: {
      type: Object,
      default: {
        emailAlerts: true,
        smsReminders: true,
        pushNotifs: true,
        jobComplete: true,
        weeklyReport: false,
      },
    },
    setupCompleted: {
      type: Boolean,
      default: false,
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

const Business = mongoose.model('Business', businessSchema);

export default Business;
