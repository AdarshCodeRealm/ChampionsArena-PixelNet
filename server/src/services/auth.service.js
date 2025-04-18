import { Player } from '../models/player.model.js';
import { Organizer } from '../models/organizer.model.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication Service
 * Handles passwordless OTP-based authentication for both player and organizer user types
 */
class AuthService {
  /**
   * Initialize OTP login process
   * If user exists, sends OTP for login, otherwise registers a new user
   * @param {Object} userData - Basic user identification data (email required)
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Object} - Status information
   */
  async initiateOtpAuth(userData, userType = 'player') {
    try {
      if (!userData.email) {
        throw new ApiError(400, "Email is required");
      }
      
      // Determine which model to use based on user type
      const UserModel = userType === 'organizer' ? Organizer : Player;
      
      // Check if user already exists with this email
      let user = await UserModel.findOne({ email: userData.email });
      let isNewUser = false;
      
      if (!user) {
        // This is a new user, check required fields
        isNewUser = true;
        if (userType === 'player') {
          if (!userData.name || !userData.username || !userData.uid) {
            throw new ApiError(400, "Name, username, and uid are required for new player registration");
          }
        } else if (userType === 'organizer') {
          if (!userData.name || !userData.phoneNumber || !userData.companyName || !userData.upiId) {
            throw new ApiError(400, "Name, phoneNumber, companyName, and upiId are required for new organizer registration");
          }
        }
        
        // Create new user with the provided data
        user = new UserModel({
          ...userData,
          userType
        });
      }
      
      // Generate OTP
      const otp = user.generateOTP();
      await user.save();
      
      // Send OTP email
      const emailSent = await sendOTPEmail(userData.email, otp);
      
      if (!emailSent) {
        throw new ApiError(500, "Failed to send verification email");
      }
      
      return {
        email: userData.email,
        userType,
        isNewUser,
        message: isNewUser 
          ? "Registration initiated. OTP sent to your email" 
          : "Login initiated. OTP sent to your email"
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Something went wrong during authentication initialization");
    }
  }

  /**
   * Verify OTP and complete authentication (login or registration)
   * @param {string} email - User's email
   * @param {string} otp - One-time password
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Object} - User data and tokens
   */
  async verifyOtpAndAuthenticate(email, otp, userType = 'player') {
    try {
      const UserModel = userType === 'organizer' ? Organizer : Player;
      
      const user = await UserModel.findOne({ email });
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      // Verify OTP
      if (!user.verifyOTP(otp)) {
        throw new ApiError(400, "Invalid or expired OTP");
      }
      
      // Mark as verified if not already
      if (!user.isVerified) {
        user.isVerified = true;
        // Send welcome email for newly verified users
        await sendWelcomeEmail(user.email, user.name);
      }
      
      // Record successful OTP login
      user.recordOTPLogin();
      
      // Generate tokens
      const accessToken = generateAccessToken({ _id: user._id, userType });
      const refreshToken = generateRefreshToken({ _id: user._id, userType });
      
      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();
      
      // Create user object with appropriate fields based on user type
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        userType: user.userType,
        isVerified: user.isVerified
      };
      
      if (userType === 'player') {
        userResponse.username = user.username;
        userResponse.uid = user.uid;
      } else if (userType === 'organizer') {
        userResponse.companyName = user.companyName;
        userResponse.isApproved = user.isApproved;
      }
      
      return {
        accessToken,
        refreshToken,
        user: userResponse
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Something went wrong during OTP verification");
    }
  }
  
  /**
   * Resend OTP to user
   * @param {string} email - User's email
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Object} - Email and message
   */
  async resendOTP(email, userType = 'player') {
    try {
      const UserModel = userType === 'organizer' ? Organizer : Player;
      
      const user = await UserModel.findOne({ email });
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();
      
      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp);
      
      if (!emailSent) {
        throw new ApiError(500, "Failed to send verification email");
      }
      
      return {
        email,
        message: "OTP resent to your email"
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Something went wrong while resending OTP");
    }
  }
  
  /**
   * Logout user
   * @param {string} userId - User ID
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Object} - Success message
   */
  async logout(userId, userType = 'player') {
    try {
      const UserModel = userType === 'organizer' ? Organizer : Player;
      
      // Find user and clear refresh token
      await UserModel.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } }
      );
      
      return {
        message: "Logged out successfully"
      };
    } catch (error) {
      throw new ApiError(500, "Something went wrong during logout");
    }
  }

  /**
   * Refresh the access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} - New access and refresh tokens
   */
  async refreshAccessToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
      }
      
      // Verify the refresh token
      const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      if (!decoded) {
        throw new ApiError(401, "Invalid or expired refresh token");
      }
      
      const { _id, userType } = decoded;
      
      // Determine which model to use based on user type
      const UserModel = userType === 'organizer' ? Organizer : Player;
      
      // Find the user and check if the refresh token matches
      const user = await UserModel.findById(_id);
      
      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token or user not found");
      }
      
      // Generate new tokens
      const accessToken = generateAccessToken({ _id: user._id, userType });
      const newRefreshToken = generateRefreshToken({ _id: user._id, userType });
      
      // Update the refresh token in the database
      user.refreshToken = newRefreshToken;
      await user.save();
      
      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Something went wrong during token refresh");
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService; 