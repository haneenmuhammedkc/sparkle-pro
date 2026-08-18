import express from 'express';
import * as customerController from './customers.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import ownerMiddleware from '../../middleware/ownerMiddleware.js';

const router = express.Router();

// Require authentication and OWNER role for all owner customer routes
router.use(authMiddleware, ownerMiddleware);

// Static routes BEFORE parameter routes
router.get('/', customerController.getCustomers);
router.get('/stats', customerController.getCustomerStats);
router.post('/', customerController.createCustomer);

// Parameter routes
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
