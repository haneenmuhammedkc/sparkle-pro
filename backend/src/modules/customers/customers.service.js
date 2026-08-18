import Customer, { normalizePhone } from './customers.model.js';
import Job from '../jobs/jobs.model.js';
import Business from '../../models/Business.js';
import mongoose from 'mongoose';

/**
 * 1. Create a New Customer Profile
 */
export const createCustomer = async (businessId, ownerId, data) => {
  const { name, phone, email, notes, vehiclePlate, vehicleModel, vehicleCategory } = data;

  if (!ownerId && businessId) {
    const business = await Business.findById(businessId);
    if (business) ownerId = business.ownerId;
  }

  if (!name || !phone) {
    const error = new Error('Customer name and phone number are required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedPhone = normalizePhone(phone);
  const existingCustomer = await Customer.findOne({ businessId, phone: normalizedPhone });

  if (existingCustomer) {
    const error = new Error('A customer with this phone number already exists in your business.');
    error.statusCode = 409;
    throw error;
  }

  const vehicles = [];
  if (vehiclePlate) {
    vehicles.push({
      plate: String(vehiclePlate).trim().toUpperCase(),
      model: vehicleModel ? String(vehicleModel).trim() : 'Standard Vehicle',
      category: vehicleCategory ? String(vehicleCategory).trim() : 'Car',
    });
  }

  const customer = new Customer({
    businessId,
    ownerId,
    name: String(name).trim(),
    phone: normalizedPhone,
    email: email ? String(email).trim().toLowerCase() : '',
    notes: notes ? String(notes).trim() : '',
    vehicles,
    firstVisitAt: new Date(),
    lastVisitAt: new Date(),
  });

  await customer.save();
  return customer;
};

/**
 * 2. Get Scoped Customer List with Search & Pagination
 */
export const getCustomers = async (businessId, params = {}) => {
  const { search, page = 1, limit = 10, sortBy = 'lastVisitAt' } = params;

  const query = { businessId };

  if (search && String(search).trim()) {
    const searchRegex = new RegExp(String(search).trim(), 'i');
    const searchDigits = String(search).replace(/\D/g, '');

    const searchConditions = [
      { name: searchRegex },
      { email: searchRegex },
      { 'vehicles.plate': searchRegex },
      { 'vehicles.model': searchRegex },
    ];

    if (searchDigits) {
      searchConditions.push({ phone: new RegExp(searchDigits, 'i') });
    }

    query.$or = searchConditions;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  let sortOption = { lastVisitAt: -1 };
  if (sortBy === 'name') sortOption = { name: 1 };
  if (sortBy === 'createdAt') sortOption = { createdAt: -1 };

  const [customers, totalCount] = await Promise.all([
    Customer.find(query).sort(sortOption).skip(skip).limit(parsedLimit),
    Customer.countDocuments(query),
  ]);

  // Aggregate job counts for each customer in list
  const customersWithStats = await Promise.all(
    customers.map(async (c) => {
      const jobStats = await Job.aggregate([
        {
          $match: {
            businessId: new mongoose.Types.ObjectId(String(businessId)),
            $or: [{ customerId: c._id }, { customerPhone: c.phone }],
          },
        },
        {
          $group: {
            _id: null,
            totalVisits: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Completed'] }, '$grandTotal', 0],
              },
            },
          },
        },
      ]);

      const stats = jobStats[0] || { totalVisits: 0, totalSpent: 0 };
      const doc = c.toObject();
      doc.totalVisits = stats.totalVisits;
      doc.totalSpent = Math.round((stats.totalSpent || 0) * 100) / 100;
      return doc;
    })
  );

  return {
    customers: customersWithStats,
    totalCount,
    totalPages: Math.ceil(totalCount / parsedLimit),
    currentPage: parsedPage,
  };
};

/**
 * 3. Get Single Customer Profile by ID (IDOR Protected)
 */
export const getCustomerById = async (customerId, businessId) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    const error = new Error('Invalid customer ID format.');
    error.statusCode = 400;
    throw error;
  }

  const customer = await Customer.findOne({ _id: customerId, businessId });

  if (!customer) {
    const error = new Error('Customer not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

/**
 * 4. Update Customer Profile (IDOR Protected)
 */
export const updateCustomer = async (customerId, businessId, updateData) => {
  const customer = await getCustomerById(customerId, businessId);

  const forbiddenFields = ['_id', 'businessId', 'ownerId', 'firstVisitAt', 'createdAt'];
  forbiddenFields.forEach((field) => delete updateData[field]);

  if (updateData.name !== undefined) customer.name = String(updateData.name).trim();
  if (updateData.email !== undefined) customer.email = String(updateData.email).trim().toLowerCase();
  if (updateData.notes !== undefined) customer.notes = String(updateData.notes).trim();

  if (updateData.phone !== undefined) {
    const normalized = normalizePhone(updateData.phone);
    if (normalized && normalized !== customer.phone) {
      const duplicate = await Customer.findOne({ businessId, phone: normalized, _id: { $ne: customer._id } });
      if (duplicate) {
        const error = new Error('Another customer in your business is already using this phone number.');
        error.statusCode = 409;
        throw error;
      }
      customer.phone = normalized;
    }
  }

  if (updateData.vehiclePlate) {
    const plateUpper = String(updateData.vehiclePlate).trim().toUpperCase();
    const existingVehicle = customer.vehicles.find((v) => v.plate === plateUpper);
    if (!existingVehicle) {
      customer.vehicles.push({
        plate: plateUpper,
        model: updateData.vehicleModel ? String(updateData.vehicleModel).trim() : 'Standard Vehicle',
        category: updateData.vehicleCategory ? String(updateData.vehicleCategory).trim() : 'Car',
      });
    }
  }

  await customer.save();
  return customer;
};

/**
 * 5. Delete Customer Profile (IDOR Protected)
 */
export const deleteCustomer = async (customerId, businessId) => {
  const customer = await getCustomerById(customerId, businessId);
  await Customer.deleteOne({ _id: customer._id, businessId });
  return customer;
};

/**
 * 6. Find Customer by Phone (Normalized Lookup)
 */
export const findCustomerByPhone = async (businessId, phone) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;
  return await Customer.findOne({ businessId, phone: normalizedPhone });
};

/**
 * 7. Automatic Customer Upsert on Job Creation
 */
export const upsertCustomerFromJob = async (businessId, ownerId, jobData) => {
  const { customerName, customerPhone, vehiclePlate, vehicleModel, vehicleCategory } = jobData;

  if (!ownerId && businessId) {
    const business = await Business.findById(businessId);
    if (business) ownerId = business.ownerId;
  }

  if (!customerName || !customerPhone) {
    return null;
  }

  const normalizedPhone = normalizePhone(customerPhone);
  let customer = await Customer.findOne({ businessId, phone: normalizedPhone });

  const plateUpper = vehiclePlate ? String(vehiclePlate).trim().toUpperCase() : null;

  if (customer) {
    customer.lastVisitAt = new Date();

    if (plateUpper) {
      const hasVehicle = customer.vehicles.some((v) => v.plate === plateUpper);
      if (!hasVehicle) {
        customer.vehicles.push({
          plate: plateUpper,
          model: vehicleModel ? String(vehicleModel).trim() : 'Standard Vehicle',
          category: vehicleCategory ? String(vehicleCategory).trim() : 'Car',
        });
      }
    }

    await customer.save();
  } else {
    const vehicles = [];
    if (plateUpper) {
      vehicles.push({
        plate: plateUpper,
        model: vehicleModel ? String(vehicleModel).trim() : 'Standard Vehicle',
        category: vehicleCategory ? String(vehicleCategory).trim() : 'Car',
      });
    }

    customer = new Customer({
      businessId,
      ownerId,
      name: String(customerName).trim(),
      phone: normalizedPhone,
      vehicles,
      firstVisitAt: new Date(),
      lastVisitAt: new Date(),
    });

    await customer.save();
  }

  return customer;
};

/**
 * 8. Customer Analytics Overview Stats
 */
export const getCustomerStats = async (businessId) => {
  const totalCustomers = await Customer.countDocuments({ businessId });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeCustomers = await Customer.countDocuments({
    businessId,
    lastVisitAt: { $gte: thirtyDaysAgo },
  });

  const revenueResult = await Job.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(String(businessId)),
        status: 'Completed',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$grandTotal' },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  return {
    totalCustomers,
    activeCustomers,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
  };
};

/**
 * 9. Get Detailed Customer Profile with Job History
 */
export const getCustomerDetailsWithHistory = async (customerId, businessId) => {
  const customer = await getCustomerById(customerId, businessId);

  const jobs = await Job.find({
    businessId,
    $or: [{ customerId: customer._id }, { customerPhone: customer.phone }],
  }).sort({ createdAt: -1 });

  const completedJobs = jobs.filter((j) => j.status === 'Completed');
  const activeJobs = jobs.filter((j) => j.status !== 'Completed' && j.status !== 'Cancelled');
  const totalSpent = completedJobs.reduce((sum, j) => sum + (j.grandTotal || 0), 0);

  const serviceHistory = jobs.map((j) => ({
    _id: j._id,
    jobId: j.jobId,
    vehiclePlate: j.vehiclePlate,
    vehicleModel: j.vehicleModel,
    services: j.services,
    subtotal: j.subtotal,
    taxAmount: j.taxAmount,
    grandTotal: j.grandTotal,
    status: j.status,
    workflowStep: j.workflowStep,
    createdAt: j.createdAt,
    completedAt: j.completedAt,
  }));

  const doc = customer.toObject();
  doc.totalVisits = jobs.length;
  doc.completedVisits = completedJobs.length;
  doc.activeVisits = activeJobs.length;
  doc.totalSpent = Math.round(totalSpent * 100) / 100;
  doc.serviceHistory = serviceHistory;

  return doc;
};

/**
 * 10. Safe Backfill / Migration for Existing Jobs with null customerId
 */
export const backfillExistingJobs = async (businessId) => {
  const jobsToBackfill = await Job.find({ businessId, customerId: null });

  let backfilledCount = 0;

  for (const job of jobsToBackfill) {
    if (!job.customerName || !job.customerPhone) continue;

    const customer = await upsertCustomerFromJob(businessId, job.ownerId, {
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      vehiclePlate: job.vehiclePlate,
      vehicleModel: job.vehicleModel,
      vehicleCategory: job.vehicleCategory,
    });

    if (customer) {
      job.customerId = customer._id;
      await job.save();
      backfilledCount++;
    }
  }

  return {
    totalProcessed: jobsToBackfill.length,
    backfilledCount,
  };
};
