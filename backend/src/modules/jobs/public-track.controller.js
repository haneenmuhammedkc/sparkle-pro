import * as jobService from './jobs.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const trackVehicle = async (req, res, next) => {
  try {
    const telemetry = await jobService.getPublicTracking(req.query);
    return successResponse(res, 200, 'Vehicle live tracking telemetry retrieved successfully', telemetry);
  } catch (error) {
    next(error);
  }
};
