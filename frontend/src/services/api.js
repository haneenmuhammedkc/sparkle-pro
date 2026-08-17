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

// Mutex / Queue state for parallel 401 requests
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

// Response Interceptor: Mutex Refresh Queue & 401 Error Handling
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

    // Handle 401 Unauthorized & Mutex Token Refresh
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
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
        // HttpOnly refresh cookie is sent automatically via withCredentials: true
        const res = await api.post('/auth/refresh-token');

        if (res.data.success && res.data.data?.accessToken) {
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('sparklepro_access_token', newAccessToken);

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('sparklepro_access_token');
        localStorage.removeItem('sparklepro_refresh_token'); // Cleanup legacy tokens
        window.location.href = '/login';
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
