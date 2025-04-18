import { Player } from '../models/player.model.js';
import { Organizer } from '../models/organizer.model.js';
import fs from 'fs';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

class UserService {
  /**
   * Get user model based on user type
   * @param {string} userType - 'player' or 'organizer'
   * @returns {Model} Mongoose model
   */
  getUserModel(userType) {
    if (userType === 'organizer') {
      return Organizer;
    }
    return Player; // Default to Player model
  }

  /**
   * Get user profile data
   * @param {string} userId - User ID
   * @param {string} userType - 'player' or 'organizer'
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId, userType) {
    try {
      const UserModel = this.getUserModel(userType);
      
      const user = await UserModel.findById(userId).select('-password -refreshToken -otp -otpExpiry');
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error fetching user profile: " + error.message);
    }
  }

  /**
   * Update user profile information
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @param {string} userType - 'player' or 'organizer'
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserProfile(userId, updateData, userType) {
    try {
      const UserModel = this.getUserModel(userType);
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      // Update user fields based on user type
      if (userType === 'player') {
        // For players, we allow updating these fields
        if (updateData.name) user.name = updateData.name;
        if (updateData.username) user.username = updateData.username;
        if (updateData.uid) user.uid = updateData.uid;
        if (updateData.mobileNumber) user.mobileNumber = updateData.mobileNumber;
      } else if (userType === 'organizer') {
        // For organizers, we allow updating these fields
        if (updateData.name) user.name = updateData.name;
        if (updateData.phoneNumber) user.phoneNumber = updateData.phoneNumber;
        if (updateData.companyName) user.companyName = updateData.companyName;
        if (updateData.companyWebsite) user.companyWebsite = updateData.companyWebsite;
        if (updateData.companyAddress) user.companyAddress = updateData.companyAddress;
        if (updateData.upiId) user.upiId = updateData.upiId;
      }
      
      await user.save();
      
      // Return user data without sensitive information
      const updatedUser = await UserModel.findById(userId).select('-password -refreshToken -otp -otpExpiry');
      
      return updatedUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error updating user profile: " + error.message);
    }
  }

  /**
   * Update account settings
   * @param {string} userId - User ID
   * @param {Object} settingsData - Settings data to update
   * @param {string} userType - 'player' or 'organizer'
   * @returns {Promise<Object>} Updated settings data
   */
  async updateAccountSettings(userId, settingsData, userType) {
    try {
      const UserModel = this.getUserModel(userType);
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      // Update settings based on the provided data
      // This can be customized based on the specific settings for your application
      
      // Example of settings that could be updated
      // For now, we'll just return a success message
      
      return { success: true, message: "Settings updated successfully" };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error updating account settings: " + error.message);
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} userType - 'player' or 'organizer'
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword, userType) {
    try {
      const UserModel = this.getUserModel(userType);
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      // Check if the user has a password (they might be using passwordless auth)
      if (!user.password) {
        throw new ApiError(400, "Password change not supported for this account. This account uses passwordless authentication.");
      }
      
      // Verify current password
      const isPasswordValid = await user.isPasswordCorrect(currentPassword);
      
      if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error changing password: " + error.message);
    }
  }

  /**
   * Upload and update user profile picture
   * @param {string} userId - User ID
   * @param {Object} file - Uploaded file object
   * @param {string} userType - 'player' or 'organizer'
   * @returns {Promise<string>} Profile picture URL
   */
  async uploadProfilePicture(userId, file, userType) {
    try {
      const UserModel = this.getUserModel(userType);
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      // In a real implementation, you'd upload the file to a storage service
      // For now, we'll simulate the process and return a URL
      
      // Example implementation with local file storage
      // const fileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
      // const uploadPath = path.join(__dirname, '../../public/uploads/', fileName);
      
      // Store file on disk
      // await fs.promises.writeFile(uploadPath, file.buffer);
      
      // Update user profile picture field
      // const profilePictureUrl = `/uploads/${fileName}`;
      // user.profilePicture = profilePictureUrl;
      // await user.save();
      
      // Simulate successful upload with a placeholder URL
      const profilePictureUrl = `https://example.com/uploads/${userId}-profile.jpg`;
      user.profilePicture = profilePictureUrl;
      await user.save();
      
      return profilePictureUrl;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error uploading profile picture: " + error.message);
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @param {string} password - User password for verification (can be null for passwordless auth)
   * @param {string} userType - 'player' or 'organizer'
   * @returns {Promise<void>}
   */
  async deleteAccount(userId, password, userType) {
    try {
      const UserModel = this.getUserModel(userType);
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      
      // If the user has a password, verify it before deletion
      if (user.password && password) {
        const isPasswordValid = await user.isPasswordCorrect(password);
        
        if (!isPasswordValid) {
          throw new ApiError(401, "Password is incorrect");
        }
      }
      
      // Delete the user account
      await UserModel.findByIdAndDelete(userId);
      
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error deleting account: " + error.message);
    }
  }
}

// Create a singleton instance
const userService = new UserService();

export default userService; 