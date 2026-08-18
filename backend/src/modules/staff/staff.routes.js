import express from 'express';
import * as staffController from './staff.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import ownerMiddleware from '../../middleware/ownerMiddleware.js';

const router = express.Router();

// Protect all owner staff routes with auth & owner role
router.use(authMiddleware, ownerMiddleware);

// Static routes BEFORE parameter routes
router.get('/', staffController.getStaff);
router.get('/stats', staffController.getStaffStats);
router.post('/', staffController.createStaff);

// Parameter routes
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

export default router;
