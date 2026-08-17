import { errorResponse } from '../utils/apiResponse.js';

const notFoundMiddleware = (req, res, next) => {
  return errorResponse(res, 404, `Route not found - ${req.originalUrl}`);
};

export default notFoundMiddleware;
