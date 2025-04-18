import userService from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Get user profile
 * @route GET /api/v1/users/player/profile | /api/v1/users/organizer/profile
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userType = req.userType || req.user.userType;
    
    const userData = await userService.getUserProfile(userId, userType);
    
    return res.status(200).json(
      new ApiResponse(200, userData, "User profile retrieved successfully")
    );
  } catch (error) {
    console.error("Get profile error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to retrieve user profile";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Update user profile
 * @route PUT /api/v1/users/player/profile | /api/v1/users/organizer/profile
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userType = req.userType || req.user.userType;
    const updateData = req.body;
    
    // Prevent updating critical fields
    delete updateData.password;
    delete updateData.email; // Email changes should be handled separately with verification
    delete updateData.isVerified;
    delete updateData.isApproved;
    
    const updatedUser = await userService.updateUserProfile(userId, updateData, userType);
    
    return res.status(200).json(
      new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
  } catch (error) {
    console.error("Update profile error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to update user profile";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Update account settings
 * @route PUT /api/v1/users/player/settings | /api/v1/users/organizer/settings
 */
export const updateAccountSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userType = req.userType || req.user.userType;
    const settingsData = req.body;
    
    const updatedSettings = await userService.updateAccountSettings(userId, settingsData, userType);
    
    return res.status(200).json(
      new ApiResponse(200, updatedSettings, "Account settings updated successfully")
    );
  } catch (error) {
    console.error("Update settings error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to update account settings";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Change password
 * @route PUT /api/v1/users/player/password | /api/v1/users/organizer/password
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userType = req.userType || req.user.userType;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        new ApiResponse(400, null, "Current password and new password are required")
      );
    }
    
    await userService.changePassword(userId, currentPassword, newPassword, userType);
    
    return res.status(200).json(
      new ApiResponse(200, {}, "Password changed successfully")
    );
  } catch (error) {
    console.error("Change password error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to change password";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Upload profile picture
 * @route POST /api/v1/users/upload-profile-picture
 */
export const uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userType = req.userType || req.user.userType;
    
    // Check if file is present in request
    if (!req.file) {
      return res.status(400).json(
        new ApiResponse(400, null, "Profile picture file is required")
      );
    }
    
    const profilePictureUrl = await userService.uploadProfilePicture(userId, req.file, userType);
    
    return res.status(200).json(
      new ApiResponse(200, { profilePictureUrl }, "Profile picture uploaded successfully")
    );
  } catch (error) {
    console.error("Upload profile picture error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to upload profile picture";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Delete user account
 * @route DELETE /api/v1/users/player/account | /api/v1/users/organizer/account
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userType = req.userType || req.user.userType;
    const { password } = req.body;
    
    // For password-based authentications, we should validate the password before deletion
    // For OTP-based authentications, we could skip this or implement a different verification method
    if (req.user.password && !password) {
      return res.status(400).json(
        new ApiResponse(400, null, "Password is required to delete account")
      );
    }
    
    await userService.deleteAccount(userId, password, userType);
    
    return res.status(200).json(
      new ApiResponse(200, {}, "Account deleted successfully")
    );
  } catch (error) {
    console.error("Delete account error:", error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to delete account";
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
}; 