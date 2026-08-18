import * as customerService from './customers.service.js';
import { successResponse } from '../../utils/apiResponse.js';

/**
 * GET /api/owner/customers
 * Get paginated & searchable list of customers for owner's business
 */
export const getCustomers = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const result = await customerService.getCustomers(businessId, req.query);
    return successResponse(res, 200, 'Customers retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/customers/stats
 * Get aggregated customer overview statistics
 */
export const getCustomerStats = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const stats = await customerService.getCustomerStats(businessId);
    return successResponse(res, 200, 'Customer statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/customers/:id
 * Get single customer details with dynamic job history
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const customerId = req.params.id;
    const customer = await customerService.getCustomerDetailsWithHistory(customerId, businessId);
    return successResponse(res, 200, 'Customer details retrieved successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/owner/customers
 * Create a new customer profile manually
 */
export const createCustomer = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const ownerId = req.user._id || req.user.userId;
    const customer = await customerService.createCustomer(businessId, ownerId, req.body);
    return successResponse(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/owner/customers/:id
 * Update customer profile details
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const customerId = req.params.id;
    const updatedCustomer = await customerService.updateCustomer(customerId, businessId, req.body);
    return successResponse(res, 200, 'Customer updated successfully', updatedCustomer);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/owner/customers/:id
 * Delete customer profile
 */
export const deleteCustomer = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const customerId = req.params.id;
    const deletedCustomer = await customerService.deleteCustomer(customerId, businessId);
    return successResponse(res, 200, 'Customer deleted successfully', deletedCustomer);
  } catch (error) {
    next(error);
  }
};
