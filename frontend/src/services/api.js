import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
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

// Response interceptor to handle errors and token refreshing
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiry / 401 Unauthorized
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/jwt/refresh-token')
    ) {
      originalRequest._retry = true;
      const expiredToken = localStorage.getItem('token');
      if (expiredToken) {
        try {
          // Attempt to refresh the JWT token
          const response = await axios.post('http://localhost:5000/api/v1/jwt/refresh-token', {
            token: expiredToken,
          });
          
          if (response.data && response.data.token) {
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clean up auth session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }
      }
    }

    // Normalize error payload structure
    const normalizedError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };

    return Promise.reject(normalizedError);
  }
);

export default api;
