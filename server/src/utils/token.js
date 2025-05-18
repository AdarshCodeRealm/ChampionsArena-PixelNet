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
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} - Object containing both tokens
 */
export const generateTokens = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
    username: user.username,
    role: user.role || 'player'
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} - Decoded token data
 */
export const verifyRefreshToken = (token) => {
  return verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
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