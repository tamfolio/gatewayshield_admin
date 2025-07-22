import axios from 'axios';
import useAccessToken from './useAccessToken';

const API_BASE_URL = 'https://admin-api.thegatewayshield.com/api/v1/adminTools';

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

// News API helper functions 
export const newsApi = {
  // Get all news with pagination and filters
  getAll: async (client, params = {}) => {
    const response = await client.get('/news/all', { params });
    return response.data;
  },

  // Get single news item
  getById: async (client, newsId) => {
    const response = await client.get(`/news/${newsId}`);
    return response.data;
  },

  // Create new news 
  create: async (client, newsData) => {
    const response = await client.post('/news/new', newsData);
    return response.data;
  },

  // Update existing news
  update: async (client, newsId, updateData) => {
    const response = await client.patch(`/news/${newsId}`, updateData);
    return response.data;
  },

  // Delete news
  delete: async (client, newsId, deleteData = {}) => {
    const response = await client.delete(`/news/${newsId}`, { data: deleteData });
    return response.data;
  },

  // Upload files for news
  uploadFiles: async (client, formData) => {
    const response = await client.post('/news/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Enhanced Broadcast API helper functions
export const broadcastApi = {
  // Get alert types from API
  getAlertTypes: async (client) => {
    const response = await client.get('/broadcast/alert-types');
    return response.data;
  },

  // Create new broadcast
  create: async (client, broadcastData) => {
    const response = await client.post('/broadcast/create-broadcast', broadcastData);
    return response.data;
  },

  // Edit existing broadcast
  edit: async (client, editData) => {
    const response = await client.patch('/broadcast/edit-broadcast', editData);
    return response.data;
  },

  // Delete broadcast
  delete: async (client, broadcastId) => {
    const response = await client.delete('/broadcast/delete-broadcast', { 
      data: { broadcastId } 
    });
    return response.data;
  },

  // Get all broadcasts (if this endpoint becomes available)
  getAll: async (client, params = {}) => {
    try {
      const response = await client.get('/broadcast/all', { params });
      return response.data;
    } catch (error) {
      // Fallback to mock data if endpoint doesn't exist yet
      console.warn('Broadcast getAll endpoint not available, using mock data');
      return {
        data: [
          {
            id: '01K022XG2P7JVGK5CCJ014PR6G',
            title: 'Emergency Alert - City Center',
            subtitle: 'Immediate evacuation required',
            alertType: 'Red Alert',
            dateCreated: 'Jul 19, 2025',
            createdBy: 'Admin User',
            status: 'Sent',
            body: 'Due to a gas leak in the city center, all residents within a 2-mile radius must evacuate immediately.',
            lgaId: '01JZJPZFSFDFERZQQEYQ39WZP3'
          },
          {
            id: '01K022XG2P7JVGK5CCJ014PR6H',
            title: 'Weather Warning',
            subtitle: 'Heavy rainfall expected',
            alertType: 'Weather',
            dateCreated: 'Jul 18, 2025',
            createdBy: 'Weather Admin',
            status: 'Pending',
            body: 'Severe thunderstorms and heavy rainfall expected in the next 6 hours. Avoid unnecessary travel.',
            lgaId: null
          },
          {
            id: '01K022XG2P7JVGK5CCJ014PR6I',
            title: 'Crime Warning',
            subtitle: 'Suspicious activity reported',
            alertType: 'Crime Warning',
            dateCreated: 'Jul 17, 2025',
            createdBy: 'Security Admin',
            status: 'Failed',
            body: 'Suspicious activity reported in downtown area. Residents advised to remain vigilant.',
            lgaId: '01JZJPZFSFDFERZQQEYQ39WZP4'
          }
        ],
        total: 3,
        page: 1,
        totalPages: 1
      };
    }
  },

  // Get single broadcast (if this endpoint becomes available)
  getById: async (client, broadcastId) => {
    const response = await client.get(`/broadcast/${broadcastId}`);
    return response.data;
  }
};

export default { createApiClient, useApiClient, newsApi, broadcastApi };