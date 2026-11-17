import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error formatting and 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // If unauthorized and not already on an auth page, redirect or broadcast
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      if (!isAuthPage) {
        // Clear local storage and dispatch custom event
        window.dispatchEvent(new CustomEvent('growthtech:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;

