/**
 * Centralized Axios instance with interceptors
 * API abstraction layer for all HTTP requests
 */
import axios from 'axios';
import { APP_CONFIG } from '@/constants/config';

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAccessToken = () => accessToken;

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

const api = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send httpOnly refresh cookie with every request
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally and auto-refresh token
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    // Auto-refresh token on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we don't have a token in memory and we fail, or if it is already a retry
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject({ message, status: error.response?.status });
      }

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

      return new Promise((resolve, reject) => {
        axios
          .post(`${APP_CONFIG.apiBaseUrl}/auth/refresh`, {}, { withCredentials: true })
          .then((res) => {
            const token = res.data.accessToken;
            setAccessToken(token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            processQueue(null, token);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            setAccessToken(null);
            // Dispatch event to notify AuthContext to update UI
            window.dispatchEvent(new Event('auth-logout'));
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
