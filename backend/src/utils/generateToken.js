import jwt from 'jsonwebtoken';

/**
 * Generate short-lived Access Token (default 15m)
 * @param {Object} payload - { userId, role, businessId }
 */
export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate long-lived Refresh Token (default 7d)
 * @param {Object} payload - { userId, role, businessId, jti, familyId }
 */
export const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify Access Token
 * @param {string} token
 */
export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
  return jwt.verify(token, secret);
};

/**
 * Verify Refresh Token
 * @param {string} token
 */
export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
  return jwt.verify(token, secret);
};

/**
 * Generate Password Reset Token (default 15m)
 * @param {Object} payload - { userId, purpose, issuedAt }
 */
export const generateResetToken = (payload) => {
  const secret = process.env.RESET_PASSWORD_SECRET || 'fallback_reset_secret';
  const expiresIn = process.env.RESET_PASSWORD_EXPIRES_IN || '15m';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify Password Reset Token
 * @param {string} token
 */
export const verifyResetToken = (token) => {
  const secret = process.env.RESET_PASSWORD_SECRET || 'fallback_reset_secret';
  return jwt.verify(token, secret);
};
