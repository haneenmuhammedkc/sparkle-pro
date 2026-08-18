import api from '../../../../services/api.js';

/**
 * Get unified settings context (Business profile, workshop settings, user info, notification preferences)
 */
export const getSettings = async () => {
  const response = await api.get('/owner/settings');
  return response.data;
};

/**
 * Update Business Profile details (companyName, ownerName, taxId, email, phone, address, logo)
 */
export const updateProfile = async (profileData) => {
  const response = await api.patch('/owner/settings/profile', profileData);
  return response.data;
};

/**
 * Update Workshop Operational Settings (capacity, bays, allowOverbooking, peakSurge, openingTime, closingTime, weeklyHolidays)
 */
export const updateWorkshop = async (workshopData) => {
  const response = await api.patch('/owner/settings/workshop', workshopData);
  return response.data;
};

/**
 * Get Service & Pricing Configurations
 */
export const getServices = async () => {
  const response = await api.get('/owner/settings/services');
  return response.data;
};

/**
 * Update Services & Pricing Configurations
 */
export const updateServices = async (servicesData) => {
  const response = await api.put('/owner/settings/services', servicesData);
  return response.data;
};

/**
 * Update Notification Preferences
 */
export const updateNotifications = async (preferences) => {
  const response = await api.patch('/owner/settings/notifications', preferences);
  return response.data;
};

/**
 * Change Admin Password
 */
export const changePassword = async (passwordData) => {
  const response = await api.patch('/owner/settings/security/password', passwordData);
  return response.data;
};

/**
 * Toggle Two-Factor Authentication Setting
 */
export const toggle2FA = async (twoFactorEnabled) => {
  const response = await api.patch('/owner/settings/security/2fa', { twoFactorEnabled });
  return response.data;
};

/**
 * Trigger Backup Download (.CSV or .JSON)
 * @param {string} type - 'weekly' | 'monthly' | 'yearly'
 */
export const downloadBackup = async (type) => {
  const response = await api.get(`/owner/settings/backup/export?type=${type}`, {
    responseType: 'blob',
  });

  // Extract filename from header or construct default
  const contentDisposition = response.headers['content-disposition'];
  let fileName = `backup_${type}_${new Date().toISOString().slice(0, 10)}.${type === 'yearly' ? 'json' : 'csv'}`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      fileName = filenameMatch[1];
    }
  }

  // Create temporary blob URL download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return true;
};
