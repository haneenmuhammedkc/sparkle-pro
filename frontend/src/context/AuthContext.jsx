import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../features/auth/services/authService.js';
import * as businessService from '../features/owner/setup/services/businessService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sparklepro_access_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);



  // Restore User & Business state on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sparklepro_access_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            setIsAuthenticated(true);
            
            // Try fetching existing business data if email is verified
            if (res.data.isEmailVerified) {
              try {
                const bizRes = await businessService.getBusiness();
                if (bizRes.success && bizRes.data) {
                  setBusiness(bizRes.data);
                }
              } catch (bizErr) {
                // Business profile not created yet
              }
            }
          } else {
            handleLogout();
          }
        } catch (err) {
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const bizRes = await businessService.getBusiness();
      if (bizRes.success && bizRes.data) {
        setBusiness(bizRes.data);
        return bizRes.data;
      }
    } catch (err) {
      console.error('Failed to fetch business details', err);
    }
    return null;
  };

  const handleLogin = async ({ email, password }) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('sparklepro_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('sparklepro_refresh_token', refreshToken);
      }
      setToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);
      await fetchBusinessData();
    }
    return res;
  };

  const handleRegister = async ({ fullName, email, password }) => {
    const res = await authService.register({ fullName, email, password });
    return res;
  };

  const handleVerifyEmail = async ({ email, otp }) => {
    const res = await authService.verifyEmail({ email, otp });
    if (res.success && res.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('sparklepro_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('sparklepro_refresh_token', refreshToken);
      }
      setToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);
    }
    return res;
  };

  const handleResendOTP = async (email) => {
    const res = await authService.resendVerificationOTP({ email });
    return res;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('sparklepro_access_token');
      localStorage.removeItem('sparklepro_refresh_token');
      setUser(null);
      setBusiness(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isAuthenticated,
        loading,
        login: handleLogin,
        register: handleRegister,
        verifyEmail: handleVerifyEmail,
        resendOTP: handleResendOTP,
        logout: handleLogout,
        setBusiness,
        fetchBusinessData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
