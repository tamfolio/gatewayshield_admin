// src/api.js
import axios from 'axios';
import { useMemo } from 'react';
import useAccessToken from './useAccessToken';

// Hard-coded API base URL
const BASE_URL = 'https://admin-api.thegatewayshield.com/api/v1';

// Axios Client Generator
const createApiClient = (accessToken) => {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  client.interceptors.request.use(
    (config) => {
      console.log('[Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data
      });
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => {
      console.log('[Response]', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    (error) => {
      if (!error.response) {
        console.error('[API] Network error:', error.message);
      } else {
        const { status, data } = error.response;
        console.error(`[API] Error ${status}:`, {
          url: error.config?.url,
          fullURL: `${error.config?.baseURL}${error.config?.url}`,
          message: data?.message || error.message,
          data: data
        });
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// React hook version
export const useApiClient = () => {
  const accessToken = useAccessToken();
  return useMemo(() => createApiClient(accessToken), [accessToken]);
};

// Reusable FormData Builder for News
const buildNewsFormData = (data, mediaFiles = [], coverFile = null) => {
  // Use exact field names and types that backend validation expects
  const apiData = {
    title: data.title,
    subtitle: data.subtitle,
    bodyText: data.bodyText,
    tags: data.tags || [],
    // Backend validation expects booleans, not numbers
    isDraft: Boolean(data.isDraft),
    isActive: Boolean(data.isActive),
    // Backend validation requires 'coverImageFileName', not 'coverImage'
    coverImageFileName: data.coverImageFileName || ''
  };

  // Add caption if provided
  if (data.caption) {
    apiData.caption = data.caption;
  }

  console.log('[API FORMAT] Sending data with correct validation format:', JSON.stringify(apiData, null, 2));

  const formData = new FormData();
  formData.append('data', JSON.stringify(apiData));

  mediaFiles.forEach((file) => {
    if (file instanceof File) formData.append('media', file);
  });

  if (coverFile instanceof File) {
    formData.append('cover', coverFile);
  }

  return formData;
};

// News API
export const newsApi = {
  create: async (client, newsData, mediaFiles, coverFile) => {
    const formData = buildNewsFormData(newsData, mediaFiles, coverFile);
    const response = await client.post('/adminTools/news/new', formData);
    return response.data;
  },

  update: async (client, newsId, newsData, mediaFiles, coverFile) => {
    console.log('[NEWS UPDATE] Using correct API format...');
    console.log('[NEWS UPDATE] Original newsData:', JSON.stringify(newsData, null, 2));
    
    try {
      const formData = buildNewsFormData(newsData, mediaFiles, coverFile);
      const response = await client.patch(`/adminTools/news/${newsId}`, formData);
      console.log('[NEWS UPDATE] SUCCESS with correct API format!');
      return response.data;
    } catch (error) {
      console.error('[NEWS UPDATE] Failed with error:', error.response?.data);
      throw error;
    }
  },

  delete: async (client, newsId) => {
    const response = await client.delete(`/adminTools/news/${newsId}`);
    return response.data;
  },

  getAll: async (client, page = 1, size = 10, filters = {}) => {
    // Build query parameters properly
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    // Add optional filters
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.author) {
      params.append('author', filters.author);
    }
    
    const response = await client.get(`/adminTools/news/all?${params.toString()}`);
    return response.data;
  },

  getOne: async (client, newsId) => {
    const response = await client.get(`/adminTools/news/${newsId}`);
    return response.data;
  },
};

// ========== FEEDBACK APIS ==========

/**
 * Case Review Feedback API
 * Endpoints for case review feedback operations
 */
export const caseReviewFeedbackApi = {
  /**
   * Get all case review feedbacks with pagination and filters
   * GET /feedback/caseReview/all-feedbacks?page=1&size=10
   */
  getAllFeedbacks: async (client, page = 1, size = 10, filters = {}) => {
    try {
      console.log('🚀 [CASE REVIEW API] Fetching all feedbacks');
      console.log('📋 Parameters:', { page, size, filters });
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await client.get(`/feedback/caseReview/all-feedbacks?${params.toString()}`);
      
      console.log('✅ [CASE REVIEW API] Feedbacks fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CASE REVIEW API] Failed to fetch feedbacks:', error);
      throw error;
    }
  },

  /**
   * Get dashboard statistics for case review
   * GET /feedback/caseReview/dashboard-stats
   */
  getDashboardStats: async (client, filters = {}) => {
    try {
      console.log('📊 [CASE REVIEW API] Fetching dashboard stats');
      
      // Build query parameters for filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const url = `/feedback/caseReview/dashboard-stats${queryString ? `?${queryString}` : ''}`;
      
      const response = await client.get(url);
      
      console.log('✅ [CASE REVIEW API] Dashboard stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CASE REVIEW API] Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get stations for case review filters
   * GET /feedback/caseReview/stations
   */
  getStations: async (client) => {
    try {
      console.log('🏢 [CASE REVIEW API] Fetching stations');
      
      const response = await client.get('/feedback/caseReview/stations');
      
      console.log('✅ [CASE REVIEW API] Stations fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CASE REVIEW API] Failed to fetch stations:', error);
      throw error;
    }
  },

  /**
   * Get crime types for case review filters
   * GET /feedback/caseReview/crime-types
   */
  getCrimeTypes: async (client) => {
    try {
      console.log('🚨 [CASE REVIEW API] Fetching crime types');
      
      const response = await client.get('/feedback/caseReview/crime-types');
      
      console.log('✅ [CASE REVIEW API] Crime types fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CASE REVIEW API] Failed to fetch crime types:', error);
      throw error;
    }
  },

  /**
   * Get source channels for case review filters  
   * GET /feedback/caseReview/source-channel
   */
  getSourceChannels: async (client) => {
    try {
      console.log('📡 [CASE REVIEW API] Fetching source channels');
      
      const response = await client.get('/feedback/caseReview/source-channel');
      
      console.log('✅ [CASE REVIEW API] Source channels fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CASE REVIEW API] Failed to fetch source channels:', error);
      throw error;
    }
  }
};

/**
 * General Feedback API
 * Endpoints for general feedback operations
 */
export const generalFeedbackApi = {
  /**
   * Get dashboard statistics for general feedback
   * GET /feedback/generalFeedback/dashboard-stats
   */
  getDashboardStats: async (client, page = 1, size = 10) => {
    try {
      console.log('📊 [GENERAL FEEDBACK API] Fetching dashboard stats');
      console.log('📋 Parameters:', { page, size });
      
      const response = await client.get('/feedback/generalFeedback/dashboard-stats');
      
      console.log('✅ [GENERAL FEEDBACK API] Dashboard stats fetched successfully');
      console.log('📊 Response keys:', Object.keys(response.data || {}));
      console.log('📋 Response structure:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('❌ [GENERAL FEEDBACK API] Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get all general feedbacks with pagination
   * GET /feedback/generalFeedback/all-feedbacks?page=1&size=10
   */
  getAllFeedbacks: async (client, page = 1, size = 10) => {
    try {
      console.log('🚀 [GENERAL FEEDBACK API] Fetching all feedbacks');
      console.log('📋 Parameters:', { page, size });
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      const response = await client.get(`/feedback/generalFeedback/all-feedbacks?${params.toString()}`);
      
      console.log('✅ [GENERAL FEEDBACK API] Feedbacks fetched successfully');
      console.log('📊 Response keys:', Object.keys(response.data || {}));
      console.log('📋 Response structure:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('❌ [GENERAL FEEDBACK API] Failed to fetch feedbacks:', error);
      throw error;
    }
  },

  /**
   * Delete a feedback by ID
   * DELETE /feedback/generalFeedback/delete-feedback
   * Body: { "feedbackId": "..." }
   */
  deleteFeedback: async (client, feedbackId) => {
    try {
      console.log('🗑️ [GENERAL FEEDBACK API] Deleting feedback');
      console.log('🎯 Feedback ID:', feedbackId);
      
      // Validate feedbackId
      if (!feedbackId || feedbackId.toString().trim() === '') {
        throw new Error('Feedback ID is required for delete operation');
      }
      
      const deletePayload = { feedbackId };
      console.log('📤 Delete payload:', JSON.stringify(deletePayload, null, 2));
      
      const response = await client.delete('/feedback/generalFeedback/delete-feedback', {
        data: deletePayload
      });
      
      console.log('✅ [GENERAL FEEDBACK API] Feedback deleted successfully');
      console.log('📥 Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [GENERAL FEEDBACK API] Failed to delete feedback:', error);
      throw error;
    }
  },

  /**
   * Publish a feedback by ID  
   * POST /feedback/generalFeedback/publish-feedback
   * Body: { "feedbackId": "..." }
   */
  publishFeedback: async (client, feedbackId) => {
    try {
      console.log('📢 [GENERAL FEEDBACK API] Publishing feedback');
      console.log('🎯 Feedback ID:', feedbackId);
      
      // Validate feedbackId
      if (!feedbackId || feedbackId.toString().trim() === '') {
        throw new Error('Feedback ID is required for publish operation');
      }
      
      const publishPayload = { feedbackId };
      console.log('📤 Publish payload:', JSON.stringify(publishPayload, null, 2));
      
      const response = await client.post('/feedback/generalFeedback/publish-feedback', publishPayload);
      
      console.log('✅ [GENERAL FEEDBACK API] Feedback published successfully');
      console.log('📥 Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [GENERAL FEEDBACK API] Failed to publish feedback:', error);
      throw error;
    }
  }
};

/**
 * Utility functions for feedback operations
 */
export const feedbackUtils = {
  /**
   * Transform general feedback data from API format to UI format
   * @param {Array} apiData - Raw feedback data from API
   * @returns {Array} Transformed data for UI display
   */
  transformGeneralFeedbackData: (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(item => ({
      id: item.id || `fb_${Math.random().toString(36).substr(2, 9)}`,
      feedbackId: item.id || `fb_${Math.random().toString(36).substr(2, 9)}`,
      type: item.feedbackType || 'Unknown',
      officer: item.officerName || 'N/A',  
      station: item.stationName || 'Unknown Station',
      comment: item.comment || '-',
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      }) : 'N/A',
      status: item.status || 'pending',
      // Keep original fields for reference
      ...item
    }));
  },

  /**
   * Transform case review feedback data from API format to UI format
   * @param {Array} apiData - Raw feedback data from API
   * @returns {Array} Transformed data for UI display
   */
  transformCaseReviewFeedbackData: (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(item => ({
      id: item.reportID || item.id || `cr_${Math.random().toString(36).substr(2, 9)}`,
      reportId: item.reportID || item.id || `cr_${Math.random().toString(36).substr(2, 9)}`,
      station: item.stationName || item.station || 'Unknown Station',
      feedback: item.comments || item.feedback || item.feedbackText || item.comment || '-',
      rating: item.rating || 0,
      date: item.dateclosed || item.date || item.createdAt || item.dateClosed || 'N/A',
      // Keep original fields for reference
      ...item
    }));
  },

  /**
   * Transform dashboard data for general feedback charts
   * @param {Object} apiData - Raw dashboard data from API
   * @returns {Object} Transformed data for chart display
   */
  transformGeneralFeedbackDashboard: (apiData) => {
    if (!apiData) return null;
    
    return {
      averageOfficerRating: apiData.averageOfficerRating || 0,
      averageStationRating: apiData.averageStationRating || 0,
      
      // Transform officers data to match chart format
      topPerformingOfficers: (apiData.topOfficers || []).map(officer => ({
        name: officer.officerName || 'Unknown Officer',
        value: parseFloat(officer.avgRating || 0)
      })),
      
      bottomPerformingOfficers: (apiData.bottomOfficers || []).map(officer => ({
        name: officer.officerName || 'Unknown Officer', 
        value: parseFloat(officer.avgRating || 0)
      })),
      
      // Transform stations data to match chart format
      topPerformingStations: (apiData.topStations || []).map(station => ({
        name: station.stationName || 'Unknown Station',
        value: parseFloat(station.avgRating || 0)
      })),
      
      bottomPerformingStations: (apiData.bottomStations || []).map(station => ({
        name: station.stationName || 'Unknown Station',
        value: parseFloat(station.avgRating || 0)
      }))
    };
  },

  /**
   * Extract data from nested API response structures
   * @param {Object} response - API response
   * @returns {Object} Extracted data and pagination info
   */
  extractApiResponseData: (response) => {
    let data = [];
    let pagination = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10
    };

    if (response && response.data) {
      // Handle nested structure: { data: { data: [...], pagination: {...} } }
      const responseData = response.data;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        data = responseData.data;
        
        // Extract pagination info
        if (responseData.pagination) {
          pagination = { ...pagination, ...responseData.pagination };
        }
      } else if (Array.isArray(responseData)) {
        data = responseData;
        pagination.total = responseData.length;
      }
    }

    return { data, pagination };
  }
};

/**
 * CORRECTED BROADCAST API CLIENT
 * Updated with the correct endpoints from your backend
 */
export const broadcastApi = {
  
  /**
   * Create a new broadcast
   * POST /adminTools/broadcast/create-broadcast
   */
  create: async (apiClient, broadcastData) => {
    try {
      console.log('🚀 [BROADCAST API] Creating broadcast');
      console.log('📤 Payload:', JSON.stringify(broadcastData, null, 2));
      
      // Validate required fields for create
      const requiredFields = ['title', 'body', 'alertType'];
      const missingFields = requiredFields.filter(field => 
        !broadcastData.hasOwnProperty(field) || !broadcastData[field]?.toString().trim()
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields for create: ${missingFields.join(', ')}`);
      }
      
      const response = await apiClient.post('/adminTools/broadcast/create-broadcast', broadcastData);
      
      console.log('✅ [BROADCAST API] Broadcast created successfully');
      console.log('📥 Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [BROADCAST API] Failed to create broadcast');
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create broadcast'
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },

  /**
   * Edit an existing broadcast
   * PATCH /adminTools/broadcast/edit-broadcast
   */
  edit: async (apiClient, editData) => {
    try {
      console.log('🔄 [BROADCAST API] Editing broadcast');
      console.log('📤 Edit payload:', JSON.stringify(editData, null, 2));
      
      // Validate all required fields for edit (as per your curl example)
      const requiredFields = ['title', 'body', 'alertType', 'lgaId', 'broadcastId'];
      const missingFields = requiredFields.filter(field => {
        // Special handling for lgaId which can be null
        if (field === 'lgaId') {
          return !editData.hasOwnProperty(field);
        }
        return !editData.hasOwnProperty(field) || !editData[field]?.toString().trim();
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields for edit: ${missingFields.join(', ')}`);
      }
      
      // Additional validation for broadcastId
      if (!editData.broadcastId || editData.broadcastId.toString().trim() === '') {
        throw new Error('Broadcast ID is required for edit operation');
      }
      
      // Use PATCH method as confirmed in your example
      const response = await apiClient.patch('/adminTools/broadcast/edit-broadcast', editData);
      
      console.log('✅ [BROADCAST API] Broadcast edited successfully');
      console.log('📥 Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [BROADCAST API] Failed to edit broadcast');
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        editData: editData
      });
      
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to edit broadcast'
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },

  /**
   * Get all broadcasts with pagination and filtering
   * GET /adminTools/broadcast/all?status=Sent&alertType=Missing Person
   */
  getAll: async (apiClient, page = 1, limit = 10, filters = {}) => {
    try {
      console.log('📋 [BROADCAST API] Fetching broadcasts');
      console.log('🔍 Parameters:', { page, limit, filters });
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      // Add filters to params (based on your example with status and alertType)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const endpoint = `/adminTools/broadcast/all${queryString ? `?${queryString}` : ''}`;
      
      console.log('🌐 Request URL:', endpoint);
      
      const response = await apiClient.get(endpoint);
      
      console.log('✅ [BROADCAST API] Broadcasts fetched successfully');
      console.log('📊 Response structure:', {
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : 'No data'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ [BROADCAST API] Failed to fetch broadcasts');
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch broadcasts'
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },

  /**
   * Delete a broadcast by ID
   * DELETE /adminTools/broadcast/delete-broadcast
   * Body: { "broadcastId": "01K022XG2P7JVGK5CCJ014PR6G" }
   */
  delete: async (apiClient, broadcastId) => {
    try {
      console.log('🗑️ [BROADCAST API] Deleting broadcast');
      console.log('🎯 Broadcast ID:', broadcastId);
      
      // Validate broadcastId
      if (!broadcastId || broadcastId.toString().trim() === '') {
        throw new Error('Broadcast ID is required for delete operation');
      }
      
      // Based on your example, delete uses request body with broadcastId, not URL param
      const deletePayload = {
        broadcastId: broadcastId
      };
      
      console.log('📤 Delete payload:', JSON.stringify(deletePayload, null, 2));
      
      const response = await apiClient.delete('/adminTools/broadcast/delete-broadcast', {
        data: deletePayload
      });
      
      console.log('✅ [BROADCAST API] Broadcast deleted successfully');
      console.log('📥 Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [BROADCAST API] Failed to delete broadcast');
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        broadcastId: broadcastId
      });
      
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete broadcast'
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },

  /**
   * Get available alert types
   * GET /adminTools/broadcast/alert-types
   */
  getAlertTypes: async (apiClient) => {
    try {
      console.log('🏷️ [BROADCAST API] Fetching alert types');
      
      const response = await apiClient.get('/adminTools/broadcast/alert-types');
      
      console.log('✅ [BROADCAST API] Alert types fetched successfully');
      console.log('📝 Alert types response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [BROADCAST API] Failed to fetch alert types');
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // For alert types, we can provide fallback data
      console.log('🔄 Using fallback alert types');
      return ['Red Alert', 'Yellow Alert', 'Green Alert', 'Blue Alert', 'Weather'];
    }
  },

  /**
   * Get broadcast statistics/summary (if available)
   */
  getStatistics: async (apiClient, filters = {}) => {
    try {
      console.log('📊 [BROADCAST API] Fetching broadcast statistics');
      console.log('🔍 Filters:', filters);
      
      // Build query parameters for statistics
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const endpoint = `/adminTools/broadcast/statistics${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(endpoint);
      
      console.log('✅ [BROADCAST API] Statistics fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [BROADCAST API] Failed to fetch statistics');
      console.error('🔍 Error details:', {
        status: error.response?.status,
        message: error.message
      });
      
      // Return empty statistics on error
      return {
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0
      };
    }
  },

  /**
   * Get a single broadcast by ID (if available)
   */
  getById: async (apiClient, broadcastId) => {
    try {
      console.log('🎯 [BROADCAST API] Fetching broadcast by ID');
      console.log('🆔 Broadcast ID:', broadcastId);
      
      // Validate broadcastId
      if (!broadcastId || broadcastId.toString().trim() === '') {
        throw new Error('Broadcast ID is required');
      }
      
      const response = await apiClient.get(`/adminTools/broadcast/${broadcastId}`);
      
      console.log('✅ [BROADCAST API] Broadcast fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [BROADCAST API] Failed to fetch broadcast');
      console.error('🔍 Error details:', {
        status: error.response?.status,
        message: error.message,
        broadcastId: broadcastId
      });
      
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch broadcast'
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  }
};

/**
 * Utility functions for broadcast operations
 */
export const broadcastUtils = {
  /**
   * Validate broadcast data before submission
   * @param {Object} broadcastData - The broadcast data to validate
   * @param {boolean} isEdit - Whether this is an edit operation
   * @returns {Object} Validation result with isValid and errors
   */
  validateBroadcastData: (broadcastData, isEdit = false) => {
    const errors = [];
    
    // Title validation
    if (!broadcastData.title || !broadcastData.title.trim()) {
      errors.push('Title is required');
    } else if (broadcastData.title.length > 100) {
      errors.push('Title must be 100 characters or less');
    }
    
    // Body validation
    if (!broadcastData.body || !broadcastData.body.trim()) {
      errors.push('Message body is required');
    } else if (broadcastData.body.length > 500) {
      errors.push('Message body must be 500 characters or less');
    }
    
    // Alert type validation
    if (!broadcastData.alertType || !broadcastData.alertType.trim()) {
      errors.push('Alert type is required');
    }
    
    // Edit-specific validation
    if (isEdit && (!broadcastData.broadcastId || !broadcastData.broadcastId.trim())) {
      errors.push('Broadcast ID is required for edit operations');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Format broadcast data for API submission
   * @param {Object} formData - Form data from the UI
   * @param {boolean} isEdit - Whether this is an edit operation
   * @returns {Object} Formatted data for API
   */
  formatBroadcastData: (formData, isEdit = false) => {
    const baseData = {
      title: formData.title?.trim() || '',
      body: formData.body?.trim() || '',
      alertType: formData.alertType || '',
      lgaId: formData.lgaId || null
    };
    
    if (isEdit) {
      baseData.broadcastId = formData.broadcastId;
    }
    
    return baseData;
  },

  /**
   * Parse API response to extract broadcast array
   * @param {Object} response - API response
   * @returns {Object} Parsed response with broadcasts array and pagination
   */
  parseGetAllResponse: (response) => {
    let broadcasts = [];
    let pagination = {
      totalPages: 1,
      total: 0,
      currentPage: 1,
      hasNext: false,
      hasPrev: false
    };
    
    if (response) {
      // Handle different response structures
      if (Array.isArray(response)) {
        broadcasts = response;
        pagination.total = response.length;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          broadcasts = response.data;
          pagination.total = response.data.length;
        } else if (response.data.broadcasts) {
          if (Array.isArray(response.data.broadcasts)) {
            broadcasts = response.data.broadcasts;
          } else if (response.data.broadcasts.data && Array.isArray(response.data.broadcasts.data)) {
            broadcasts = response.data.broadcasts.data;
            if (response.data.broadcasts.pagination) {
              pagination = { ...pagination, ...response.data.broadcasts.pagination };
            }
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          broadcasts = response.data.data;
          if (response.data.pagination) {
            pagination = { ...pagination, ...response.data.pagination };
          }
        }
        
        // Extract pagination from top level
        if (response.totalPages) pagination.totalPages = response.totalPages;
        if (response.total) pagination.total = response.total;
        if (response.totalCount) pagination.total = response.totalCount;
      } else if (response.broadcasts && Array.isArray(response.broadcasts)) {
        broadcasts = response.broadcasts;
        if (response.totalPages) pagination.totalPages = response.totalPages;
        if (response.totalCount) pagination.total = response.totalCount;
      }
    }
    
    return { broadcasts, pagination };
  }
};

// SLA API
export const slaApi = {
  getAll: async (client) => {
    const response = await client.get('/adminTools/sla');
    return response.data;
  },

  create: async (client, slaData) => {
    const response = await client.post('/adminTools/sla', slaData);
    return response.data;
  },

  delete: async (client, slaId) => {
    const response = await client.delete(`/adminTools/sla/${slaId}`);
    return response.data;
  },
};

// Incident API
export const incidentApi = {
  create: async (client, incidentData) => {
    const response = await client.post('/adminTools/incident/create', incidentData);
    return response.data;
  },

  getAll: async (client, page = 1, size = 10) => {
    const response = await client.get(`/adminTools/incident/all?page=${page}&size=${size}`);
    return response.data;
  },

  getOne: async (client, incidentId) => {
    const response = await client.get(`/adminTools/incident/${incidentId}`);
    return response.data;
  },

  update: async (client, incidentId, incidentData) => {
    const response = await client.put(`/adminTools/incident/${incidentId}`, incidentData);
    return response.data;
  },

  delete: async (client, incidentId) => {
    const response = await client.delete(`/adminTools/incident/${incidentId}`);
    return response.data;
  },
};