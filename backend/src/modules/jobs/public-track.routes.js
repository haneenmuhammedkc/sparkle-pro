import express from 'express';
import * as publicTrackController from './public-track.controller.js';
import { publicTrackingLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

// Public vehicle live tracking route (rate-limited)
router.get('/track', publicTrackingLimiter, publicTrackController.trackVehicle);

export default router;
