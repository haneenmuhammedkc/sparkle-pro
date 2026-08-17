import Business from '../models/Business.js';
import User from '../models/User.js';

/**
 * Get Business details for current owner
 */
export const getBusinessByOwnerId = async (ownerId) => {
  const business = await Business.findOne({ ownerId });
  return business;
};

/**
 * Step 1: Save/Update Business Profile
 */
export const saveStep1BusinessInfo = async (ownerId, data) => {
  const {
    businessName,
    ownerName,
    email,
    mobileNumber,
    whatsappNumber,
    businessType,
    logoPreview,
  } = data;

  if (!businessName || !email) {
    const error = new Error('Business name and email address are required');
    error.statusCode = 400;
    throw error;
  }

  let business = await Business.findOne({ ownerId });

  if (business && business.setupCompleted) {
    const error = new Error('Business onboarding setup has already been completed. Changes must be made through Settings.');
    error.statusCode = 400;
    throw error;
  }

  if (!business) {
    business = new Business({
      ownerId,
      name: businessName.trim(),
      ownerName: ownerName ? ownerName.trim() : '',
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber || '',
      whatsappNumber: whatsappNumber || '',
      businessType: businessType || 'car-wash',
      logo: logoPreview || null,
    });
  } else {
    business.name = businessName.trim();
    if (ownerName) business.ownerName = ownerName.trim();
    business.email = email.toLowerCase().trim();
    if (mobileNumber !== undefined) business.mobileNumber = mobileNumber;
    if (whatsappNumber !== undefined) business.whatsappNumber = whatsappNumber;
    if (businessType) business.businessType = businessType;
    if (logoPreview !== undefined) business.logo = logoPreview;
  }

  await business.save();
  return business;
};

/**
 * Step 2: Save/Update Operational Details
 */
export const saveStep2Operations = async (ownerId, data) => {
  const {
    openingTime,
    closingTime,
    selectedHolidays,
    staffCount,
    isSoloOperator,
    currency,
  } = data;

  let business = await Business.findOne({ ownerId });
  if (!business) {
    const error = new Error('Please complete Step 1 (Business Info) first');
    error.statusCode = 400;
    throw error;
  }

  if (business.setupCompleted) {
    const error = new Error('Business onboarding setup has already been completed. Changes must be made through Settings.');
    error.statusCode = 400;
    throw error;
  }

  if (openingTime) business.openingTime = openingTime;
  if (closingTime) business.closingTime = closingTime;
  if (selectedHolidays) business.weeklyHolidays = selectedHolidays;
  if (staffCount) business.staffCount = staffCount;
  if (isSoloOperator !== undefined) business.isSoloOperator = isSoloOperator;
  if (currency) business.currency = currency;

  await business.save();
  return business;
};

/**
 * Step 3: Save/Update Services & Pricing
 */
export const saveStep3Services = async (ownerId, data) => {
  const {
    exteriorWashEnabled,
    deepDetailingEnabled,
    selectedCategory,
    categoryPricing,
    servicesConfigured,
  } = data;

  let business = await Business.findOne({ ownerId });
  if (!business) {
    const error = new Error('Please complete Step 1 (Business Info) first');
    error.statusCode = 400;
    throw error;
  }

  if (business.setupCompleted) {
    const error = new Error('Business onboarding setup has already been completed. Changes must be made through Settings.');
    error.statusCode = 400;
    throw error;
  }

  if (servicesConfigured) {
    business.servicesConfigured = servicesConfigured;
  } else {
    // Update default service states if passed
    business.servicesConfigured = [
      {
        name: 'Exterior Wash',
        category: 'Car',
        duration: '45 mins',
        startingPrice: '₹299',
        enabled: exteriorWashEnabled !== undefined ? exteriorWashEnabled : true,
      },
      {
        name: 'Deep Detailing',
        category: 'Car',
        duration: '120 mins',
        startingPrice: '₹1,499',
        enabled: deepDetailingEnabled !== undefined ? deepDetailingEnabled : true,
      },
    ];
  }

  if (categoryPricing) {
    business.categoryPricing = categoryPricing;
  }

  await business.save();
  return business;
};

/**
 * Step 4: Finalize & Launch Business Workshop
 */
export const launchBusiness = async (ownerId, data) => {
  const { agreed } = data;

  let business = await Business.findOne({ ownerId });
  if (!business) {
    const error = new Error('No business profile found to launch');
    error.statusCode = 404;
    throw error;
  }

  if (business.setupCompleted) {
    const error = new Error('Business onboarding setup has already been completed. Changes must be made through Settings.');
    error.statusCode = 400;
    throw error;
  }

  business.setupCompleted = true;
  await business.save();

  return business;
};
