import axios from 'axios';
import { API_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY, AUTH_ROUTES } from '../config/constants';

/**
 * Auth Service - Handles authentication related API calls
 * Implements passwordless OTP-based authentication for both player and organizer user types
 * Includes methods for persistent authentication
 */
class AuthService {
  /**
   * Register a new player
   * 
   * @param {Object} userData - Player registration data
   * @param {string} userData.name - Player's name
   * @param {string} userData.username - Player's in-game name
   * @param {string} userData.uid - Player's FreeFire UID
   * @param {string} userData.email - Player's email
   * @param {string} userData.password - Player's password
   * @param {string} [userData.mobileNumber] - Player's mobile number (optional)
   * @returns {Promise<Object>} - Promise with registration result or error
   */
  async registerPlayer(userData) {
    try {
      const response = await axios.post(`${API_URL}${AUTH_ROUTES.PLAYER_AUTH}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a new organizer
   * 
   * @param {Object} userData - Organizer registration data
   * @param {string} userData.name - Organizer's name
   * @param {string} userData.email - Organizer's email
   * @param {string} userData.phoneNumber - Organizer's phone number
   * @param {string} userData.companyName - Organizer's company name
   * @param {string} userData.upiId - Organizer's UPI ID for payments
   * @param {string} userData.password - Organizer's password
   * @returns {Promise<Object>} - Promise with registration result or error
   */
  async registerOrganizer(userData) {
    try {
      const response = await axios.post(`${API_URL}${AUTH_ROUTES.ORGANIZER_AUTH}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a new user (generic method)
   * 
   * @param {Object} userData - User registration data
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @param {Object} [profileImage] - User profile image (optional)
   * @returns {Promise<Object>} - Promise with user data or error
   */
  async register(userData, userType = 'player', profileImage = null) {
    try {
      // Create FormData for multipart/form-data request if profileImage is provided
      if (profileImage) {
        const formData = new FormData();
        
        // Add user data to formData
        Object.keys(userData).forEach(key => {
          formData.append(key, userData[key]);
        });
        
        // Add user type
        formData.append('userType', userType);
        
        // Add profile image
        const imageUri = profileImage.uri;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('profileImage', {
          uri: imageUri,
          name: filename,
          type,
        });
        
        const response = await axios.post(`${API_URL}${AUTH_ROUTES.INITIATE_OTP}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Regular JSON request without profile image
        const response = await axios.post(`${API_URL}${AUTH_ROUTES.INITIATE_OTP}`, {
          ...userData,
          userType
        });
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Initiate OTP authentication for players
   * 
   * @param {string} email - Player's email
   * @param {Object} [data] - Optional data for registration (name, mobile, etc.)
   * @param {Object} [profileImage] - Player's profile image (optional)
   * @returns {Promise<Object>} - Promise with authentication initiation result
   */
  async initiatePlayerAuth(email, data = {}, profileImage = null) {
    const userData = {
      email,
      ...data
    };
    return this.initiateOtpAuth(userData, 'player', profileImage);
  }

  /**
   * Initiate OTP authentication for organizers
   * 
   * @param {string} email - Organizer's email
   * @param {Object} data - Mandatory data for registration (name, phone, company)
   * @param {Object} [profileImage] - Organizer's profile image (optional)
   * @returns {Promise<Object>} - Promise with authentication initiation result
   */
  async initiateOrganizerAuth(email, data = {}, profileImage = null) {
    const userData = {
      email,
      ...data
    };
    return this.initiateOtpAuth(userData, 'organizer', profileImage);
  }

  /**
   * Generic method to initiate OTP-based authentication for any user type
   * Enhanced to check if a user exists and provide appropriate response for login attempts
   * 
   * @param {Object} userData - User data
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @param {Object} [profileImage] - User profile image (optional)
   * @returns {Promise<Object>} - Promise with authentication initiation result
   */
  async initiateOtpAuth(userData, userType = 'player', profileImage = null) {
    try {
      // Check if this is a minimal login attempt (only email provided)
      const isLoginAttempt = Object.keys(userData).length === 1 && userData.email;
      
      // Create FormData for multipart/form-data request if profileImage is provided
      if (profileImage) {
        const formData = new FormData();
        
        // Add user data to formData
        Object.keys(userData).forEach(key => {
          formData.append(key, userData[key]);
        });
        
        // Add user type
        formData.append('userType', userType);
        
        // Add profile image
        const imageUri = profileImage.uri;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('profileImage', {
          uri: imageUri,
          name: filename,
          type,
        });
        
        const response = await axios.post(`${API_URL}${AUTH_ROUTES.INITIATE_OTP}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // If user doesn't exist and this was a login attempt, provide appropriate message
        if (response.data.data && response.data.data.isNewUser && isLoginAttempt) {
          return {
            ...response.data,
            message: "Account not found. Please complete registration.",
            requiresRegistration: true
          };
        }
        
        return response.data;
      } else {
        // Regular JSON request without profile image
        const response = await axios.post(`${API_URL}${AUTH_ROUTES.INITIATE_OTP}`, {
          ...userData,
          userType
        });
        
        // If user doesn't exist and this was a login attempt, provide appropriate message
        if (response.data.data && response.data.data.isNewUser && isLoginAttempt) {
          return {
            ...response.data,
            message: "Account not found. Please complete registration.",
            requiresRegistration: true
          };
        }
        
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP to complete authentication
   * 
   * @param {string} email - User's email
   * @param {string} otp - One-time password
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @param {boolean} rememberMe - Whether to store auth data for persistent login
   * @returns {Promise<Object>} - Promise with user data and tokens
   */
  async verifyOtp(email, otp, userType = 'player', rememberMe = true) {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
        userType
      });

      // If successful and rememberMe is true, store auth data
      if (response.data.success && rememberMe) {
        await this.storeAuthData(response.data.data);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend OTP code
   * @param {string} email - User email
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - API response
   */
  async resendOtp(email, userType = 'player') {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, { 
        email,
        userType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login player with credentials
   * 
   * @param {string} email - Player's email
   * @param {string} password - Player's password
   * @returns {Promise<Object>} - Promise with player data and token or error
   */
  async loginPlayer(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/player/login`, { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login organizer with credentials
   * 
   * @param {string} email - Organizer's email
   * @param {string} password - Organizer's password
   * @returns {Promise<Object>} - Promise with organizer data and token or error
   */
  async loginOrganizer(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/organizer/login`, { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user with credentials (generic method)
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Promise with user data and token or error
   */
  async login(email, password, userType = 'player') {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password,
        userType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   * @param {string} token - Authentication token (if not provided, uses stored token)
   * @returns {Promise<Object>} - API response
   */
  async logout(token = null) {
    try {
      // If no token provided, try to get from storage
      if (!token) {
        const authData = await this.getStoredAuthData();
        token = authData?.accessToken;
      }

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${API_URL}/auth/logout`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Clear stored auth data
      await this.clearAuthData();
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   * 
   * @param {string} email - User's email
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Promise with reset request result or error
   */
  async requestPasswordReset(email, userType = 'player') {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password-request`, { 
        email,
        userType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   * 
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - Promise with reset result or error
   */
  async resetPassword(token, newPassword, userType = 'player') {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
        userType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user auth token is valid
   * @param {string} token - Authentication token (if not provided, uses stored token)
   * @param {string} userType - Type of user ('player' or 'organizer')
   * @returns {Promise<Object>} - API response with user data
   */
  async checkAuth(token = null, userType = null) {
    try {
      // If no token provided, try to get from storage
      if (!token) {
        const authData = await this.getStoredAuthData();
        token = authData?.accessToken;
        
        // If user type not provided, get from stored user data
        if (!userType && authData?.user) {
          userType = authData.user.userType;
        }
      }

      if (!token) {
        throw new Error("No authentication token available");
      }

      userType = userType || 'player';
      const endpoint = userType === 'organizer' 
        ? `${API_URL}/auth/organizer/check-auth` 
        : `${API_URL}/auth/player/check-auth`;
        
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      // Clear auth data if authentication fails
      if (error.response && error.response.status === 401) {
        await this.clearAuthData();
      }
      throw this.handleError(error);
    }
  }

  /**
   * Store authentication data for persistent login
   * @param {Object} authData - Authentication data from server
   * @param {string} authData.accessToken - JWT access token
   * @param {string} authData.refreshToken - JWT refresh token
   * @param {Object} authData.user - User data
   * @returns {Promise<boolean>} - Success status
   */
  async storeAuthData(authData) {
    try {
      if (typeof localStorage !== 'undefined') {
        // Browser environment
        localStorage.setItem(TOKEN_KEY, authData.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
      } else {
        // React Native environment
        const AsyncStorage = await import('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(TOKEN_KEY, authData.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
      }
      return true;
    } catch (error) {
      console.error('Error storing auth data:', error);
      return false;
    }
  }

  /**
   * Retrieve stored authentication data
   * @returns {Promise<Object|null>} - Authentication data or null if not found
   */
  async getStoredAuthData() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Browser environment
        const token = localStorage.getItem(TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const userDataStr = localStorage.getItem(USER_DATA_KEY);
        
        if (token && userDataStr) {
          return {
            accessToken: token,
            refreshToken,
            user: JSON.parse(userDataStr)
          };
        }
      } else {
        // React Native environment
        const AsyncStorage = await import('@react-native-async-storage/async-storage').default;
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        const userDataStr = await AsyncStorage.getItem(USER_DATA_KEY);
        
        if (token && userDataStr) {
          return {
            accessToken: token,
            refreshToken,
            user: JSON.parse(userDataStr)
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      return null;
    }
  }

  /**
   * Clear stored authentication data (logout)
   * @returns {Promise<boolean>} - Success status
   */
  async clearAuthData() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Browser environment
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
      } else {
        // React Native environment
        const AsyncStorage = await import('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_DATA_KEY);
      }
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<Object>} - New tokens
   */
  async refreshToken() {
    try {
      const authData = await this.getStoredAuthData();
      if (!authData || !authData.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken: authData.refreshToken
      });

      if (response.data.success) {
        // Update stored tokens
        await this.storeAuthData({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          user: authData.user
        });
      }

      return response.data;
    } catch (error) {
      // If refresh token is invalid, clear auth data
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.clearAuthData();
      }
      throw this.handleError(error);
    }
  }

  /**
   * Set up axios interceptor to handle token refresh
   */
  setupAxiosInterceptors() {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is due to an expired token and we haven't tried to refresh yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const refreshResponse = await this.refreshToken();
            
            if (refreshResponse.success) {
              // Update the authorization header
              axios.defaults.headers.common['Authorization'] = 'Bearer ' + refreshResponse.data.accessToken;
              originalRequest.headers['Authorization'] = 'Bearer ' + refreshResponse.data.accessToken;
              
              // Retry the original request
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear auth and redirect to login
            await this.clearAuthData();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Update profile icon
   * 
   * @param {Object} profileImage - Profile image object with uri property
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} - Promise with updated user data
   */
  async updateProfileIcon(profileImage, token = null) {
    try {
      // If no token provided, try to get from storage
      if (!token) {
        const authData = await this.getStoredAuthData();
        token = authData?.accessToken;
      }

      if (!token) {
        throw new Error("No authentication token available");
      }

      if (!profileImage) {
        throw new Error("Profile image is required");
      }

      // Create FormData for image upload
      const formData = new FormData();
      
      // Add profile image
      const imageUri = profileImage.uri;
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      
      formData.append('profilePicture', {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await axios.put(
        `${API_URL}${AUTH_ROUTES.PROFILE_ICON_UPDATE}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update stored user data with new profile picture
      if (response.data.success) {
        const authData = await this.getStoredAuthData();
        if (authData && authData.user) {
          authData.user.profilePicture = response.data.data.profilePicture;
          await this.storeAuthData(authData);
        }
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} - Error with formatted message
   */
  handleError(error) {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // The request was made and the server responded with an error status
      const { data } = error.response;
      
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || errorMessage;
    }
    
    const customError = new Error(errorMessage);
    customError.originalError = error;
    return customError;
  }
}

// Create a singleton instance
const authService = new AuthService();

// Set up interceptors for token refresh
authService.setupAxiosInterceptors();

export default authService;