import Business from '../../models/Business.js';
import User from '../../models/User.js';
import Job from '../jobs/jobs.model.js';
import Customer from '../customers/customers.model.js';
import Staff from '../staff/staff.model.js';

/**
 * Get unified settings context for owner & business
 */
export const getSettings = async (userId, businessId) => {
  const user = await User.findById(userId).select('fullName email avatar role twoFactorEnabled');
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  let business = await Business.findOne({ _id: businessId, ownerId: userId });
  if (!business) {
    business = await Business.findOne({ ownerId: userId });
  }

  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    business: {
      id: business._id,
      name: business.name,
      ownerName: business.ownerName || user.fullName,
      taxId: business.taxId || '',
      email: business.email,
      mobileNumber: business.mobileNumber || '',
      whatsappNumber: business.whatsappNumber || '',
      address: business.address || '',
      logo: business.logo || null,
      capacity: business.capacity || 30,
      bays: business.bays || [],
      allowOverbooking: business.allowOverbooking || false,
      peakSurge: business.peakSurge || false,
      openingTime: business.openingTime || '08:00 AM',
      closingTime: business.closingTime || '07:00 PM',
      weeklyHolidays: business.weeklyHolidays || [],
      servicesConfigured: business.servicesConfigured || [],
      categoryPricing: business.categoryPricing || {},
      notificationPreferences: business.notificationPreferences || {},
      currency: business.currency || 'Indian Rupee (₹)',
      trialEndsAt: business.trialEndsAt,
      setupCompleted: business.setupCompleted,
    },
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      twoFactorEnabled: business.twoFactorEnabled !== undefined ? business.twoFactorEnabled : (user.twoFactorEnabled || false),
    },
  };
};

/**
 * Update Business Profile details
 */
export const updateProfile = async (userId, businessId, data) => {
  const { companyName, ownerName, taxId, email, phone, whatsappNumber, address, logo } = data;

  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2 || companyName.trim().length > 100) {
    const error = new Error('Company name is required and must be between 2 and 100 characters');
    error.statusCode = 400;
    throw error;
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    const error = new Error('A valid email address is required');
    error.statusCode = 400;
    throw error;
  }

  if (address && address.length > 300) {
    const error = new Error('Address cannot exceed 300 characters');
    error.statusCode = 400;
    throw error;
  }

  let business = await Business.findOne({ ownerId: userId });
  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  // Explicit field assignment (prevents mass assignment)
  business.name = companyName.trim();
  if (ownerName !== undefined) business.ownerName = ownerName.trim();
  if (taxId !== undefined) business.taxId = taxId.trim();
  business.email = email.toLowerCase().trim();
  if (phone !== undefined) business.mobileNumber = phone.trim();
  if (whatsappNumber !== undefined) business.whatsappNumber = whatsappNumber.trim();
  if (address !== undefined) business.address = address.trim();
  if (logo !== undefined) business.logo = logo;

  await business.save();
  return getSettings(userId, business._id);
};

/**
 * Update Workshop Operational Settings
 */
export const updateWorkshop = async (userId, businessId, data) => {
  const { capacity, bays, allowOverbooking, peakSurge, openingTime, closingTime, weeklyHolidays } = data;

  let business = await Business.findOne({ ownerId: userId });
  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  if (capacity !== undefined) {
    const capNum = Number(capacity);
    if (!Number.isInteger(capNum) || capNum < 1 || capNum > 500) {
      const error = new Error('Daily capacity limit must be an integer between 1 and 500');
      error.statusCode = 400;
      throw error;
    }
    business.capacity = capNum;
  }

  if (bays !== undefined) {
    if (!Array.isArray(bays)) {
      const error = new Error('Washing bays must be an array');
      error.statusCode = 400;
      throw error;
    }

    // Active job safety check when deleting bays
    const existingBays = business.bays || [];
    if (bays.length < existingBays.length) {
      const activeJobsCount = await Job.countDocuments({
        businessId: business._id,
        status: { $in: ['Pending', 'In Progress', 'Ready'] },
      });
      if (activeJobsCount > 0) {
        const error = new Error('Cannot delete bay with active assigned jobs.');
        error.statusCode = 400;
        throw error;
      }
    }

    business.bays = bays.map((b, index) => ({
      bayId: b.bayId || index + 1,
      name: b.name ? String(b.name).trim() : `Bay ${index + 1}`,
      type: b.type ? String(b.type).trim() : 'General',
      active: Boolean(b.active),
    }));
  }

  if (allowOverbooking !== undefined) business.allowOverbooking = Boolean(allowOverbooking);
  if (peakSurge !== undefined) business.peakSurge = Boolean(peakSurge);

  if (weeklyHolidays !== undefined) {
    const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!Array.isArray(weeklyHolidays) || !weeklyHolidays.every((day) => validDays.includes(day))) {
      const error = new Error('Weekly holidays must be an array of valid days of the week');
      error.statusCode = 400;
      throw error;
    }
    business.weeklyHolidays = weeklyHolidays;
  }

  if (openingTime !== undefined) {
    if (!openingTime || typeof openingTime !== 'string') {
      const error = new Error('Opening time is required');
      error.statusCode = 400;
      throw error;
    }
    business.openingTime = openingTime.trim();
  }

  if (closingTime !== undefined) {
    if (!closingTime || typeof closingTime !== 'string') {
      const error = new Error('Closing time is required');
      error.statusCode = 400;
      throw error;
    }
    business.closingTime = closingTime.trim();
  }

  await business.save();
  return getSettings(userId, business._id);
};

export const normalizeVehicleSpecificServices = (servicesConfigured = []) => {
  const result = [];
  servicesConfigured.forEach((s, idx) => {
    // Migrate legacy multi-vehicle pricing objects to vehicle-specific records
    if (s.pricing && typeof s.pricing === 'object' && Object.keys(s.pricing).length > 0) {
      Object.entries(s.pricing).forEach(([catKey, details]) => {
        const catMap = {
          Bike: '2-wheeler',
          Car: '4-wheeler',
          SUV: 'suv',
          Truck: 'custom',
          Van: 'custom',
        };
        const vCat = catMap[catKey] || catKey.toLowerCase();
        result.push({
          id: `${s.id || s._id || 'srv-' + idx}-${vCat}`,
          name: `${s.name} (${catKey})`,
          description: s.description || '',
          vehicleCategory: vCat,
          price: Number(details.price || 0),
          duration: details.duration || s.duration || '30 mins',
          enabled: s.enabled !== undefined ? Boolean(s.enabled) : true,
        });
      });
    } else {
      const catMap = {
        '2-wheeler': '2-wheeler',
        '4-wheeler': '4-wheeler',
        'suv': 'suv',
        'custom': 'custom',
        Bike: '2-wheeler',
        Car: '4-wheeler',
        SUV: 'suv',
        Van: 'custom',
        Truck: 'custom',
      };
      const rawCat = s.vehicleCategory || s.category || '4-wheeler';
      const normCat = catMap[rawCat] || rawCat;
      const rawPrice = s.price !== undefined
        ? Number(s.price)
        : Number(String(s.startingPrice || '0').replace(/[^0-9]/g, '')) || 0;

      result.push({
        id: String(s.id || s._id || `srv-${idx + 1}`),
        name: s.name || 'Unnamed Service',
        description: s.description || '',
        vehicleCategory: normCat,
        price: rawPrice,
        duration: s.duration || s.time || '30 mins',
        enabled: s.enabled !== undefined ? Boolean(s.enabled) : true,
      });
    }
  });
  return result;
};

/**
 * Get Service & Pricing Configurations
 */
export const getServices = async (userId, businessId) => {
  const business = await Business.findOne({ ownerId: userId });
  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  const normalized = normalizeVehicleSpecificServices(business.servicesConfigured || []);
  return {
    servicesConfigured: normalized,
    categoryPricing: business.categoryPricing || {},
  };
};

/**
 * Update Services & Pricing Configurations
 */
export const updateServices = async (userId, businessId, data) => {
  const { servicesConfigured, categoryPricing } = data;

  const business = await Business.findOne({ ownerId: userId });
  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  if (servicesConfigured !== undefined) {
    if (!Array.isArray(servicesConfigured)) {
      const error = new Error('servicesConfigured must be an array');
      error.statusCode = 400;
      throw error;
    }
    const normalized = normalizeVehicleSpecificServices(servicesConfigured);
    business.servicesConfigured = normalized;
  }

  if (categoryPricing !== undefined) {
    if (typeof categoryPricing !== 'object' || categoryPricing === null) {
      const error = new Error('categoryPricing must be an object');
      error.statusCode = 400;
      throw error;
    }
    business.categoryPricing = categoryPricing;
  }

  await business.save();
  return {
    servicesConfigured: business.servicesConfigured,
    categoryPricing: business.categoryPricing,
  };
};

/**
 * Update Notification Preferences
 */
export const updateNotifications = async (userId, businessId, data) => {
  const { emailAlerts, smsReminders, pushNotifs, jobComplete, weeklyReport } = data;

  const business = await Business.findOne({ ownerId: userId });
  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  const currentPrefs = business.notificationPreferences || {};

  business.notificationPreferences = {
    emailAlerts: emailAlerts !== undefined ? Boolean(emailAlerts) : Boolean(currentPrefs.emailAlerts),
    smsReminders: smsReminders !== undefined ? Boolean(smsReminders) : Boolean(currentPrefs.smsReminders),
    pushNotifs: pushNotifs !== undefined ? Boolean(pushNotifs) : Boolean(currentPrefs.pushNotifs),
    jobComplete: jobComplete !== undefined ? Boolean(jobComplete) : Boolean(currentPrefs.jobComplete),
    weeklyReport: weeklyReport !== undefined ? Boolean(weeklyReport) : Boolean(currentPrefs.weeklyReport),
  };

  await business.save();
  return business.notificationPreferences;
};

/**
 * Change Owner Admin Password
 */
export const changePassword = async (userId, data) => {
  const { currentPassword, newPassword, confirmPassword } = data;

  if (!currentPassword || !newPassword || !confirmPassword) {
    const error = new Error('Current password, new password, and confirmation password are required');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error('New password must be at least 8 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error('New password and confirmation password do not match');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Incorrect current password');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  return {
    success: true,
    message: 'Password updated successfully',
  };
};

/**
 * Toggle Two-Factor Authentication (2FA) Setting
 */
export const toggle2FA = async (userId, data) => {
  const { twoFactorEnabled } = data;

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.twoFactorEnabled = Boolean(twoFactorEnabled);
  await user.save();

  return {
    twoFactorEnabled: user.twoFactorEnabled,
  };
};

/**
 * Export Business Backup Archives
 */
export const exportBackup = async (userId, businessId, type) => {
  const validTypes = ['weekly', 'monthly', 'yearly'];
  if (!type || !validTypes.includes(type)) {
    const error = new Error('Invalid export type. Must be weekly, monthly, or yearly');
    error.statusCode = 400;
    throw error;
  }

  const business = await Business.findOne({ ownerId: userId });
  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  const bId = business._id;

  let daysBack = 7;
  if (type === 'monthly') daysBack = 30;
  if (type === 'yearly') daysBack = 365;

  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const jobs = await Job.find({ businessId: bId, createdAt: { $gte: startDate } }).lean();
  const customers = await Customer.find({ businessId: bId }).lean();
  const staff = await Staff.find({ businessId: bId }).select('-__v').lean();

  if (type === 'yearly') {
    const jsonData = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        businessName: business.name,
        timeframe: type,
        recordCounts: { jobs: jobs.length, customers: customers.length, staff: staff.length },
        jobs,
        customers,
        staff,
      },
      null,
      2
    );

    return {
      contentType: 'application/json',
      fileName: `${business.name.replace(/[^a-zA-Z0-9]/g, '_')}_yearly_backup_${new Date().toISOString().slice(0, 10)}.json`,
      content: jsonData,
    };
  }

  // Generate CSV for Weekly / Monthly
  let csvLines = ['Job ID,Customer Name,Phone,Vehicle Plate,Service Status,Grand Total (INR),Created At\n'];
  jobs.forEach((j) => {
    const safeCustName = `"${(j.customerName || '').replace(/"/g, '""')}"`;
    const safePhone = `"${(j.customerPhone || '').replace(/"/g, '""')}"`;
    const safePlate = `"${(j.vehiclePlate || '').replace(/"/g, '""')}"`;
    csvLines.push(`${j.jobId || j._id},${safeCustName},${safePhone},${safePlate},${j.status},${j.grandTotal || 0},${j.createdAt}\n`);
  });

  return {
    contentType: 'text/csv',
    fileName: `${business.name.replace(/[^a-zA-Z0-9]/g, '_')}_${type}_backup_${new Date().toISOString().slice(0, 10)}.csv`,
    content: csvLines.join(''),
  };
};
