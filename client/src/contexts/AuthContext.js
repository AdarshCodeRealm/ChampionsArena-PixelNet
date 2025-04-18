import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, AUTH_ROUTES } from '../config/constants';

// Create context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

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
              
              // Store new tokens
              await AsyncStorage.setItem('accessToken', newAccessToken);
              await AsyncStorage.setItem('refreshToken', newRefreshToken);
              
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

  // Helper function to clear auth data without API call
  const clearAuthData = async () => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      
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

  const login = async (accessToken, refreshTokenValue, user) => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshTokenValue);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setUserToken(accessToken);
      setRefreshToken(refreshTokenValue);
      setUserData(user);
      
      // Setup axios interceptors
      setupAxiosInterceptors(accessToken);
    } catch (error) {
      console.log('Login error:', error);
    }
    setIsLoading(false);
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
    }
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      // Get tokens and user data
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshTokenValue = await AsyncStorage.getItem('refreshToken');
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
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log('isLoggedIn error:', error);
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
        login,
        logout,
        isLoggedIn,
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