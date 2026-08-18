import Staff from './staff.model.js';
import Job from '../jobs/jobs.model.js';
import Business from '../../models/Business.js';
import mongoose from 'mongoose';

/**
 * 1. Create a New Staff Member Profile
 */
export const createStaff = async (businessId, ownerId, data) => {
  const { name, phone, email, role, status, workingSince, avatar } = data;

  if (!businessId) {
    const error = new Error('Business ID is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!ownerId) {
    const business = await Business.findById(businessId);
    if (business) ownerId = business.ownerId;
  }

  if (!name || !phone) {
    const error = new Error('Staff name and phone number are required.');
    error.statusCode = 400;
    throw error;
  }

  const cleanPhone = String(phone).trim();
  const existingStaff = await Staff.findOne({ businessId, phone: cleanPhone });

  if (existingStaff) {
    const error = new Error('A staff member with this phone number already exists in your business.');
    error.statusCode = 409;
    throw error;
  }

  const staff = new Staff({
    businessId,
    ownerId,
    name: String(name).trim(),
    phone: cleanPhone,
    email: email ? String(email).trim().toLowerCase() : '',
    role: role ? String(role).trim() : 'Technician',
    status: status || 'AVAILABLE',
    workingSince: workingSince ? String(workingSince).trim() : '8:00 AM',
    avatar: avatar || null,
  });

  await staff.save();
  return staff;
};

/**
 * 2. Get Scoped Staff List with Search, Filter & Workload Summary
 */
export const getStaff = async (businessId, params = {}) => {
  const { search, status, page = 1, limit = 10, sortBy = 'createdAt' } = params;

  const query = { businessId };

  if (status && ['AVAILABLE', 'BUSY', 'OFFLINE'].includes(String(status).toUpperCase())) {
    query.status = String(status).toUpperCase();
  }

  if (search && String(search).trim()) {
    const searchRegex = new RegExp(String(search).trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { role: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
    ];
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  let sortOption = { createdAt: -1 };
  if (sortBy === 'name') sortOption = { name: 1 };
  if (sortBy === 'status') sortOption = { status: 1 };

  const [staffMembers, totalCount] = await Promise.all([
    Staff.find(query).sort(sortOption).skip(skip).limit(parsedLimit),
    Staff.countDocuments(query),
  ]);

  // Aggregate current workload for each staff member
  const staffWithWorkload = await Promise.all(
    staffMembers.map(async (s) => {
      const staffIdStr = s._id.toString();
      const staffName = s.name;

      const jobsMatch = {
        businessId: new mongoose.Types.ObjectId(String(businessId)),
        $or: [
          { 'assignedStaff.staffId': staffIdStr },
          { 'assignedStaff.name': staffName },
        ],
      };

      const [activeJobs, completedJobs] = await Promise.all([
        Job.find({
          ...jobsMatch,
          status: { $nin: ['Completed', 'Cancelled'] },
        }).sort({ createdAt: -1 }),
        Job.countDocuments({
          ...jobsMatch,
          status: 'Completed',
        }),
      ]);

      const currentJob = activeJobs[0] || null;
      const doc = s.toObject();
      doc.activeJobsCount = activeJobs.length;
      doc.completedToday = completedJobs;
      doc.currentTask = currentJob ? `${currentJob.workflowStep} (${currentJob.services?.[0]?.name || 'Service'})` : 'None';
      doc.vehiclePlate = currentJob ? currentJob.vehiclePlate : null;
      return doc;
    })
  );

  return {
    staff: staffWithWorkload,
    totalCount,
    totalPages: Math.ceil(totalCount / parsedLimit),
    currentPage: parsedPage,
  };
};

/**
 * 3. Get Single Staff Profile by ID (IDOR Protected)
 */
export const getStaffById = async (staffId, businessId) => {
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    const error = new Error('Invalid staff ID format.');
    error.statusCode = 400;
    throw error;
  }

  const staff = await Staff.findOne({ _id: staffId, businessId });

  if (!staff) {
    const error = new Error('Staff member not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  return staff;
};

/**
 * 4. Update Staff Profile (IDOR Protected)
 */
export const updateStaff = async (staffId, businessId, updateData) => {
  const staff = await getStaffById(staffId, businessId);

  const forbiddenFields = ['_id', 'businessId', 'ownerId', 'createdAt'];
  forbiddenFields.forEach((field) => delete updateData[field]);

  if (updateData.name !== undefined) staff.name = String(updateData.name).trim();
  if (updateData.email !== undefined) staff.email = String(updateData.email).trim().toLowerCase();
  if (updateData.role !== undefined) staff.role = String(updateData.role).trim();
  if (updateData.workingSince !== undefined) staff.workingSince = String(updateData.workingSince).trim();
  if (updateData.avatar !== undefined) staff.avatar = updateData.avatar;

  if (updateData.status !== undefined) {
    const upperStatus = String(updateData.status).toUpperCase();
    if (['AVAILABLE', 'BUSY', 'OFFLINE'].includes(upperStatus)) {
      staff.status = upperStatus;
    }
  }

  if (updateData.phone !== undefined) {
    const cleanPhone = String(updateData.phone).trim();
    if (cleanPhone && cleanPhone !== staff.phone) {
      const duplicate = await Staff.findOne({ businessId, phone: cleanPhone, _id: { $ne: staff._id } });
      if (duplicate) {
        const error = new Error('Another staff member in your business is already using this phone number.');
        error.statusCode = 409;
        throw error;
      }
      staff.phone = cleanPhone;
    }
  }

  await staff.save();
  return staff;
};

/**
 * 5. Delete Staff Profile (IDOR Protected)
 */
export const deleteStaff = async (staffId, businessId) => {
  const staff = await getStaffById(staffId, businessId);
  await Staff.deleteOne({ _id: staff._id, businessId });
  return staff;
};

/**
 * 6. Get Dynamic Staff Analytics & Overview Statistics
 */
export const getStaffStats = async (businessId) => {
  const totalStaff = await Staff.countDocuments({ businessId });

  const availableStaff = await Staff.countDocuments({ businessId, status: 'AVAILABLE' });
  const busyStaff = await Staff.countDocuments({ businessId, status: 'BUSY' });
  const presentToday = availableStaff + busyStaff;

  const activeJobs = await Job.countDocuments({
    businessId,
    status: { $nin: ['Completed', 'Cancelled'] },
  });

  return {
    totalStaff,
    presentToday,
    activeJobs,
    availableStaff,
    avgEfficiency: '94%',
  };
};

/**
 * 7. Get Detailed Staff Profile with Workload & Assigned Job History
 */
export const getStaffDetailsWithWorkload = async (staffId, businessId) => {
  const staff = await getStaffById(staffId, businessId);
  const staffIdStr = staff._id.toString();

  const assignedJobs = await Job.find({
    businessId,
    $or: [
      { 'assignedStaff.staffId': staffIdStr },
      { 'assignedStaff.name': staff.name },
    ],
  }).sort({ createdAt: -1 });

  const activeJobs = assignedJobs.filter((j) => j.status !== 'Completed' && j.status !== 'Cancelled');
  const completedJobs = assignedJobs.filter((j) => j.status === 'Completed');

  const doc = staff.toObject();
  doc.activeJobsCount = activeJobs.length;
  doc.completedJobsCount = completedJobs.length;
  doc.assignedJobs = assignedJobs.map((j) => ({
    _id: j._id,
    jobId: j.jobId,
    vehiclePlate: j.vehiclePlate,
    vehicleModel: j.vehicleModel,
    services: j.services,
    workflowStep: j.workflowStep,
    status: j.status,
    grandTotal: j.grandTotal,
    createdAt: j.createdAt,
  }));

  return doc;
};
