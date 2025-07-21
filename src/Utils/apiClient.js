import axios from 'axios';
import useAccessToken from './useAccessToken';

const API_BASE_URL = 'https://admin-api.thegatewayshield.com/api/v1/adminTools/news';

export const createApiClient = (accessToken) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    }
  });

  client.interceptors.request.use(
    (config) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('[API] Request data:', config.data);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => {
      console.log(`[API] Response ${response.status}:`, response.data);
      return response;
    },
    (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      console.error(`[API] Error ${status}:`, message);
      
      if (status === 401) {
        console.error('Unauthorized: Token expired or invalid.');
      }
      if (status === 403) {
        console.error('Forbidden: Insufficient permissions.');
      }
      if (status === 404) {
        console.error('Not Found: Resource does not exist.');
      }
      if (status === 500) {
        console.error('Internal Server Error: Please try again later.');
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

export const useApiClient = () => {
  const accessToken = useAccessToken();
  return createApiClient(accessToken);
};

// Helper functions 
export const newsApi = {
  // Get all news with pagination and filters
  getAll: async (client, params = {}) => {
    const response = await client.get('/all', { params });
    return response.data;
  },

  // Get single news item
  getById: async (client, newsId) => {
    const response = await client.get(`/${newsId}`);
    return response.data;
  },

  // Create new news 
  create: async (client, newsData) => {
    const response = await client.post('/new', newsData);
    return response.data;
  },

  // Update existing news
  update: async (client, newsId, updateData) => {
    const response = await client.patch(`/${newsId}`, updateData);
    return response.data;
  },

  // Delete news
  delete: async (client, newsId, deleteData = {}) => {
    const response = await client.delete(`/${newsId}`, { data: deleteData });
    return response.data;
  },

  // Upload files for news
  uploadFiles: async (client, formData) => {
    const response = await client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default { createApiClient, useApiClient, newsApi };