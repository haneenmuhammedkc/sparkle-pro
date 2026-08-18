import api from '../../../../services/api.js';

/**
 * Get paginated list of owner's customers with optional search & pagination
 * @param {Object} params - { search, page, limit, sortBy }
 */
export const getCustomers = async (params = {}) => {
  const response = await api.get('/owner/customers', { params });
  return response.data;
};

/**
 * Get aggregated customer overview statistics
 */
export const getCustomerStats = async () => {
  const response = await api.get('/owner/customers/stats');
  return response.data;
};

/**
 * Get single customer details with service history
 * @param {string} id
 */
export const getCustomerById = async (id) => {
  const response = await api.get(`/owner/customers/${id}`);
  return response.data;
};

/**
 * Create a new customer profile manually
 * @param {Object} data
 */
export const createCustomer = async (data) => {
  const response = await api.post('/owner/customers', data);
  return response.data;
};

/**
 * Update an existing customer profile
 * @param {string} id
 * @param {Object} data
 */
export const updateCustomer = async (id, data) => {
  const response = await api.put(`/owner/customers/${id}`, data);
  return response.data;
};

/**
 * Delete a customer profile
 * @param {string} id
 */
export const deleteCustomer = async (id) => {
  const response = await api.delete(`/owner/customers/${id}`);
  return response.data;
};
