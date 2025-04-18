import jwt from 'jsonwebtoken';

/**
 * Generate access token
 * @param {Object} payload - User payload data
 * @returns {string} - JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - User payload data
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key used for verification
 * @returns {Object|null} - Decoded token or null if invalid
 */
export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}; 