import * as jobService from './jobs.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const createJob = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const job = await jobService.createJob(ownerId, req.body);
    return successResponse(res, 201, 'Job card created successfully', job);
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const businessId = req.user.businessId;
    const result = await jobService.getJobsByOwner(ownerId, businessId, req.query);
    return successResponse(res, 200, 'Jobs list retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getJobStats = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const businessId = req.user.businessId;
    const stats = await jobService.getJobStatsForOwner(ownerId, businessId);
    return successResponse(res, 200, 'Dashboard job statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const job = await jobService.getJobByIdForOwner(req.params.id, businessId);
    return successResponse(res, 200, 'Job details retrieved successfully', job);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const job = await jobService.updateJobForOwner(req.params.id, businessId, req.body);
    return successResponse(res, 200, 'Job updated successfully', job);
  } catch (error) {
    next(error);
  }
};

export const updateJobStatus = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const job = await jobService.updateJobStatusForOwner(req.params.id, businessId, req.body);
    return successResponse(res, 200, 'Job workflow status updated successfully', job);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const job = await jobService.deleteJobForOwner(req.params.id, businessId);
    return successResponse(res, 200, 'Job cancelled successfully', job);
  } catch (error) {
    next(error);
  }
};

export const reassignJobStaff = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const jobId = req.params.id;
    const { staffId } = req.body;
    const updatedJob = await jobService.reassignJobStaff(jobId, businessId, staffId);
    return successResponse(res, 200, 'Staff assigned successfully', updatedJob);
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const jobId = req.params.id;
    const updatedJob = await jobService.recordPaymentForOwner(jobId, businessId, req.body);
    return successResponse(res, 200, 'Payment recorded successfully', updatedJob);
  } catch (error) {
    next(error);
  }
};
