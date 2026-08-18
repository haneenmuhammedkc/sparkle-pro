import * as settingsService from './settings.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const getSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const settings = await settingsService.getSettings(userId, businessId);
    return successResponse(res, 200, 'Settings retrieved successfully', settings);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const settings = await settingsService.updateProfile(userId, businessId, req.body);
    return successResponse(res, 200, 'Business profile updated successfully', settings);
  } catch (error) {
    next(error);
  }
};

export const updateWorkshop = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const settings = await settingsService.updateWorkshop(userId, businessId, req.body);
    return successResponse(res, 200, 'Workshop settings updated successfully', settings);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const services = await settingsService.getServices(userId, businessId);
    return successResponse(res, 200, 'Services and pricing configuration retrieved successfully', services);
  } catch (error) {
    next(error);
  }
};

export const updateServices = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const services = await settingsService.updateServices(userId, businessId, req.body);
    return successResponse(res, 200, 'Services and pricing configuration updated successfully', services);
  } catch (error) {
    next(error);
  }
};

export const updateNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const preferences = await settingsService.updateNotifications(userId, businessId, req.body);
    return successResponse(res, 200, 'Notification preferences updated successfully', preferences);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await settingsService.changePassword(userId, req.body);
    return successResponse(res, 200, 'Password updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const toggle2FA = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await settingsService.toggle2FA(userId, req.body);
    return successResponse(res, 200, 'Two-factor authentication setting updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const exportBackup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const type = req.query.type;

    const backup = await settingsService.exportBackup(userId, businessId, type);
    
    res.setHeader('Content-Type', backup.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${backup.fileName}"`);
    return res.status(200).send(backup.content);
  } catch (error) {
    next(error);
  }
};
