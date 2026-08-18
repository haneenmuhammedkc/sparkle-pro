import * as businessService from './onboarding.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const getBusiness = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const business = await businessService.getBusinessByOwnerId(ownerId);
    return successResponse(res, 200, 'Business details retrieved', business);
  } catch (error) {
    next(error);
  }
};

export const setupStep1 = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const business = await businessService.saveStep1BusinessInfo(ownerId, req.body);
    return successResponse(res, 200, 'Business profile saved successfully', business);
  } catch (error) {
    next(error);
  }
};

export const setupStep2 = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const business = await businessService.saveStep2Operations(ownerId, req.body);
    return successResponse(res, 200, 'Operational details saved successfully', business);
  } catch (error) {
    next(error);
  }
};

export const setupStep3 = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const business = await businessService.saveStep3Services(ownerId, req.body);
    return successResponse(res, 200, 'Services & pricing saved successfully', business);
  } catch (error) {
    next(error);
  }
};

export const launch = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const business = await businessService.launchBusiness(ownerId, req.body);
    return successResponse(res, 200, 'Business workshop launched successfully!', business);
  } catch (error) {
    next(error);
  }
};
