import api from '../../../../services/api.js';

/**
 * Public Vehicle Live Tracking Lookup
 * @param {Object} params - { token, plate, phone }
 */
export const trackVehicle = async (params = {}) => {
  const response = await api.get('/public/track', { params });
  return response.data;
};
