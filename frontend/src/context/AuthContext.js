import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Set base URL: use Render in production, localhost in development
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Google user first
    const googleUser = localStorage.getItem('googleUser');
    if (googleUser) {
      setUser(JSON.parse(googleUser));
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('googleUser');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Called after Google Sign-In success
  const setGoogleUser = (googleUserData) => {
    localStorage.setItem('googleUser', JSON.stringify(googleUserData));
    setUser(googleUserData);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setGoogleUser }}>
      {children}
    </AuthContext.Provider>
  );
};
