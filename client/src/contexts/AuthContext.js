import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API base URL - replace with your server URL
const API_URL = 'http://10.0.2.2:8000/api/v1';

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
            const response = await axios.post(`${API_URL}/auth/refresh-token`, {
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
              logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // If refresh fails, logout
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
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
          await axios.post(`${API_URL}/auth/logout`, {
            refreshToken,
          });
        } catch (error) {
          console.log('Logout API error:', error);
        }
      }
      
      // Clear storage and state regardless of API call success
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      
      setUserToken(null);
      setRefreshToken(null);
      setUserData(null);
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