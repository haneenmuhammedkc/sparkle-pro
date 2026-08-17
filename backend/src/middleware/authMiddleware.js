import { verifyAccessToken } from '../utils/generateToken.js';
import { errorResponse } from '../utils/apiResponse.js';
import User from '../models/User.js';
import Business from '../models/Business.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authentication failed. Missing or malformed Bearer token.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 401, 'Authentication failed. Access token missing.');
    }

    // Verify token signature & expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Access token has expired. Please refresh your token.');
      }
      return errorResponse(res, 401, 'Invalid access token.');
    }

    // Verify user still exists in DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorResponse(res, 401, 'Authenticated user account no longer exists.');
    }

    // Check if Business exists for this owner
    let businessId = decoded.businessId || null;
    let setupCompleted = false;

    const business = await Business.findOne({ ownerId: user._id });
    if (business) {
      businessId = business._id.toString();
      setupCompleted = business.setupCompleted;
    }

    // Attach user payload to request
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      businessId,
      setupCompleted,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
