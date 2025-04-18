import axios from 'axios';
import { API_URL, DEFAULT_TIMEOUT } from '../config/constants';

/**
 * Service for handling user-related operations
 * This includes profile management, preferences, and other user data operations
 * Supports both player and organizer user types
 */
class UserService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: DEFAULT_TIMEOUT,
    });
  }

  /**
   * Set the authentication token for API requests
   * @param {string} token - JWT authentication token
   */
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get the current user's profile data
   * @param {string} userType - The type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - User profile data
   * @throws {Error} If the request fails
   */
  async getUserProfile(userType = 'player') {
    try {
      const endpoint = userType === 'organizer' ? '/users/organizer/profile' : '/users/player/profile';
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        throw new Error(
          error.response.data.message || 'Failed to fetch user profile'
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Update the user's profile information
   * @param {Object} profileData - Updated user profile data
   * @param {string} userType - The type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Updated user data
   * @throws {Error} If the update fails
   */
  async updateProfile(profileData, userType = 'player') {
    try {
      const endpoint = userType === 'organizer' ? '/users/organizer/profile' : '/users/player/profile';
      const response = await this.client.put(endpoint, profileData);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        throw new Error(
          error.response.data.message || 'Failed to update profile'
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Update user's profile picture
   * @param {File} imageFile - The image file to upload
   * @param {string} userType - The type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Updated user data with new image URL
   * @throws {Error} If the upload fails
   */
  async updateProfilePicture(imageFile, userType = 'player') {
    try {
      const endpoint = userType === 'organizer' ? '/users/organizer/profile/image' : '/users/player/profile/image';
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await this.client.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        throw new Error(
          error.response.data.message || 'Failed to update profile picture'
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Update user account settings
   * @param {Object} settings - Updated account settings
   * @param {string} userType - The type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Updated settings data
   * @throws {Error} If the update fails
   */
  async updateAccountSettings(settings, userType = 'player') {
    try {
      const endpoint = userType === 'organizer' ? '/users/organizer/settings' : '/users/player/settings';
      const response = await this.client.put(endpoint, settings);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        throw new Error(
          error.response.data.message || 'Failed to update account settings'
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Change user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} userType - The type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Response with success message
   * @throws {Error} If the password change fails
   */
  async changePassword(currentPassword, newPassword, userType = 'player') {
    try {
      const endpoint = userType === 'organizer' ? '/users/organizer/password' : '/users/player/password';
      const response = await this.client.put(endpoint, { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        throw new Error(
          error.response.data.message || 'Failed to change password'
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Delete user account
   * @param {string} password - User's current password for verification
   * @param {string} userType - The type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Response with success message
   * @throws {Error} If the account deletion fails
   */
  async deleteAccount(password, userType = 'player') {
    try {
      const endpoint = userType === 'organizer' ? '/users/organizer/account' : '/users/player/account';
      const response = await this.client.delete(endpoint, {
        data: { password }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        throw new Error(
          error.response.data.message || 'Failed to delete account'
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Player-specific: Update in-game username (IGN)
   * @param {string} username - New in-game username
   * @returns {Promise<Object>} - Updated player data
   * @throws {Error} If the update fails
   */
  async updatePlayerUsername(username) {
    try {
      const response = await this.client.put('/users/player/username', { username });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || 'Failed to update username'
        );
      } else if (error.request) {
        throw new Error('No response received from server. Please try again later.');
      } else {
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Player-specific: Update FreeFire UID
   * @param {string} uid - New FreeFire UID
   * @returns {Promise<Object>} - Updated player data
   * @throws {Error} If the update fails
   */
  async updatePlayerUID(uid) {
    try {
      const response = await this.client.put('/users/player/uid', { uid });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || 'Failed to update FreeFire UID'
        );
      } else if (error.request) {
        throw new Error('No response received from server. Please try again later.');
      } else {
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Organizer-specific: Update company information
   * @param {Object} companyData - Company information data
   * @returns {Promise<Object>} - Updated organizer data
   * @throws {Error} If the update fails
   */
  async updateCompanyInfo(companyData) {
    try {
      const response = await this.client.put('/users/organizer/company', companyData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || 'Failed to update company information'
        );
      } else if (error.request) {
        throw new Error('No response received from server. Please try again later.');
      } else {
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Organizer-specific: Update UPI ID
   * @param {string} upiId - New UPI ID
   * @returns {Promise<Object>} - Updated organizer data
   * @throws {Error} If the update fails
   */
  async updateUpiId(upiId) {
    try {
      const response = await this.client.put('/users/organizer/upi', { upiId });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || 'Failed to update UPI ID'
        );
      } else if (error.request) {
        throw new Error('No response received from server. Please try again later.');
      } else {
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }

  /**
   * Organizer-specific: Upload verification document
   * @param {File} file - Document file
   * @param {string} documentName - Name/type of the document
   * @returns {Promise<Object>} - Document upload status
   * @throws {Error} If the upload fails
   */
  async uploadVerificationDocument(file, documentName) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('name', documentName);

      const response = await this.client.post('/users/organizer/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.message || 'Failed to upload document'
        );
      } else if (error.request) {
        throw new Error('No response received from server. Please try again later.');
      } else {
        throw new Error('Error setting up request. Please try again.');
      }
    }
  }
}

// Create a singleton instance
const userService = new UserService();

export default userService; 