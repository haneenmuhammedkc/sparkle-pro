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
      enum: ['car-wash', 'detailing', 'service-center', 'multi-service'],
      default: 'car-wash',
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
      default: [
        { name: 'Exterior Wash', category: 'Car', duration: '45 mins', startingPrice: '₹299', enabled: true },
        { name: 'Deep Detailing', category: 'Car', duration: '120 mins', startingPrice: '₹1,499', enabled: true },
      ],
    },
    categoryPricing: {
      type: Object,
      default: {
        Bike: [
          { name: 'Basic Wash', price: '₹199' },
          { name: 'Quick Foam Polish', price: '₹299' },
        ],
        Car: [
          { name: 'Basic Wash', price: '₹499' },
          { name: 'Interior Sanitization', price: '₹599' },
          { name: 'Exterior Wash', price: '₹299' },
        ],
        SUV: [
          { name: 'Heavy SUV Wash', price: '₹699' },
          { name: 'Complete Detailing Package', price: '₹1,299' },
        ],
        Van: [
          { name: 'Commercial Van Wash', price: '₹899' },
          { name: 'Deep Interior Cleaning', price: '₹1,199' },
        ],
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
