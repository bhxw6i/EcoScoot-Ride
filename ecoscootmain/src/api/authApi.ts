
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API methods
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_info', JSON.stringify({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        roleId: response.data.roleId
      }));
    }
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/profiles/current');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  getUserInfo: () => {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }
};

export default api;
