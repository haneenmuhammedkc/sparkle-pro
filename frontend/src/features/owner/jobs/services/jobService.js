import api from '../../../../services/api.js';

/**
 * Create a new Job Card
 * @param {Object} jobData
 */
export const createJob = async (jobData) => {
  const response = await api.post('/owner/jobs', jobData);
  return response.data;
};

/**
 * Get list of owner jobs with optional status filter, search, & pagination
 * @param {Object} params - { status, categoryTab, search, page, limit }
 */
export const getJobs = async (params = {}) => {
  const response = await api.get('/owner/jobs', { params });
  return response.data;
};

/**
 * Get aggregated dashboard job statistics
 */
export const getJobStats = async () => {
  const response = await api.get('/owner/jobs/stats');
  return response.data;
};

/**
 * Get single job by ID or plate number
 * @param {string} id
 */
export const getJobById = async (id) => {
  const response = await api.get(`/owner/jobs/${id}`);
  return response.data;
};

/**
 * Update editable fields of a job
 * @param {string} id
 * @param {Object} updateData
 */
export const updateJob = async (id, updateData) => {
  const response = await api.put(`/owner/jobs/${id}`, updateData);
  return response.data;
};

/**
 * Update job workflow status / step index
 * @param {string} id
 * @param {Object} payload - { stepIndex, workflowStep, status }
 */
export const updateJobStatus = async (id, payload) => {
  const response = await api.patch(`/owner/jobs/${id}/status`, payload);
  return response.data;
};

/**
 * Cancel a job
 * @param {string} id
 */
export const cancelJob = async (id) => {
  const response = await api.delete(`/owner/jobs/${id}`);
  return response.data;
};
