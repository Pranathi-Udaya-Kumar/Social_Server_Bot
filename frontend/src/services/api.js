import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const contentApi = {
  getContents: async (userPhone, params = {}) => {
    const response = await api.get('/api/content/', {
      params: { user_phone: userPhone, ...params }
    });
    return response.data;
  },

  getContent: async (contentId) => {
    const response = await api.get(`/api/content/${contentId}`);
    return response.data;
  },

  deleteContent: async (contentId) => {
    const response = await api.delete(`/api/content/${contentId}`);
    return response.data;
  },

  getUserStats: async (userPhone) => {
    const response = await api.get(`/api/content/stats/${userPhone}`);
    return response.data;
  },

  searchContents: async (userPhone, query, params = {}) => {
    const response = await api.get('/api/content/', {
      params: { user_phone: userPhone, search: query, ...params }
    });
    return response.data;
  },

  getContentsByCategory: async (userPhone, category, params = {}) => {
    const response = await api.get('/api/content/', {
      params: { user_phone: userPhone, category, ...params }
    });
    return response.data;
  }
};

export const whatsappApi = {
  sendMessage: async (to, message) => {
    const response = await api.post('/webhook/whatsapp', {
      to,
      body: message
    });
    return response.data;
  }
};

export default api;
