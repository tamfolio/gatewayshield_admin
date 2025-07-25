// src/hooks/useAuditLogs.js
import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '../Utils/apiClient';
import { auditLogsApi, auditLogsUtils } from '../Utils/apiClient';

/**
 * Custom hook for managing audit logs
 * Provides data fetching, filtering, pagination, and export functionality
 */
export const useAuditLogs = (initialOptions = {}) => {
  const apiClient = useApiClient();
  
  // Default options
  const defaultOptions = {
    pageSize: 10,
    autoLoad: true,
    enableClientFiltering: true,
    enableMockFallback: true
  };
  
  const options = { ...defaultOptions, ...initialOptions };

  // State management
  const [state, setState] = useState({
    logs: [],
    userRoles: [],
    actionTypes: [],
    statistics: null,
    pagination: {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: options.pageSize,
      hasNext: false,
      hasPrev: false
    },
    filters: {
      userRole: [],
      timeStamp: null,
      search: '',
      actionType: null,
      startDate: null,
      endDate: null
    },
    loading: false,
    error: null,
    exporting: false
  });

  // Mock data fallback
  const mockData = [
    { id: '#F234567', userRole: 'Police Station', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234568', userRole: 'Comm. Centre Agent', action: 'Changed status to "Assigned to Station"', time: '22:45', date: 'Jan 4, 2025' },
    { id: '#F234569', userRole: 'Police Station Officer', action: 'Changed status to "In Progress"', time: '22:30', date: 'Jan 4, 2025' },
    { id: '#F234570', userRole: 'Comm. Centre Agent', action: 'Changed status to "Treated"', time: '22:15', date: 'Jan 4, 2025' },
    { id: '#F234571', userRole: 'Citizen', action: 'Left 5 Star review on "xxx"', time: '22:00', date: 'Jan 4, 2025' }
  ];

  // Update state helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Load audit logs
  const loadLogs = useCallback(async (page = state.pagination.currentPage, customFilters = null) => {
    try {
      updateState({ loading: true, error: null });
      
      const filters = auditLogsUtils.validateFilters(customFilters || state.filters);
      
      console.log('🔍 [useAuditLogs] Loading logs:', { page, filters });
      
      const response = await auditLogsApi.getAll(apiClient, page, state.pagination.pageSize, filters);
      const { logs, pagination } = auditLogsUtils.parseGetAllResponse(response);
      const transformedLogs = auditLogsUtils.transformAuditLogsData(logs);
      
      updateState({
        logs: transformedLogs,
        pagination: { ...state.pagination, ...pagination, currentPage: page },
        loading: false
      });
      
      console.log('✅ [useAuditLogs] Logs loaded:', transformedLogs.length);
      return transformedLogs;
    } catch (error) {
      console.error('❌ [useAuditLogs] Failed to load logs:', error);
      
      const errorMessage = error.message || 'Failed to load audit logs';
      updateState({ error: errorMessage, loading: false });
      
      // Use mock data as fallback if enabled
      if (options.enableMockFallback) {
        console.log('🔄 [useAuditLogs] Using mock data fallback');
        const transformedMockData = auditLogsUtils.transformAuditLogsData(mockData);
        updateState({
          logs: transformedMockData,
          pagination: { ...state.pagination, total: mockData.length, totalPages: 1 }
        });
        return transformedMockData;
      }
      
      throw error;
    }
  }, [apiClient, state.filters, state.pagination.currentPage, state.pagination.pageSize, options.enableMockFallback, updateState]);

  // Load user roles
  const loadUserRoles = useCallback(async () => {
    try {
      console.log('👥 [useAuditLogs] Loading user roles');
      const roles = await auditLogsApi.getUserRoles(apiClient);
      updateState({ userRoles: Array.isArray(roles) ? roles : [] });
      return roles;
    } catch (error) {
      console.error('❌ [useAuditLogs] Failed to load user roles:', error);
      const fallbackRoles = ['Police Station', 'Police Station Officer', 'Citizen', 'Comm. Centre Agent'];
      updateState({ userRoles: fallbackRoles });
      return fallbackRoles;
    }
  }, [apiClient, updateState]);

  // Load action types
  const loadActionTypes = useCallback(async () => {
    try {
      console.log('🎯 [useAuditLogs] Loading action types');
      const actions = await auditLogsApi.getActionTypes(apiClient);
      updateState({ actionTypes: Array.isArray(actions) ? actions : [] });
      return actions;
    } catch (error) {
      console.error('❌ [useAuditLogs] Failed to load action types:', error);
      const fallbackActions = ['Status Change', 'User Login', 'User Logout', 'Data Creation', 'Data Update', 'Data Deletion'];
      updateState({ actionTypes: fallbackActions });
      return fallbackActions;
    }
  }, [apiClient, updateState]);

  // Load statistics
  const loadStatistics = useCallback(async (customFilters = null) => {
    try {
      console.log('📊 [useAuditLogs] Loading statistics');
      const filters = auditLogsUtils.validateFilters(customFilters || state.filters);
      const stats = await auditLogsApi.getStatistics(apiClient, filters);
      updateState({ statistics: stats });
      return stats;
    } catch (error) {
      console.error('❌ [useAuditLogs] Failed to load statistics:', error);
      const fallbackStats = { totalLogs: 0, totalUsers: 0, todayLogs: 0 };
      updateState({ statistics: fallbackStats });
      return fallbackStats;
    }
  }, [apiClient, state.filters, updateState]);

  // Update filters
  const updateFilters = useCallback((newFilters, reload = true) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    updateState({ 
      filters: updatedFilters,
      pagination: { ...state.pagination, currentPage: 1 } // Reset to first page
    });
    
    if (reload) {
      loadLogs(1, updatedFilters);
    }
  }, [state.filters, state.pagination, updateState, loadLogs]);

  // Clear filters
  const clearFilters = useCallback((reload = true) => {
    const clearedFilters = {
      userRole: [],
      timeStamp: null,
      search: '',
      actionType: null,
      startDate: null,
      endDate: null
    };
    
    updateState({ 
      filters: clearedFilters,
      pagination: { ...state.pagination, currentPage: 1 }
    });
    
    if (reload) {
      loadLogs(1, clearedFilters);
    }
  }, [state.pagination, updateState, loadLogs]);

  // Change page
  const changePage = useCallback((page) => {
    if (page >= 1 && page <= state.pagination.totalPages && page !== state.pagination.currentPage) {
      loadLogs(page);
    }
  }, [state.pagination.totalPages, state.pagination.currentPage, loadLogs]);

  // Export logs
  const exportLogs = useCallback(async (format = 'csv', customFilters = null) => {
    try {
      updateState({ exporting: true });
      
      const filters = auditLogsUtils.validateFilters(customFilters || state.filters);
      
      try {
        // Try API export first
        console.log('📥 [useAuditLogs] Exporting from API');
        const blob = await auditLogsApi.exportLogs(apiClient, filters);
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ [useAuditLogs] API export successful');
        return { success: true, method: 'api' };
      } catch (apiError) {
        console.warn('⚠️ [useAuditLogs] API export failed, using client-side export:', apiError);
        
        // Fallback to client-side export
        const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        auditLogsUtils.exportToCSV(state.logs, filename);
        
        console.log('✅ [useAuditLogs] Client-side export successful');
        return { success: true, method: 'client' };
      }
    } catch (error) {
      console.error('❌ [useAuditLogs] Export failed:', error);
      updateState({ error: 'Failed to export audit logs' });
      return { success: false, error: error.message };
    } finally {
      updateState({ exporting: false });
    }
  }, [apiClient, state.filters, state.logs, updateState]);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([
      loadLogs(1),
      loadUserRoles(),
      loadActionTypes(),
      loadStatistics()
    ]);
  }, [loadLogs, loadUserRoles, loadActionTypes, loadStatistics]);

  // Client-side filtering (fallback)
  const getFilteredLogs = useCallback(() => {
    if (!options.enableClientFiltering) return state.logs;
    
    return state.logs.filter(log => {
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        const searchMatch = (
          log.logId?.toLowerCase().includes(searchLower) ||
          log.userRole?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower) ||
          log.userName?.toLowerCase().includes(searchLower)
        );
        if (!searchMatch) return false;
      }
      
      // User role filter
      if (state.filters.userRole.length > 0) {
        if (!state.filters.userRole.includes(log.userRole)) return false;
      }
      
      // Date filter
      if (state.filters.timeStamp) {
        const logDate = new Date(log.timestamp || log.date);
        const filterDate = new Date(state.filters.timeStamp);
        if (logDate.toDateString() !== filterDate.toDateString()) return false;
      }
      
      return true;
    });
  }, [state.logs, state.filters, options.enableClientFiltering]);

  // Initial load
  useEffect(() => {
    if (options.autoLoad && apiClient) {
      refresh();
    }
  }, [options.autoLoad, apiClient, refresh]);

  // Public API
  return {
    // Data
    logs: getFilteredLogs(),
    userRoles: state.userRoles,
    actionTypes: state.actionTypes,
    statistics: state.statistics,
    pagination: state.pagination,
    filters: state.filters,
    
    // State
    loading: state.loading,
    error: state.error,
    exporting: state.exporting,
    
    // Actions
    loadLogs,
    loadUserRoles,
    loadActionTypes,
    loadStatistics,
    updateFilters,
    clearFilters,
    changePage,
    exportLogs,
    refresh,
    
    // Utilities
    clearError: () => updateState({ error: null }),
    setLoading: (loading) => updateState({ loading }),
    
    // Computed values
    hasData: state.logs.length > 0,
    hasError: !!state.error,
    hasFilters: Object.values(state.filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : !!filter
    )
  };
};