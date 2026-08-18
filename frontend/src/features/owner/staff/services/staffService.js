import api from '../../../../services/api.js';

/**
 * Fetch paginated & searchable staff members list for owner business
 */
export const getStaff = async (params = {}) => {
  const response = await api.get('/owner/staff', { params });
  return response.data;
};

/**
 * Fetch dynamic staff overview statistics
 */
export const getStaffStats = async () => {
  const response = await api.get('/owner/staff/stats');
  return response.data;
};

/**
 * Fetch single staff profile with active workload & assigned job history
 */
export const getStaffById = async (id) => {
  const response = await api.get(`/owner/staff/${id}`);
  return response.data;
};

/**
 * Create a new staff member profile
 */
export const createStaff = async (staffData) => {
  const response = await api.post('/owner/staff', staffData);
  return response.data;
};

/**
 * Update an existing staff member profile details or status
 */
export const updateStaff = async (id, staffData) => {
  const response = await api.put(`/owner/staff/${id}`, staffData);
  return response.data;
};

/**
 * Delete a staff member profile
 */
export const deleteStaff = async (id) => {
  const response = await api.delete(`/owner/staff/${id}`);
  return response.data;
};

/**
 * Reassign or unassign staff to an existing job
 */
export const assignStaffToJob = async (jobId, staffId) => {
  const response = await api.patch(`/owner/jobs/${jobId}/assign`, { staffId });
  return response.data;
};

const staffService = {
  getStaff,
  getStaffStats,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  assignStaffToJob,
};

export default staffService;
