/**
 * Send a success API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Human-readable success message
 * @param {Object|Array|null} data - Payload data
 */
export const successResponse = (res, statusCode = 200, message = 'Request successful', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Human-readable error message
 * @param {Array|Object|null} errors - Specific validation or field errors
 * @param {Object|null} data - Optional payload data for error context
 */
export const errorResponse = (res, statusCode = 500, message = 'Something went wrong', errors = null, data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
    errors,
  });
};
