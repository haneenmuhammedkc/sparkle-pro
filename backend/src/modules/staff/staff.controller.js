import * as staffService from './staff.service.js';
import { successResponse } from '../../utils/apiResponse.js';

/**
 * GET /api/owner/staff
 * Get paginated & searchable list of staff members for owner's business
 */
export const getStaff = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const result = await staffService.getStaff(businessId, req.query);
    return successResponse(res, 200, 'Staff members retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/staff/stats
 * Get dynamic staff overview statistics
 */
export const getStaffStats = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const stats = await staffService.getStaffStats(businessId);
    return successResponse(res, 200, 'Staff statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/staff/:id
 * Get single staff member profile with workload details
 */
export const getStaffById = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const staffId = req.params.id;
    const staff = await staffService.getStaffDetailsWithWorkload(staffId, businessId);
    return successResponse(res, 200, 'Staff details retrieved successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/owner/staff
 * Create a new staff member profile
 */
export const createStaff = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const ownerId = req.user._id || req.user.userId;
    const staff = await staffService.createStaff(businessId, ownerId, req.body);
    return successResponse(res, 201, 'Staff member created successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/owner/staff/:id
 * Update staff profile details or status
 */
export const updateStaff = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const staffId = req.params.id;
    const updatedStaff = await staffService.updateStaff(staffId, businessId, req.body);
    return successResponse(res, 200, 'Staff member updated successfully', updatedStaff);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/owner/staff/:id
 * Delete staff member profile
 */
export const deleteStaff = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const staffId = req.params.id;
    const deletedStaff = await staffService.deleteStaff(staffId, businessId);
    return successResponse(res, 200, 'Staff member deleted successfully', deletedStaff);
  } catch (error) {
    next(error);
  }
};
