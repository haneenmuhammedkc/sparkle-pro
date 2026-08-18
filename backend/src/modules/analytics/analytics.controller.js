import * as analyticsService from './analytics.service.js';
import { successResponse } from '../../utils/apiResponse.js';

/**
 * GET /api/owner/analytics/overview
 * Get aggregated analytics overview metrics for owner's business
 */
export const getOverview = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const overview = await analyticsService.getOverviewAnalytics(businessId, req.query);
    return successResponse(res, 200, 'Analytics overview retrieved successfully', overview);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/analytics/revenue-trend
 * Get timeframe revenue trend buckets
 */
export const getRevenueTrend = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const trend = await analyticsService.getRevenueTrend(businessId, req.query);
    return successResponse(res, 200, 'Revenue trend retrieved successfully', trend);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/analytics/mom-comparison
 * Get Month-over-Month revenue comparison & growth
 */
export const getMoMComparison = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const comparison = await analyticsService.getMoMComparison(businessId);
    return successResponse(res, 200, 'MoM comparison retrieved successfully', comparison);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/analytics/service-popularity
 * Get historical service popularity aggregation
 */
export const getServicePopularity = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const popularity = await analyticsService.getServicePopularityAnalytics(businessId, req.query);
    return successResponse(res, 200, 'Service popularity analytics retrieved successfully', popularity);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/analytics/vehicle-breakdown
 * Get vehicle category distribution breakdown
 */
export const getVehicleBreakdown = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const breakdown = await analyticsService.getVehicleBreakdownAnalytics(businessId, req.query);
    return successResponse(res, 200, 'Vehicle category breakdown retrieved successfully', breakdown);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/analytics/staff-performance
 * Get dynamic staff performance & workload analytics
 */
export const getStaffPerformance = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const performance = await analyticsService.getStaffPerformanceAnalytics(businessId, req.query);
    return successResponse(res, 200, 'Staff performance analytics retrieved successfully', performance);
  } catch (error) {
    next(error);
  }
};
