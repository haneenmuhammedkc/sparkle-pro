import express from 'express';
import * as analyticsController from './analytics.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import ownerMiddleware from '../../middleware/ownerMiddleware.js';

const router = express.Router();

// All owner analytics routes require authentication & OWNER role
router.use(authMiddleware, ownerMiddleware);

router.get('/overview', analyticsController.getOverview);
router.get('/revenue-trend', analyticsController.getRevenueTrend);
router.get('/mom-comparison', analyticsController.getMoMComparison);
router.get('/service-popularity', analyticsController.getServicePopularity);
router.get('/vehicle-breakdown', analyticsController.getVehicleBreakdown);
router.get('/staff-performance', analyticsController.getStaffPerformance);

export default router;
