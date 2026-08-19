import express from 'express';
import * as jobController from './jobs.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import ownerMiddleware from '../../middleware/ownerMiddleware.js';

const router = express.Router();

// Require authentication and OWNER role for all owner job routes
router.use(authMiddleware, ownerMiddleware);

router.post('/', jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/stats', jobController.getJobStats);
router.get('/:id', jobController.getJobById);
router.put('/:id', jobController.updateJob);
router.patch('/:id/status', jobController.updateJobStatus);
router.patch('/:id/assign', jobController.reassignJobStaff);
router.patch('/:id/payment', jobController.recordPayment);
router.delete('/:id', jobController.deleteJob);

export default router;
