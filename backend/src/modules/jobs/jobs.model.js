import mongoose from 'mongoose';

const serviceSnapshotSchema = new mongoose.Schema(
  {
    serviceId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: String,
      default: '30m',
      trim: true,
    },
  },
  { _id: false }
);

const staffSnapshotSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const activityLogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: 'bg-gray-900',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: [true, 'Job ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
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
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    vehiclePlate: {
      type: String,
      required: [true, 'Vehicle plate number is required'],
      uppercase: true,
      trim: true,
    },
    vehicleBrand: {
      type: String,
      default: '',
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    vehicleCategory: {
      type: String,
      required: [true, 'Vehicle category is required'],
      default: 'Car',
      trim: true,
    },
    wheelCategory: {
      type: String,
      enum: ['2-wheeler', '4-wheeler', 'custom'],
      default: '4-wheeler',
    },
    vehicleType: {
      type: String,
      default: '',
      trim: true,
    },
    services: {
      type: [serviceSnapshotSchema],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'A job must contain at least one service',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      min: 0,
      default: 0.08, // 8% standard business tax rate default
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'Indian Rupee (₹)',
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'POS', 'OTHER', null],
      default: null,
    },
    paidAmount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: 0,
    },
    balanceAmount: {
      type: Number,
      min: [0, 'Balance amount cannot be negative'],
      default: 0,
    },
    transactionRef: {
      type: String,
      default: '',
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Ready', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    workflowStep: {
      type: String,
      enum: ['Wait', 'Wash', 'Interior', 'QC', 'Ready'],
      default: 'Wait',
    },
    currentStepIndex: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
    assignedStaff: {
      type: staffSnapshotSchema,
      default: null,
    },
    estimatedFinishTime: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    trackingToken: {
      type: String,
      required: [true, 'Tracking token is required'],
      unique: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    activities: {
      type: [activityLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for business tenant query optimization
jobSchema.index({ businessId: 1, status: 1, createdAt: -1 });
jobSchema.index({ businessId: 1, status: 1, completedAt: -1 });
jobSchema.index({ businessId: 1, createdAt: -1 });
jobSchema.index({ businessId: 1, ownerId: 1 });
jobSchema.index({ businessId: 1, vehiclePlate: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
