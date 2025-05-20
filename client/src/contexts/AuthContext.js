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

  // Initialize axios with auth headers
  const setupAxiosInterceptors = (token) => {
    // Request interceptor for API calls
    axios.interceptors.request.use(
      async (config) => {
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (error) => {
        Promise.reject(error);
      }
    );

    // Response interceptor for API calls
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const response = await axios.post(`${API_URL}${AUTH_ROUTES.REFRESH_TOKEN}`, {
              refreshToken,
            });
            
            if (response.data.success) {
              // Update tokens
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
              
              // Store new tokens securely
              await storeAuthTokens(newAccessToken, newRefreshToken);
              
              // Update state
              setUserToken(newAccessToken);
              setRefreshToken(newRefreshToken);
              
              // Update Authorization header
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              
              // Retry original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axios(originalRequest);
            } else {
              // If refresh fails, logout
              await clearAuthData();
              return Promise.reject(error);
            }
          } catch (refreshError) {
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
    setIsLoading(true);
    setAuthError(null);
    try {
      let formData;
      let headers;
      
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
      
      // Send registration request
      const response = await axios.post(
        `${API_URL}${AUTH_ROUTES.PLAYER_AUTH}`, 
        profileImage ? formData : userData,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.log('Registration error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email, otp, rememberMe = true) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}${AUTH_ROUTES.VERIFY_OTP}`, {
        email,
        otp
      });
      
      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
        console.log("OTP verification successful - user data:", user);
        
        // Store tokens and update state
        await login(accessToken, newRefreshToken, user, rememberMe);
        
        // Additional check to ensure userToken is set
        if (!userToken) {
          setUserToken(accessToken);
        }
        
        return { success: true, user };
      }
      return { success: false, message: 'Verification failed' };
    } catch (error) {
      console.log('OTP verification error:', error.response?.data || error.message);
      setAuthError(error.response?.data?.message || 'OTP verification failed');
      return { success: false, message: error.response?.data?.message || 'OTP verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await axios.post(`${API_URL}${AUTH_ROUTES.RESEND_OTP}`, { email });
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
      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
        console.log("Login successful - user data:", user);
        
        // First update the state directly for immediate effect
        setUserToken(accessToken);
        setRefreshToken(newRefreshToken);
        setUserData(user);
        
        // Setup axios interceptors
        setupAxiosInterceptors(accessToken);
        
        // Then store data in the background
        setTimeout(async () => {
          try {
            await storeAuthTokens(accessToken, newRefreshToken, rememberMe);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            console.log("Auth data stored successfully");
          } catch (storageError) {
            console.error('Error storing auth data:', storageError);
          }
        }, 0);
        
        return { success: true, user };
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
            `${API_URL}${AUTH_ROUTES.LOGOUT}`, 
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
      
      const userData = await AsyncStorage.getItem('user');
      
      if (accessToken) {
        // Set tokens and user data
        setUserToken(accessToken);
        setRefreshToken(refreshTokenValue);
        
        if (userData) {
          setUserData(JSON.parse(userData));
        }
        
        // Setup axios interceptors
        setupAxiosInterceptors(accessToken);
        
        // Optionally, verify token with server
        await checkCurrentUser();
      }
    } catch (error) {
      console.log('isLoggedIn error:', error);
      await clearAuthData(); // Clear on error
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on app load
  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userData,
        authError,
        login,
        loginWithPassword,
        registerWithOtp,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        logout,
        isLoggedIn,
        checkCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;