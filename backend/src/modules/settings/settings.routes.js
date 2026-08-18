import express from 'express';
import * as settingsController from './settings.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import ownerMiddleware from '../../middleware/ownerMiddleware.js';

const router = express.Router();

// All settings routes require owner authentication & authorization
router.use(authMiddleware, ownerMiddleware);

router.get('/settings', settingsController.getSettings);
router.patch('/settings/profile', settingsController.updateProfile);
router.patch('/settings/workshop', settingsController.updateWorkshop);
router.get('/settings/services', settingsController.getServices);
router.put('/settings/services', settingsController.updateServices);
router.patch('/settings/notifications', settingsController.updateNotifications);
router.patch('/settings/security/password', settingsController.changePassword);
router.patch('/settings/security/2fa', settingsController.toggle2FA);
router.get('/settings/backup/export', settingsController.exportBackup);

export default router;
