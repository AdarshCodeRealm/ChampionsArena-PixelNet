import authService from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Register a new user (player or organizer)
 * @route POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { userType, ...userData } = req.body;

    // Validate user type
    if (userType && !['player', 'organizer'].includes(userType)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid user type. Must be 'player' or 'organizer'")
      );
    }

    // Validate required fields based on user type
    if (userType === 'player' || !userType) {
      // Player validation
      if (!userData.name || !userData.username || !userData.uid || !userData.email || !userData.password) {
        return res.status(400).json(
          new ApiResponse(400, null, "All fields are required for player registration (name, username, uid, email, password)")
        );
      }
    } else if (userType === 'organizer') {
      // Organizer validation
      if (!userData.name || !userData.email || !userData.phoneNumber || !userData.companyName || !userData.upiId || !userData.password) {
        return res.status(400).json(
          new ApiResponse(400, null, "All fields are required for organizer registration (name, email, phoneNumber, companyName, upiId, password)")
        );
      }
    }
    
    // Register the user using auth service
    const result = await authService.register(userData, userType || 'player');
    
    return res.status(201).json(
      new ApiResponse(201, { email: result.email, userType: result.userType }, result.message)
    );
    
  } catch (error) {
    console.error("Registration error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong during registration";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Initiate OTP-based authentication (login or registration)
 * @route POST /api/v1/auth/initiate-otp-auth
 */
export const initiateOtpAuth = async (req, res, next) => {
  try {
    const { userType, ...userData } = req.body;

    // Validate user type
    if (userType && !['player', 'organizer'].includes(userType)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid user type. Must be 'player' or 'organizer'")
      );
    }
    
    // Initiate OTP authentication
    const result = await authService.initiateOtpAuth(userData, userType || 'player');
    
    return res.status(200).json(
      new ApiResponse(200, 
        { 
          email: result.email, 
          userType: result.userType,
          isNewUser: result.isNewUser
        }, 
        result.message
      )
    );
    
  } catch (error) {
    console.error("OTP Authentication initiation error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong during authentication initiation";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Verify OTP and complete authentication
 * @route POST /api/v1/auth/verify-otp
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, userType } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email and OTP are required")
      );
    }
    
    const result = await authService.verifyOtpAndAuthenticate(email, otp, userType || 'player');
    
    return res.status(200).json(
      new ApiResponse(200, result, "Authentication successful")
    );
    
  } catch (error) {
    console.error("OTP verification error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong during OTP verification";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Resend OTP to user
 * @route POST /api/v1/auth/resend-otp
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email, userType } = req.body;
    
    if (!email) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email is required")
      );
    }
    
    const result = await authService.resendOTP(email, userType || 'player');
    
    return res.status(200).json(
      new ApiResponse(200, { email: result.email }, result.message)
    );
    
  } catch (error) {
    console.error("Resend OTP error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong while resending OTP";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;
    
    if (!email || !password) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email and password are required")
      );
    }
    
    const result = await authService.login({ email, password }, userType || 'player');
    
    return res.status(200).json(
      new ApiResponse(200, result, "Logged in successfully")
    );
    
  } catch (error) {
    console.error("Login error:", error);
    
    // Special case for unauthorized but with data (like account not verified)
    if (error.statusCode === 403 && error.data) {
      return res.status(403).json(
        new ApiResponse(403, error.data, error.message)
      );
    }
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong during login";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Logout user
 * @route POST /api/v1/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // Get user from middleware
    const { _id, userType } = req.user;
    
    await authService.logout(_id, userType || 'player');
    
    return res.status(200).json(
      new ApiResponse(200, {}, "Logged out successfully")
    );
    
  } catch (error) {
    console.error("Logout error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong during logout";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Refresh access token
 * @route POST /api/v1/auth/refresh-token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json(
        new ApiResponse(400, null, "Refresh token is required")
      );
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    return res.status(200).json(
      new ApiResponse(200, result, "Token refreshed successfully")
    );
    
  } catch (error) {
    console.error("Token refresh error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong during token refresh";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
}; 