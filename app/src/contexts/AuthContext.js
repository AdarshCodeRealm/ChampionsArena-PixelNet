import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, AUTH_ROUTES, USER_ROUTES } from '../config/constants';
import * as SecureStore from 'expo-secure-store';

// Create context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // useEffect to check auth status on mount - only once
  useEffect(() => {
    if (!isInitialized) {
      isLoggedIn();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Initialize axios with auth headers
  const setupAxiosInterceptors = (token) => {
    // Clear any existing interceptors to avoid duplicates
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();

    // Request interceptor for API calls
    axios.interceptors.request.use(
      async (config) => {
        // Don't add auth headers for registration and OTP verification endpoints
        const isPublicEndpoint = config.url?.includes('/player-auth/register') || 
                                config.url?.includes('/player-auth/login') || 
                                config.url?.includes('/player-auth/verify-email') ||
                                config.url?.includes('/player-auth/resend-otp') ||
                                config.url?.includes('/player-auth/forgot-password') ||
                                config.url?.includes('/player-auth/reset-password') ||
                                config.url?.includes('/player-auth/refresh-token') ||
                                config.url?.includes('/auth/verify-otp') || 
                                config.url?.includes('/auth/resend-otp') ||
                                config.url?.includes('/auth/initiate-otp') ||
                                config.url?.includes('/auth/forgot-password') ||
                                config.url?.includes('/auth/reset-password') ||
                                config.url?.includes('/refresh-token') ||
                                // Add organizer public endpoints too
                                config.url?.includes('/organizer-auth/register') ||
                                config.url?.includes('/organizer-auth/login') ||
                                config.url?.includes('/organizer-auth/verify-otp') ||
                                // Add public tournament endpoints
                                config.url?.includes('/tournaments') && config.method?.toLowerCase() === 'get';
        
        console.log('Request interceptor - URL:', config.url, 'Is Public:', isPublicEndpoint);
        
        if (token && !isPublicEndpoint) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for API calls
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Only try to refresh token for protected endpoints that require authentication
        const isPublicEndpoint = originalRequest.url?.includes('/player-auth/register') || 
                                originalRequest.url?.includes('/player-auth/login') || 
                                originalRequest.url?.includes('/player-auth/verify-email') ||
                                originalRequest.url?.includes('/player-auth/resend-otp') ||
                                originalRequest.url?.includes('/player-auth/forgot-password') ||
                                originalRequest.url?.includes('/player-auth/reset-password') ||
                                originalRequest.url?.includes('/player-auth/refresh-token') ||
                                originalRequest.url?.includes('/auth/verify-otp') || 
                                originalRequest.url?.includes('/auth/resend-otp') ||
                                originalRequest.url?.includes('/auth/initiate-otp') ||
                                originalRequest.url?.includes('/auth/forgot-password') ||
                                originalRequest.url?.includes('/auth/reset-password') ||
                                originalRequest.url?.includes('/refresh-token') ||
                                // Add organizer public endpoints too
                                originalRequest.url?.includes('/organizer-auth/register') ||
                                originalRequest.url?.includes('/organizer-auth/login') ||
                                originalRequest.url?.includes('/organizer-auth/verify-otp') ||
                                // Add public tournament endpoints
                                originalRequest.url?.includes('/tournaments') && originalRequest.method?.toLowerCase() === 'get';
        
        console.log('Response interceptor - URL:', originalRequest.url, 'Is Public:', isPublicEndpoint);
        
        // If error is 401 and we haven't tried to refresh token yet and it's not a public endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint && refreshToken) {
          originalRequest._retry = true;
          
          try {
            console.log('Attempting token refresh...');
            // Try to refresh the token
            const response = await axios.post(`${API_URL}/player-auth/refresh-token`, {
              refreshToken,
            });
            
            if (response.data.success) {
              // Update tokens
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
              
              console.log('Token refresh successful');
              
              // Store new tokens securely
              await storeAuthTokens(newAccessToken, newRefreshToken);
              
              // Update state
              setUserToken(newAccessToken);
              setRefreshToken(newRefreshToken);
              
              // Update Authorization header for future requests
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              
              // Retry original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axios(originalRequest);
            } else {
              console.log('Token refresh failed - clearing auth data');
              // If refresh fails, logout
              await clearAuthData();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.log('Token refresh error:', refreshError);
            // If refresh fails, logout
            await clearAuthData();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  };

  // Store auth tokens securely
  const storeAuthTokens = async (accessToken, refreshTokenValue, rememberMe = true) => {
    try {
      if (rememberMe) {
        // Store in secure storage for persistent login
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshTokenValue);
      } else {
        // For session-only storage, use AsyncStorage (will be cleared when app is closed)
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshTokenValue);
      }
      return true;
    } catch (error) {
      console.error('Token storage error:', error);
      return false;
    }
  };

  // Helper function to clear auth data without API call
  const clearAuthData = async () => {
    try {
      // Clear both storage methods to ensure all tokens are removed
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      
      try {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      } catch (secureStoreError) {
        console.log('SecureStore clear error:', secureStoreError);
      }
      
      // Clear state
      setUserToken(null);
      setRefreshToken(null);
      setUserData(null);
      
      // Reset guest mode
      setIsGuestMode(false);
      
      return true;
    } catch (error) {
      console.log('Clear auth data error:', error);
      return false;
    }
  };

  const login = async (accessToken, refreshTokenValue, user, rememberMe = true) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Store tokens securely based on remember me choice
      await storeAuthTokens(accessToken, refreshTokenValue, rememberMe);
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Update state - Set these directly without any conditions
      setUserToken(accessToken);
      setRefreshToken(refreshTokenValue);
      setUserData(user);
      console.log("User data stored successfully:", userData);
      
      // Setup axios interceptors
      setupAxiosInterceptors(accessToken);

      console.log("Login function completed - userToken set to:", accessToken);
      return true;
    } catch (error) {
      console.log('Login error:', error);
      setAuthError('Failed to store authentication data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithOtp = async (userData, profileImage = null) => {
    console.log('Registration data:', userData);
    setIsLoading(true);
    setAuthError(null);
    try {
      let formData;
      let headers = {};
      
      if (profileImage) {
        // Set up form data for sending profile image
        formData = new FormData();
        Object.keys(userData).forEach(key => {
          formData.append(key, userData[key]);
        });
        
        // Append image as file
        const uriParts = profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('profilePicture', {
          uri: profileImage.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`
        });
        
        headers = { 'Content-Type': 'multipart/form-data' };
      }
      console.log('Form data prepared, sending registration request...');
      
      // Send registration request - NO AUTH TOKEN NEEDED for registration
      // Create a clean axios instance without interceptors for registration
      const cleanAxios = axios.create({
        timeout: 30000, // 30 second timeout
      });
      
      const response = await cleanAxios.post(
        `${API_URL}${AUTH_ROUTES.PLAYER_REGISTER}`, 
        profileImage ? formData : userData,
        { headers }
      );
      console.log('Registration response status:', response.status);
      console.log('Registration response data:', response.data);
      
      // Handle different response scenarios
      if (response.status === 202) {
        // New registration started - redirect to OTP
        return {
          success: true,
          requiresVerification: true,
          redirectToOtp: response.data.data.redirectToOtp,
          isExistingRegistration: false,
          email: response.data.data.email,
          message: response.data.data.message || response.data.message,
          expiresIn: response.data.data.expiresIn
        };
      } else if (response.status === 201) {
        // Registration completed with auto-login
        const { accessToken, refreshToken, player } = response.data.data;
        
        // Auto-login the user after successful registration
        await login(accessToken, refreshToken, player, true);
        
        return {
          success: true,
          requiresVerification: false,
          autoLogin: true,
          user: player,
          message: response.data.message
        };
      }
      
      return response.data;
    } catch (error) {
      console.log('Registration error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        
        // Check if it's an existing registration that needs verification
        if (errorData.data?.requiresVerification && errorData.data?.redirectToOtp) {
          return {
            success: true, // Change this to true so it's handled properly
            requiresVerification: true,
            redirectToOtp: true,
            isExistingRegistration: errorData.data.isExistingRegistration || true,
            email: errorData.data.email,
            message: errorData.data.message || errorData.message,
            expiresIn: errorData.data.expiresIn
          };
        }
        
        // Regular conflict error (email/username taken)
        setAuthError(errorData.message || 'Registration failed');
        throw error;
      }
      
      // Don't set auth error if it's just "No refresh token available" during registration
      if (!error.message?.includes('No refresh token available')) {
        setAuthError(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email, otp, rememberMe = true) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Use a clean axios instance for OTP verification to avoid interceptor issues
      const cleanAxios = axios.create({
        timeout: 30000,
      });
      
      // For registration OTP verification, send OTP in the registration endpoint
      const response = await cleanAxios.post(`${API_URL}/player-auth/register`, {
        email,
        otp
      });
      
      console.log('OTP verification response status:', response.status);
      console.log('OTP verification response data:', response.data);
      
      if (response.data.success) {
        // Check if this is a registration completion with auto-login (status 201)
        if (response.status === 201 && response.data.data.player && response.data.data.accessToken) {
          const { accessToken, refreshToken: newRefreshToken, player } = response.data.data;
          console.log("Registration OTP verification successful - auto login with player data:", player);
          
          // Auto-login the user after successful registration
          await login(accessToken, newRefreshToken, player, rememberMe);
          
          return { 
            success: true, 
            user: player,
            autoLogin: true,
            message: response.data.message 
          };
        }
        
        // Handle regular OTP verification (if using separate verify-email endpoint)
        if (response.data.data && response.data.data.verified) {
          return { 
            success: true, 
            verified: true,
            message: response.data.message 
          };
        }
        
        // Fallback for other OTP verification scenarios
        const { accessToken, refreshToken: newRefreshToken, user, player } = response.data.data || {};
        const userData = player || user; // Server may return either 'player' or 'user'
        
        if (accessToken && newRefreshToken && userData) {
          console.log("OTP verification successful - user data:", userData);
          
          // Store tokens and update state
          await login(accessToken, newRefreshToken, userData, rememberMe);
          
          return { success: true, user: userData };
        }
        
        return { success: true, message: response.data.message || 'Verification successful' };
      }
      return { success: false, message: response.data.message || 'Verification failed' };
    } catch (error) {
      console.log('OTP verification error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        setAuthError('Registration expired. Please start registration again.');
        return { 
          success: false, 
          expired: true,
          message: 'Registration expired. Please start registration again.' 
        };
      }
      
      setAuthError(error.response?.data?.message || 'OTP verification failed');
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email) => {
    try {
      // Use a clean axios instance for resend OTP to avoid interceptor issues
      const cleanAxios = axios.create({
        timeout: 30000,
      });
      
      const response = await cleanAxios.post(`${API_URL}/player-auth/resend-otp`, { email });
      return response.data;
    } catch (error) {
      console.log('Resend OTP error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'Failed to resend OTP');
      throw error;
    }
  };

  const loginWithPassword = async (email, password, rememberMe = true) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const response = await axios.post(`${API_URL}${AUTH_ROUTES.LOGIN}`, {
        email,
        password
      });
      console.log('Login response:', response);
      if (response.data.success) {
        // Extract player data from response - server returns it as "player" not "user"
        const { accessToken, refreshToken: newRefreshToken, player } = response.data.data;
        console.log("Login successful - player data:", player);
        
        // First update the state directly for immediate effect
        setUserToken(accessToken);
        setRefreshToken(newRefreshToken);
        
        // Use player data instead of user
        if (player) {
          setUserData(player);
        }
        
        // Setup axios interceptors
        setupAxiosInterceptors(accessToken);
        
        // Then store data in the background
        setTimeout(async () => {
          try {
            await storeAuthTokens(accessToken, newRefreshToken, rememberMe);
            
            // Store player data instead of user
            if (player) {
              await AsyncStorage.setItem('user', JSON.stringify(player));
              console.log("Player data stored successfully");
            } else {
              console.log("No player data available from login response, will fetch from server");
              // Fetch user data from server since it wasn't included in login response
              await checkCurrentUser();
            }
          } catch (storageError) {
            console.error('Error storing auth data:', storageError);
          }
        }, 0);
        
        return { success: true, user: player };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.log('Login error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}${AUTH_ROUTES.FORGOT_PASSWORD}`, { email });
      return response.data;
    } catch (error) {
      console.log('Forgot password error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'Failed to process password reset');
      throw error;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}${AUTH_ROUTES.RESET_PASSWORD}`, {
        email,
        otp,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.log('Reset password error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'Failed to reset password');
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(`${API_URL}${AUTH_ROUTES.CHANGE_PASSWORD}`, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.log('Change password error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'Failed to change password');
      throw error;
    }
  };

  const updateProfile = async (profileData, profileImage = null) => {
    try {
      let request;
      
      if (profileImage) {
        // Set up form data for sending profile image
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
          formData.append(key, profileData[key]);
        });
        
        // Append image as file
        const uriParts = profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('profilePicture', {
          uri: profileImage.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`
        });
        
        request = axios.put(`${API_URL}${AUTH_ROUTES.UPDATE_PROFILE}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${userToken}`
          }
        });
      } else {
        request = axios.put(`${API_URL}${AUTH_ROUTES.UPDATE_PROFILE}`, profileData, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
      }
      
      const response = await request;
      
      if (response.data.success) {
        // Update user data in storage and state
        const updatedUser = response.data.data;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
      
      return response.data;
    } catch (error) {
      console.log('Profile update error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout API if userToken exists
      if (userToken) {
        try {
          // Send the token in the Authorization header
          await axios.post(
            `${API_URL}/player-auth/logout`, 
            {}, // Empty body
            {
              headers: {
                Authorization: `Bearer ${userToken}`
              }
            }
          );
          console.log('Logout API call successful');
        } catch (error) {
          console.log('Logout API error:', error);
        }
      }
      
      // Clear storage and state regardless of API call success
      await clearAuthData();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    try {
      if (!userToken) return null;
      
      const response = await axios.get(`${API_URL}${AUTH_ROUTES.CURRENT_USER}`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      
      if (response.data.success) {
        // Update user data in storage and state
        const updatedUser = response.data.data;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        return updatedUser;
      }
      
      return null;
    } catch (error) {
      console.log('Get current user error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Token expired or invalid, clear auth
        await clearAuthData();
      }
      return null;
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      // Try first from secure storage (remember me)
      let accessToken, refreshTokenValue;
      
      try {
        accessToken = await SecureStore.getItemAsync('accessToken');
        refreshTokenValue = await SecureStore.getItemAsync('refreshToken');
      } catch (secureStoreError) {
        console.log('SecureStore get error:', secureStoreError);
      }
      
      // If not found in secure storage, try AsyncStorage (session)
      if (!accessToken) {
        accessToken = await AsyncStorage.getItem('accessToken');
        refreshTokenValue = await AsyncStorage.getItem('refreshToken');
      }
      
      const userDataStr = await AsyncStorage.getItem('user');
      
      if (accessToken) {
        // Set tokens and user data
        setUserToken(accessToken);
        setRefreshToken(refreshTokenValue);
        
        if (userDataStr) {
          try {
            const parsedUserData = JSON.parse(userDataStr);
            setUserData(parsedUserData);
            console.log('User data loaded from storage:', parsedUserData);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
          }
        } else {
          // If we have a token but no user data, fetch it from the server
          try {
            const currentUser = await checkCurrentUser();
            if (!currentUser) {
              // If we couldn't get the user data, clear auth
              console.log('No user data available, clearing auth');
              await clearAuthData();
            }
          } catch (fetchError) {
            console.error('Error fetching current user:', fetchError);
            await clearAuthData();
          }
        }
        
        // Setup axios interceptors
        setupAxiosInterceptors(accessToken);
      }
    } catch (error) {
      console.log('isLoggedIn error:', error);
      await clearAuthData(); // Clear on error
    } finally {
      setIsLoading(false);
    }
  };

  const skipLogin = async () => {
    setIsLoading(true);
    try {
      // Clear any existing auth data manually without affecting guest mode
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      
      try {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      } catch (secureStoreError) {
        console.log('SecureStore clear error:', secureStoreError);
      }
      
      // Clear auth tokens but keep guest mode
      setUserToken(null);
      setRefreshToken(null);
      
      // Create guest user data
      const guestUserData = {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'guest',
        isGuest: true,
      };
      
      // Store guest user data and set state
      await AsyncStorage.setItem('user', JSON.stringify(guestUserData));
      setUserData(guestUserData);
      
      // Set guest mode AFTER clearing other data
      setIsGuestMode(true);
      
      console.log('Skipped login, guest mode activated');
      return { success: true };
    } catch (error) {
      console.log('Skip login error:', error);
      setIsGuestMode(false); // Reset guest mode if error occurs
      return { success: false, message: error.message || 'Failed to skip login' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoading, 
      userToken, 
      userData, 
      refreshToken, 
      authError, 
      login, 
      registerWithOtp, 
      verifyOtp, 
      resendOtp, 
      loginWithPassword, 
      forgotPassword, 
      resetPassword, 
      changePassword, 
      updateProfile, 
      logout, 
      checkCurrentUser, 
      isLoggedIn,
      skipLogin,
      isGuestMode 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};