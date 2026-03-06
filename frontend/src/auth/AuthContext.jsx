import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, uploadAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: restore session from localStorage ─────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('clinerva_user');
    const storedToken = localStorage.getItem('clinerva_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Helper: persist user state everywhere
  const persistUser = (userData) => {
    setUser(userData);
    localStorage.setItem('clinerva_user', JSON.stringify(userData));
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      if (res.data.success) {
        const { user: userData, token } = res.data;
        persistUser(userData);
        localStorage.setItem('clinerva_token', token);
        return { success: true, role: userData.role };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed due to server error',
      };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password, role) => {
    try {
      const res = await authAPI.register(name, email, password, role);
      if (res.data.success) {
        const { user: userData, token } = res.data;
        persistUser(userData);
        localStorage.setItem('clinerva_token', token);
        return { success: true, role: userData.role };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed due to server error',
      };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinerva_user');
    localStorage.removeItem('clinerva_token');
  };

  // ── Upload Profile Image (Cloudinary) ─────────────────────────────────────
  const uploadProfileImage = useCallback(async (file) => {
    try {
      const res = await uploadAPI.uploadProfileImage(file);
      if (res.data.success) {
        // Merge updated profileImage into current user state
        const updated = {
          ...user,
          profileImage: {
            url: res.data.data.url,
            publicId: res.data.data.publicId,
          },
        };
        persistUser(updated);
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data.message || 'Upload failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Image upload failed',
      };
    }
  }, [user]);

  // ── Delete Profile Image ──────────────────────────────────────────────────
  const deleteProfileImage = useCallback(async () => {
    try {
      const res = await uploadAPI.deleteProfileImage();
      if (res.data.success) {
        const updated = { ...user, profileImage: { url: null, publicId: null } };
        persistUser(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Delete failed',
      };
    }
  }, [user]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  /** Returns the best available avatar URL for the current user */
  const getAvatarUrl = useCallback((size = 'medium') => {
    if (user?.profileImage?.url) return user.profileImage.url;
    // Fallback: deterministic avatar from DiceBear
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'user')}`;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        uploadProfileImage,
        deleteProfileImage,
        getAvatarUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
