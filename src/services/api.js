import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getUser: () => api.get('/auth/user'),
  updateNotifications: (preferences) => api.put('/auth/notifications', preferences),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Investments API
export const investmentsAPI = {
  getAll: () => api.get('/investments'),
  getPortfolio: () => api.get('/investments/portfolio'),
  add: (investment) => api.post('/investments', investment),
  update: (id, updates) => api.put(`/investments/${id}`, updates),
  delete: (id) => api.delete(`/investments/${id}`),
  refreshPrices: () => api.post('/investments/refresh-prices'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api; 