import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // State to track the email during two-factor authentication
  const [pendingLoginEmail, setPendingLoginEmail] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      const adminToken = localStorage.getItem('admin-token');
      const adminData = localStorage.getItem('admin-data');
      const organizerToken = localStorage.getItem('organizer-token');
      
      if (adminToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
          // Parse saved admin data if available
          const userData = adminData ? JSON.parse(adminData) : { type: 'admin' };
          setUser({ ...userData, token: adminToken });
        } catch (error) {
          console.error('Admin token verification failed:', error);
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-data');
        }
      } else if (organizerToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${organizerToken}`;
          setUser({ type: 'organizer', token: organizerToken });
        } catch (error) {
          console.error('Organizer token verification failed:', error);
          localStorage.removeItem('organizer-token');
        }
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login for admin
  const loginAdmin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { 
        email, 
        password 
      });
      
      const { accessToken, admin } = response.data.data;
      
      // Store admin details with role information
      const adminData = {
        type: 'admin',
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role // This stores whether it's 'admin' or 'super-admin'
      };
      
      localStorage.setItem('admin-token', accessToken);
      localStorage.setItem('admin-data', JSON.stringify(adminData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser({ ...adminData, token: accessToken });
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  // Step 1 of organizer login: verify password and request OTP
  const initiateOrganizerLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/organizer-auth/login`, { 
        email, 
        password 
      });
      
      // If we get a success response without a token, it means OTP was sent
      if (response.data.success && !response.data.data.accessToken) {
        setPendingLoginEmail(email);
        setOtpSent(true);
        return { otpSent: true, message: response.data.message };
      }

      // If we get here, login flow has changed on the backend
      throw new Error('Unexpected response from server');
    } catch (error) {
      console.error('Organizer login initiation failed:', error);
      throw error;
    }
  };

  // Request a new OTP
  const requestLoginOTP = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/organizer-auth/send-login-otp`, { email });
      
      if (response.data.success) {
        setPendingLoginEmail(email);
        setOtpSent(true);
        return { otpSent: true, message: response.data.message };
      }

      throw new Error('Failed to send OTP');
    } catch (error) {
      console.error('OTP request failed:', error);
      throw error;
    }
  };

  // Step 2 of organizer login: verify OTP and complete login
  const completeOrganizerLogin = async (email, password, otp) => {
    try {
      const response = await axios.post(`${API_URL}/organizer-auth/login`, { 
        email, 
        password,
        otp
      });
      
      const { accessToken } = response.data.data;
      localStorage.setItem('organizer-token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser({ type: 'organizer', token: accessToken });
      
      // Clear the pending login state
      setPendingLoginEmail(null);
      setOtpSent(false);
      
      return response.data;
    } catch (error) {
      console.error('Organizer login completion failed:', error);
      throw error;
    }
  };

  // Legacy login for organizer (keeping for backward compatibility)
  const loginOrganizer = async (email, password, otp) => {
    if (!otp) {
      return initiateOrganizerLogin(email, password);
    } else {
      return completeOrganizerLogin(email, password, otp);
    }
  };

  // Request password reset by sending OTP
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/organizer-auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  };

  // Reset password with OTP
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/organizer-auth/reset-password`, { 
        email,
        otp, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (user?.type === 'admin') {
        await axios.post(`${API_URL}/admin/logout`);
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-data');
      } else if (user?.type === 'organizer') {
        await axios.post(`${API_URL}/organizer-auth/logout`);
        localStorage.removeItem('organizer-token');
      }
      
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    loginAdmin,
    loginOrganizer,
    initiateOrganizerLogin,
    completeOrganizerLogin,
    requestLoginOTP,
    forgotPassword,
    resetPassword,
    logout,
    pendingLoginEmail,
    otpSent,
    isAuthenticated: !!user,
    isAdmin: user?.type === 'admin',
    isOrganizer: user?.type === 'organizer'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};