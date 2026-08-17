import api from './api.js';

export const getBusiness = async () => {
  const response = await api.get('/owner/business');
  return response.data;
};

export const saveStep1BusinessInfo = async (data) => {
  const response = await api.post('/owner/setup/business', data);
  return response.data;
};

export const saveStep2Operations = async (data) => {
  const response = await api.put('/owner/setup/operations', data);
  return response.data;
};

export const saveStep3Services = async (data) => {
  const response = await api.post('/owner/setup/services', data);
  return response.data;
};

export const launchBusiness = async (data) => {
  const response = await api.post('/owner/setup/launch', data);
  return response.data;
};
