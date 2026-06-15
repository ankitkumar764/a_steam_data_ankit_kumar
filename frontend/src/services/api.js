import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Automatically inject JWT authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format errors and handle auth failures (401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    let message = 'An unexpected network error occurred.';

    if (error.response && error.response.data) {
      message = error.response.data.message || message;
    } else if (error.message) {
      message = error.message;
    }

    if (status === 401) {
      // Token has expired or is invalid, perform automatic cleanup
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch custom event to notify listeners (like Redux or Routers) to redirect to login
      window.dispatchEvent(new Event('auth-unauthorized'));
    }

    // Return a standardized error structure
    return Promise.reject({
      status,
      message,
      originalError: error,
    });
  }
);

export default api;
