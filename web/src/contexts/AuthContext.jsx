import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      const adminToken = localStorage.getItem('admin-token');
      const organizerToken = localStorage.getItem('organizer-token');
      
      if (adminToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
          // We don't need to make an actual API call here, just set the user
          setUser({ type: 'admin', token: adminToken });
        } catch (error) {
          console.error('Admin token verification failed:', error);
          localStorage.removeItem('admin-token');
        }
      } else if (organizerToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${organizerToken}`;
          // We don't need to make an actual API call here, just set the user
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
      
      const { accessToken } = response.data.data;
      localStorage.setItem('admin-token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser({ type: 'admin', token: accessToken });
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  // Login for organizer
  const loginOrganizer = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/organizer-auth/login`, { 
        email, 
        password 
      });
      
      const { accessToken } = response.data.data;
      localStorage.setItem('organizer-token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser({ type: 'organizer', token: accessToken });
      return response.data;
    } catch (error) {
      console.error('Organizer login failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (user?.type === 'admin') {
        await axios.post(`${API_URL}/admin/logout`);
        localStorage.removeItem('admin-token');
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
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.type === 'admin',
    isOrganizer: user?.type === 'organizer'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};