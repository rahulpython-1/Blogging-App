import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const API_URL = 'https://blogging-app-t2gn.onrender.com/api';

  // Configure axios defaults
  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = true;

  // Add token to requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put('/auth/profile', data);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPublisher: user?.role === 'publisher'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
