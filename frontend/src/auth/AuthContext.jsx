import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user/token on initial load
    const storedUser = localStorage.getItem('clinerva_user');
    const storedToken = localStorage.getItem('clinerva_token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Optional: Set default auth header for Axios if you plan to use it globally
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Use local dev server URL. In production, proxy or use ENV vars
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { user, token } = res.data;
        setUser(user);
        localStorage.setItem('clinerva_user', JSON.stringify(user));
        localStorage.setItem('clinerva_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true, role: user.role };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error("Login Context Error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed due to server error' 
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      
      if (res.data.success) {
        const { user, token } = res.data;
        setUser(user);
        localStorage.setItem('clinerva_user', JSON.stringify(user));
        localStorage.setItem('clinerva_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true, role: user.role };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      console.error("Register Context Error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed due to server error' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinerva_user');
    localStorage.removeItem('clinerva_token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
