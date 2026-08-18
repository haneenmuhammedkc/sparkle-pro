import crypto from 'crypto';
import mongoose from 'mongoose';
import Job from './jobs.model.js';
import Business from '../../models/Business.js';
import Staff from '../staff/staff.model.js';
import { upsertCustomerFromJob } from '../customers/customers.service.js';

/**
 * Format timestamp into user-friendly time string (e.g. 10:45 AM)
 */
const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Generate a unique human-readable Job ID (e.g. TS-04-ED-1234 or SPK-XXXXXX)
 */
const generateJobId = (vehiclePlate) => {
  const cleanPlate = (vehiclePlate || 'SPK').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = cleanPlate.substring(0, 4) || 'SPK';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

/**
 * Generate cryptographically secure tracking token
 */
const generateTrackingToken = () => {
  return `tr_${crypto.randomBytes(8).toString('hex')}`;
};

/**
 * Canonical Workflow Mapping Table
 */
const WORKFLOW_MAP = [
  { index: 0, step: 'Wait', status: 'Pending' },
  { index: 1, step: 'Wash', status: 'In Progress' },
  { index: 2, step: 'Interior', status: 'In Progress' },
  { index: 3, step: 'QC', status: 'In Progress' },
  { index: 4, step: 'Ready', status: 'Ready' },
];

/**
 * 1. Create a New Job with Authoritative Pricing & Snapshot Isolation
 */
export const createJob = async (ownerId, data) => {
  const {
    customerName,
    customerPhone,
    vehiclePlate,
    vehicleBrand,
    vehicleModel,
    vehicleCategory,
    wheelCategory,
    vehicleType,
    services: inputServices,
    selectedServices,
    customDetails,
    assignedStaff,
    priorityLevel,
    estimatedFinishTime,
    notes,
  } = data;

  if (!customerName || !customerPhone || !vehiclePlate || !vehicleModel) {
    const error = new Error('Customer name, phone number, vehicle plate, and vehicle model are required.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch Business for owner tenant context
  const business = await Business.findOne({ ownerId });
  if (!business) {
    const error = new Error('Business profile not found. Please complete business setup first.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Resolve & Snapshot Services
  let resolvedServices = [];

  // If inputServices array provided
  if (Array.isArray(inputServices) && inputServices.length > 0) {
    resolvedServices = inputServices.map((s) => ({
      serviceId: s.serviceId || s.id || null,
      name: s.name || s.serviceName || 'Standard Service',
      price: Number(s.price) || 0,
      duration: s.duration || s.time || '30m',
    }));
  } else if (Array.isArray(selectedServices) && selectedServices.length > 0) {
    // Look up in business.servicesConfigured or categoryPricing
    const category = vehicleCategory || 'Car';
    const categoryServices = business.categoryPricing?.[category] || [];

    resolvedServices = selectedServices.map((srvIdOrName) => {
      const matchInPricing = categoryServices.find(
        (c) => c.name.toLowerCase() === String(srvIdOrName).toLowerCase() || c._id == srvIdOrName
      );

      if (matchInPricing) {
        const parsedPrice = Number(String(matchInPricing.price).replace(/[^0-9.]/g, '')) || 0;
        return {
          serviceId: matchInPricing._id ? String(matchInPricing._id) : String(srvIdOrName),
          name: matchInPricing.name,
          price: parsedPrice,
          duration: '30m',
        };
      }

      // Check in servicesConfigured
      const matchInConfig = (business.servicesConfigured || []).find(
        (sc) => sc.name.toLowerCase() === String(srvIdOrName).toLowerCase()
      );
      if (matchInConfig) {
        const parsedPrice = Number(String(matchInConfig.startingPrice).replace(/[^0-9.]/g, '')) || 0;
        return {
          serviceId: String(srvIdOrName),
          name: matchInConfig.name,
          price: parsedPrice,
          duration: matchInConfig.duration || '45m',
        };
      }

      // Handle custom setup fallback if specified
      if (customDetails && customDetails.serviceName) {
        return {
          serviceId: 'custom-1',
          name: customDetails.serviceName,
          price: Number(customDetails.price) || 350,
          duration: customDetails.time || '30m',
        };
      }

      // Default fallback service item if name passed directly
      return {
        serviceId: String(srvIdOrName),
        name: String(srvIdOrName),
        price: 300,
        duration: '30m',
      };
    });
  } else if (customDetails && customDetails.serviceName) {
    resolvedServices = [
      {
        serviceId: 'custom-1',
        name: customDetails.serviceName,
        price: Number(customDetails.price) || 350,
        duration: customDetails.time || '30m',
      },
    ];
  } else {
    // Minimum fallback standard wash service if none specified
    resolvedServices = [
      {
        serviceId: 'standard-wash',
        name: 'Standard Exterior Wash',
        price: 350,
        duration: '30m',
      },
    ];
  }

  // 3. Authoritative Financial Calculations
  const subtotal = resolvedServices.reduce((sum, item) => sum + item.price, 0);
  const taxRate = 0.08; // 8% business standard tax rate
  const taxAmount = Number((subtotal * taxRate).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));
  const currency = business.currency || 'Indian Rupee (₹)';

  // 4. Generate unique Job ID and Tracking Token
  let jobId = generateJobId(vehiclePlate);
  let existingJob = await Job.findOne({ jobId });
  while (existingJob) {
    jobId = generateJobId(vehiclePlate);
    existingJob = await Job.findOne({ jobId });
  }

  let trackingToken = generateTrackingToken();
  let existingToken = await Job.findOne({ trackingToken });
  while (existingToken) {
    trackingToken = generateTrackingToken();
    existingToken = await Job.findOne({ trackingToken });
  }

  // 5. Construct Initial Activity Log
  const activities = [
    {
      title: 'New Check-In Completed',
      desc: `${customerName} checked in vehicle ${vehiclePlate.toUpperCase()}`,
      time: formatTime(),
      color: 'bg-gray-900',
    },
  ];

  // 5b. Automatically find or create Customer record for business
  let customerId = null;
  try {
    const customer = await upsertCustomerFromJob(business._id, ownerId, {
      customerName,
      customerPhone,
      vehiclePlate,
      vehicleModel,
      vehicleCategory,
    });
    if (customer) {
      customerId = customer._id;
    }
  } catch (err) {
    // Non-blocking fallback if customer creation encounters issue
  }

  // 5c. Validate Staff Member (if assignedStaff is supplied)
  let resolvedAssignedStaff = null;
  if (assignedStaff) {
    const rawStaffId = typeof assignedStaff === 'object' ? (assignedStaff.staffId || assignedStaff._id || assignedStaff.id) : assignedStaff;

    if (rawStaffId && mongoose.Types.ObjectId.isValid(String(rawStaffId))) {
      const staffDoc = await Staff.findOne({ _id: rawStaffId, businessId: business._id });
      if (!staffDoc) {
        const error = new Error('Staff member not found or access denied for this business.');
        error.statusCode = 404;
        throw error;
      }
      if (staffDoc.status === 'OFFLINE') {
        const error = new Error('Cannot assign an offline staff member to a job.');
        error.statusCode = 400;
        throw error;
      }
      resolvedAssignedStaff = {
        staffId: staffDoc._id.toString(),
        name: staffDoc.name,
        avatar: staffDoc.avatar,
      };
    } else if (typeof assignedStaff === 'object') {
      // Legacy string staffId (e.g. { staffId: 'mike', name: 'Mike R.', avatar: '...' })
      resolvedAssignedStaff = {
        staffId: assignedStaff.staffId || null,
        name: assignedStaff.name || '',
        avatar: assignedStaff.avatar || null,
      };
    }
  }

  // 6. Build Job Document
  const job = new Job({
    jobId,
    businessId: business._id,
    ownerId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerId,
    vehiclePlate: vehiclePlate.toUpperCase().trim(),
    vehicleBrand: vehicleBrand ? vehicleBrand.trim() : '',
    vehicleModel: vehicleModel.trim(),
    vehicleCategory: vehicleCategory || 'Car',
    wheelCategory: wheelCategory || '4-wheeler',
    vehicleType: vehicleType || '',
    services: resolvedServices,
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    currency,
    status: 'Pending',
    workflowStep: 'Wait',
    currentStepIndex: 0,
    priorityLevel: priorityLevel || 'Normal',
    assignedStaff: resolvedAssignedStaff,
    estimatedFinishTime: estimatedFinishTime || '11:45 AM',
    notes: notes || '',
    trackingToken,
    activities,
  });

  await job.save();
  return job;
};

/**
 * 2. Get Owner Jobs List with Search, Filter & Pagination (Owner Isolated)
 */
export const getJobsByOwner = async (ownerId, businessId, query = {}) => {
  const { status, categoryTab, search, page = 1, limit = 50 } = query;

  const filter = { businessId };

  // Status / Category Tab Filtering
  const effectiveTab = categoryTab || status;
  if (effectiveTab && effectiveTab !== 'All Jobs' && effectiveTab !== "Today's Jobs") {
    if (['Pending', 'In Progress', 'Ready', 'Completed', 'Cancelled'].includes(effectiveTab)) {
      filter.status = effectiveTab;
    }
  }

  // Search Filter
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { jobId: searchRegex },
      { customerName: searchRegex },
      { customerPhone: searchRegex },
      { vehiclePlate: searchRegex },
      { vehicleModel: searchRegex },
    ];
  }

  const numericPage = Math.max(1, parseInt(page, 10) || 1);
  const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (numericPage - 1) * numericLimit;

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(numericLimit),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    total,
    page: numericPage,
    pages: Math.ceil(total / numericLimit) || 1,
  };
};

/**
 * 3. Get Single Job by ID (Owner Isolated)
 */
export const getJobByIdForOwner = async (jobIdOrObjectId, businessId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(jobIdOrObjectId);
  const filter = {
    businessId,
    $or: [{ jobId: String(jobIdOrObjectId).toUpperCase() }],
  };

  if (isObjectId) {
    filter.$or.push({ _id: jobIdOrObjectId });
  }

  const job = await Job.findOne(filter);
  if (!job) {
    const error = new Error('Job not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  return job;
};

/**
 * 4. Update Job Details (Owner Isolated)
 */
export const updateJobForOwner = async (jobIdOrObjectId, businessId, updateData) => {
  const job = await getJobByIdForOwner(jobIdOrObjectId, businessId);

  // Prevent modifying immutable fields
  const forbiddenFields = [
    '_id',
    'jobId',
    'businessId',
    'ownerId',
    'trackingToken',
    'subtotal',
    'taxAmount',
    'grandTotal',
    'createdAt',
  ];

  forbiddenFields.forEach((field) => {
    delete updateData[field];
  });

  // Apply allowed field updates
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      job[key] = updateData[key];
    }
  });

  await job.save();
  return job;
};

/**
 * 5. Update Job Workflow Status (Owner Isolated State Machine)
 */
export const updateJobStatusForOwner = async (jobIdOrObjectId, businessId, statusPayload) => {
  const job = await getJobByIdForOwner(jobIdOrObjectId, businessId);

  const { stepIndex, workflowStep, status: inputStatus } = statusPayload;

  let targetIndex = job.currentStepIndex;
  let targetStep = job.workflowStep;
  let targetStatus = job.status;

  if (stepIndex !== undefined && stepIndex !== null) {
    const parsedIdx = parseInt(stepIndex, 10);
    if (parsedIdx >= 0 && parsedIdx <= 4) {
      targetIndex = parsedIdx;
      const stepConfig = WORKFLOW_MAP[parsedIdx];
      targetStep = stepConfig.step;
      targetStatus = stepConfig.status;
    }
  } else if (workflowStep) {
    const foundStep = WORKFLOW_MAP.find(
      (w) => w.step.toLowerCase() === String(workflowStep).toLowerCase()
    );
    if (foundStep) {
      targetIndex = foundStep.index;
      targetStep = foundStep.step;
      targetStatus = foundStep.status;
    }
  }

  if (inputStatus === 'Completed') {
    targetStatus = 'Completed';
    job.completedAt = new Date();
  } else if (inputStatus === 'Cancelled') {
    targetStatus = 'Cancelled';
  } else if (targetStatus !== 'Completed') {
    job.completedAt = null;
  }

  // Log activity
  job.currentStepIndex = targetIndex;
  job.workflowStep = targetStep;
  job.status = targetStatus;

  job.activities.unshift({
    title: 'Workflow Phase Change',
    desc: `Car ${job.vehiclePlate} moved to ${targetStep}`,
    time: formatTime(),
    color: targetStatus === 'Ready' ? 'bg-[#008a5b]' : 'bg-slate-600',
  });

  await job.save();
  return job;
};

/**
 * 6. Cancel Job (Owner Isolated)
 */
export const deleteJobForOwner = async (jobIdOrObjectId, businessId) => {
  const job = await getJobByIdForOwner(jobIdOrObjectId, businessId);

  job.status = 'Cancelled';
  job.activities.unshift({
    title: 'Job Cancelled',
    desc: `Job ${job.jobId} was cancelled by workshop manager`,
    time: formatTime(),
    color: 'bg-rose-600',
  });

  await job.save();
  return job;
};

/**
 * 7. Dashboard Aggregated Statistics (Owner Isolated)
 */
export const getJobStatsForOwner = async (ownerId, businessId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    vehiclesActive,
    completedToday,
    pendingStarts,
    distinctCustomers,
    workflowCountsRaw,
    priorityJob,
  ] = await Promise.all([
    // Active vehicles (Pending, In Progress, Ready)
    Job.countDocuments({
      businessId,
      status: { $in: ['Pending', 'In Progress', 'Ready'] },
    }),
    // Completed today
    Job.countDocuments({
      businessId,
      status: 'Completed',
      completedAt: { $gte: startOfToday, $lte: endOfToday },
    }),
    // Pending starts
    Job.countDocuments({
      businessId,
      status: 'Pending',
    }),
    // Distinct customers served
    Job.distinct('customerPhone', { businessId }),
    // Workflow counts breakdown
    Job.aggregate([
      { $match: { businessId, status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$workflowStep', count: { $sum: 1 } } },
    ]),
    // Priority active job
    Job.findOne({
      businessId,
      priorityLevel: { $in: ['High', 'Express'] },
      status: { $in: ['Pending', 'In Progress'] },
    }).sort({ updatedAt: -1 }),
  ]);

  const workflowMapCounts = {
    waiting: 0,
    washing: 0,
    interior: 0,
    qc: 0,
    ready: 0,
  };

  workflowCountsRaw.forEach((item) => {
    const stepLower = String(item._id).toLowerCase();
    if (stepLower === 'wait' || stepLower === 'waiting') workflowMapCounts.waiting = item.count;
    if (stepLower === 'wash' || stepLower === 'washing') workflowMapCounts.washing = item.count;
    if (stepLower === 'interior') workflowMapCounts.interior = item.count;
    if (stepLower === 'qc') workflowMapCounts.qc = item.count;
    if (stepLower === 'ready') workflowMapCounts.ready = item.count;
  });

  return {
    vehiclesActive,
    completedToday,
    pendingStarts,
    customersServed: distinctCustomers.length,
    workflowCounts: workflowMapCounts,
    priorityJob,
  };
};

/**
 * 8. Secure Public Vehicle Tracking
 */
export const getPublicTracking = async (params) => {
  const { token, plate, phone } = params;

  let filter = null;

  if (token && token.trim() !== '') {
    filter = { trackingToken: token.trim() };
  } else if (plate && phone) {
    filter = {
      vehiclePlate: plate.trim().toUpperCase(),
      customerPhone: phone.trim(),
    };
  } else {
    const error = new Error('Valid tracking token OR vehicle plate + phone number is required.');
    error.statusCode = 400;
    throw error;
  }

  const job = await Job.findOne(filter);
  if (!job) {
    const error = new Error('No active vehicle service found matching the provided tracking details.');
    error.statusCode = 404;
    throw error;
  }

  // Generate public timeline telemetry
  const timelineSteps = [
    { id: 1, title: 'Received', time: formatTime(job.createdAt), status: 'completed' },
    { id: 2, title: 'Waiting', status: job.currentStepIndex >= 0 ? 'completed' : 'upcoming' },
    {
      id: 3,
      title: 'Washing',
      description: 'High-pressure foam wash in progress',
      status: job.currentStepIndex > 1 ? 'completed' : job.currentStepIndex === 1 ? 'current' : 'upcoming',
    },
    {
      id: 4,
      title: 'Interior Cleaning',
      status: job.currentStepIndex > 2 ? 'completed' : job.currentStepIndex === 2 ? 'current' : 'upcoming',
    },
    {
      id: 5,
      title: 'Quality Check',
      status: job.currentStepIndex > 3 ? 'completed' : job.currentStepIndex === 3 ? 'current' : 'upcoming',
    },
    {
      id: 6,
      title: 'Ready',
      status: job.currentStepIndex === 4 || job.status === 'Completed' ? 'completed' : 'upcoming',
    },
    {
      id: 7,
      title: 'Delivered',
      status: job.status === 'Completed' ? 'completed' : 'upcoming',
    },
  ];

  // Mask customer phone for privacy
  const maskedPhone = job.customerPhone ? job.customerPhone.replace(/.(?=.{4})/g, '*') : '';

  return {
    jobId: job.jobId,
    vehiclePlate: job.vehiclePlate,
    vehicleModel: job.vehicleModel,
    vehicleBrand: job.vehicleBrand,
    customerName: job.customerName,
    customerPhoneMasked: maskedPhone,
    status: job.status,
    workflowStep: job.workflowStep,
    currentStepIndex: job.currentStepIndex,
    estimatedFinishTime: job.estimatedFinishTime || '30 mins',
    assignedStaff: job.assignedStaff
      ? { name: job.assignedStaff.name, avatar: job.assignedStaff.avatar }
      : { name: 'Assigned Specialist', avatar: null },
    services: job.services.map((s) => ({ name: s.name, duration: s.duration })),
    timeline: timelineSteps,
  };
};

/**
 * Reassign Job Staff Member (Owner Isolated)
 */
export const reassignJobStaff = async (jobId, businessId, staffId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    const error = new Error('Invalid Job ID format.');
    error.statusCode = 400;
    throw error;
  }

  const job = await Job.findOne({ _id: jobId, businessId });
  if (!job) {
    const error = new Error('Job not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  if (!staffId) {
    job.assignedStaff = null;
    await job.save();
    return job;
  }

  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    const error = new Error('Invalid Staff ID format.');
    error.statusCode = 400;
    throw error;
  }

  const staff = await Staff.findOne({ _id: staffId, businessId });
  if (!staff) {
    const error = new Error('Staff member not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  if (staff.status === 'OFFLINE') {
    const error = new Error('Cannot assign an offline staff member to a job.');
    error.statusCode = 400;
    throw error;
  }

  job.assignedStaff = {
    staffId: staff._id.toString(),
    name: staff.name,
    avatar: staff.avatar,
  };

  await job.save();
  return job;
};
