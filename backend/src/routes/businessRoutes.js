import express from 'express';
import * as businessController from '../controllers/businessController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerMiddleware from '../middleware/ownerMiddleware.js';

const router = express.Router();

// All owner business routes require authentication & OWNER role
router.use(authMiddleware, ownerMiddleware);

router.get('/business', businessController.getBusiness);
router.post('/setup/business', businessController.setupStep1);
router.put('/setup/operations', businessController.setupStep2);
router.post('/setup/services', businessController.setupStep3);
router.post('/setup/launch', businessController.launch);

export default router;
