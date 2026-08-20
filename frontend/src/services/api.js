import axios from 'axios';

const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_BASE_URL = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables browser to automatically send and receive HttpOnly cookies
});

// Single-flight refresh mutex & subscriber queue state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('sparklepro_access_token');
  localStorage.removeItem('sparklepro_refresh_token');
  if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
};

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sparklepro_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Single-Flight Refresh & Retry Queue
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network / Connection Refused Errors (Backend Offline)
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        error.message = 'Backend API server is unreachable. Please check backend connection.';
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const requestUrl = originalRequest?.url || '';

    // Auth endpoints that MUST NOT trigger refresh attempt on 401
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');

    // Handle 401 Unauthorized & Single-Flight Token Refresh
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const storedRefreshToken = localStorage.getItem('sparklepro_refresh_token');

      // If already refreshing, join subscriber queue and wait for the single in-flight refresh promise
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refresh request with both HttpOnly cookie (withCredentials) AND request body fallback
        const res = await api.post('/auth/refresh-token', {
          refreshToken: storedRefreshToken || undefined,
        });

        if (res.data?.success && res.data?.data?.accessToken) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

          // Persist BOTH tokens (Access Token & Rotated Refresh Token)
          localStorage.setItem('sparklepro_access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('sparklepro_refresh_token', newRefreshToken);
          }

          // Process queued subscriber requests with new access token
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error(res.data?.message || 'Refresh failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Attach server message if present
    if (data && data.message) {
      error.message = data.message;
    }

    return Promise.reject(error);
  }
);

export default api;
