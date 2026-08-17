import api from './api.js';

export const register = async ({ fullName, email, password }) => {
  const response = await api.post('/auth/register', { fullName, email, password });
  return response.data;
};

export const verifyEmail = async ({ email, otp }) => {
  const response = await api.post('/auth/verify-email', { email, otp });
  return response.data;
};

export const resendVerificationOTP = async ({ email }) => {
  const response = await api.post('/auth/resend-verification-otp', { email });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyPasswordResetOTP = async ({ email, otp }) => {
  const response = await api.post('/auth/verify-password-reset-otp', { email, otp });
  return response.data;
};

export const resendPasswordResetOTP = async ({ email }) => {
  const response = await api.post('/auth/resend-password-reset-otp', { email });
  return response.data;
};

export const resetPassword = async ({ resetToken, newPassword }) => {
  const response = await api.post('/auth/reset-password', { resetToken, newPassword });
  return response.data;
};
