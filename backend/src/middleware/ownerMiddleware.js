import { errorResponse } from '../utils/apiResponse.js';

const ownerMiddleware = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Unauthorized. Please log in first.');
  }

  if (req.user.role !== 'OWNER') {
    return errorResponse(res, 403, 'Access denied. Owner privilege required.');
  }

  next();
};

export default ownerMiddleware;
