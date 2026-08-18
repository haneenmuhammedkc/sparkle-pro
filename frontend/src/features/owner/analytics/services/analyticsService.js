import api from '../../../../services/api.js';

/**
 * Fetch overview analytics metrics (total revenue, completed/cancelled jobs, avg job value, completion rate, customer growth)
 */
export const getAnalyticsOverview = async (params = {}) => {
  const response = await api.get('/owner/analytics/overview', { params });
  return response.data;
};

/**
 * Fetch revenue trend data buckets for selected timeframe
 */
export const getRevenueTrend = async (params = {}) => {
  const response = await api.get('/owner/analytics/revenue-trend', { params });
  return response.data;
};

/**
 * Fetch Month-over-Month (MoM) revenue comparison metrics
 */
export const getMomComparison = async () => {
  const response = await api.get('/owner/analytics/mom-comparison');
  return response.data;
};

/**
 * Fetch service popularity aggregation rankings
 */
export const getServicePopularity = async (params = {}) => {
  const response = await api.get('/owner/analytics/service-popularity', { params });
  return response.data;
};

/**
 * Fetch vehicle category distribution breakdown
 */
export const getVehicleBreakdown = async (params = {}) => {
  const response = await api.get('/owner/analytics/vehicle-breakdown', { params });
  return response.data;
};

/**
 * Fetch dynamic staff performance evaluation metrics
 */
export const getStaffPerformance = async (params = {}) => {
  const response = await api.get('/owner/analytics/staff-performance', { params });
  return response.data;
};

const analyticsService = {
  getAnalyticsOverview,
  getRevenueTrend,
  getMomComparison,
  getServicePopularity,
  getVehicleBreakdown,
  getStaffPerformance,
};

export default analyticsService;
