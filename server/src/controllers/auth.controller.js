import authService from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Player } from '../models/player.model.js';
import { Organizer } from '../models/organizer.model.js';
import { generateOTP, sendOTP } from '../utils/otpUtils.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res, next) => {
  try {
    const { userType, ...userData } = req.body;

    if (userType && !['player', 'organizer'].includes(userType)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid user type. Must be 'player' or 'organizer'")
      );
    }

    if (userType === 'player' || !userType) {
      if (!userData.name || !userData.username || !userData.uid || !userData.email || !userData.password) {
        return res.status(400).json(
          new ApiResponse(400, null, "All fields are required for player registration (name, username, uid, email, password)")
        );
      }
    } else if (userType === 'organizer') {
      if (!userData.name || !userData.email || !userData.phoneNumber || !userData.companyName || !userData.upiId || !userData.password) {
        return res.status(400).json(
          new ApiResponse(400, null, "All fields are required for organizer registration (name, email, phoneNumber, companyName, upiId, password)")
        );
      }
    }
    
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

export const initiateOtpAuth = async (req, res) => {
  try {
    const { email, userType } = req.body;

    // Validate user type
    if (!['player', 'organizer'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Store OTP in database based on user type
    if (userType === 'player') {
      let player = await Player.findOne({ email });
      if (!player) {
        player = new Player({ email, otp, otpExpiry });
      } else {
        player.otp = otp;
        player.otpExpiry = otpExpiry;
      }
      await player.save();
    } else {
      let organizer = await Organizer.findOne({ email });
      if (!organizer) {
        organizer = new Organizer({ email, otp, otpExpiry });
      } else {
        organizer.otp = otp;
        organizer.otpExpiry = otpExpiry;
      }
      await organizer.save();
    }

    // Send OTP to email
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, userType, name, companyName } = req.body;

    // Find user based on type
    let user;
    if (userType === 'player') {
      user = await Player.findOne({ email });
    } else {
      user = await Organizer.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;

    // If new user, update profile
    if (!user.isVerified) {
      if (userType === 'player') {
        user.name = name;
      } else {
        user.name = name;
        user.companyName = companyName;
      }
      user.isVerified = true;
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        userType,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set session cookie for web clients
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        userType,
        isVerified: user.isVerified,
        ...(userType === 'organizer' && { isApproved: user.isApproved })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, userType } = req.body;

    // Find user
    let user;
    if (userType === 'player') {
      user = await Player.findOne({ email });
    } else {
      user = await Organizer.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Update user's OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send new OTP
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('session');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

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

/**
 * Login existing user with OTP verification
 * @route POST /api/v1/auth/login-with-otp
 */
export const loginWithOtp = async (req, res, next) => {
  try {
    const { email, otp, userType = 'player' } = req.body;

    if (!email || !otp) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email and OTP are required")
      );
    }

    const loginResult = await authService.verifyOtpAndLogin(email, otp, userType);

    return res.status(200).json(
      new ApiResponse(200, loginResult, "Logged in successfully")
    );

  } catch (error) {
    console.error("Login error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong during login";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

