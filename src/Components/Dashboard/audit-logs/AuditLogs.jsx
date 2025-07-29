import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, Search, Calendar, X, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';
import { auditLogsApi, auditLogsUtils, useApiClient } from '../../../Utils/apiClient';

// Constants
const DEBOUNCE_DELAY = 300;
const DEFAULT_PAGE_SIZE = 10;

// Success Modal Component
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully.", 
  buttonText = "Continue"
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h3 id="success-modal-title" className="text-lg font-semibold text-gray-900 text-center mb-2">
          {title}
        </h3>

        <p id="success-modal-description" className="text-gray-600 text-center mb-6">
          {message}
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            autoFocus
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Error Alert Component
const ErrorAlert = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-800 text-sm">{error}</p>
        <div className="flex gap-3 mt-2">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="text-red-600 hover:text-red-800 text-xs underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
          <button 
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for outside click detection
const useOutsideClick = (refs, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      const isOutside = refs.every(ref => 
        ref.current && !ref.current.contains(event.target)
      );
      
      if (isOutside) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [refs, callback]);
};

// Main AuditLogs Component
const AuditLogs = () => {
  const apiClient = useApiClient();
  
  // Refs for dropdown management
  const userRoleDropdownRef = useRef(null);
  const datePickerRef = useRef(null);
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    userRole: [],
    timeStamp: null
  });
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // API state
  const [auditLogs, setAuditLogs] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  // Close dropdowns when clicking outside
  useOutsideClick([userRoleDropdownRef, datePickerRef], () => {
    setShowUserRoleDropdown(false);
    setShowDatePicker(false);
  });

  // Check API availability on mount
  useEffect(() => {
    const checkApiAvailability = () => {
      const available = Boolean(apiClient && auditLogsApi && auditLogsUtils);
      setIsApiAvailable(available);
      
      if (!available) {
        console.warn('API not available - please check API configuration');
        setError('API configuration is missing. Please contact your administrator.');
        setLoading(false);
      }
    };

    checkApiAvailability();
  }, [apiClient]);

  // Load initial data
  useEffect(() => {
    if (isApiAvailable) {
      loadAuditLogs();
    }
  }, [isApiAvailable]);

  // Load user roles after audit logs are loaded 
  useEffect(() => {
    if (isApiAvailable && auditLogs.length > 0) {
      loadUserRoles();
    }
  }, [isApiAvailable, auditLogs.length]);

  // Load logs when filters or pagination change
  useEffect(() => {
    if (isApiAvailable) {
      loadAuditLogs();
    }
  }, [selectedFilters, pagination.currentPage, debouncedSearchTerm, isApiAvailable]);

  const loadAuditLogs = useCallback(async () => {
    if (!isApiAvailable) return;

    try {
      setLoading(true);
      setError(null);
      
      const filters = auditLogsUtils.validateFilters({
        userRole: selectedFilters.userRole,
        timeStamp: selectedFilters.timeStamp,
        search: debouncedSearchTerm
      });
      
      console.log('🔍 Loading audit logs with filters:', filters);
      
      const response = await auditLogsApi.getAll(
        apiClient, 
        pagination.currentPage, 
        pagination.pageSize, 
        filters
      );
      
      // Handle the actual API response structure
      let logs, newPagination;
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Direct API response structure
        logs = response.data.data;
        newPagination = response.data.pagination || {};
      } else if (auditLogsUtils?.parseGetAllResponse) {
        // Fallback to utility function
        const parsed = auditLogsUtils.parseGetAllResponse(response);
        logs = parsed.logs;
        newPagination = parsed.pagination;
      } else {
        logs = [];
        newPagination = {};
      }
      
      // Transform the logs to match component expectations
      const transformedLogs = logs.map(log => {
        // Determine the  (admin or user) and their role
        const actor = log.admin?.fullname ? log.admin : log.user;
        const actorName = actor?.fullname || 'System';
        const userRole = actor?.role || 'Unknown';
        
        // Format timestamp
        const timestamp = new Date(log.timestamp);
        const time = timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        const date = timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        return {
          id: log.id,
          logId: log.id,
          action: log.action,
          userRole: userRole,
          userName: actorName,
          time: time,
          date: date,
          timestamp: log.timestamp,
          originalLog: log // Keep original for reference
        };
      });
      
      setAuditLogs(transformedLogs);
      
      //  Properly merge pagination data while preserving current page
      setPagination(prev => ({
        ...prev,
        total: newPagination.total || 0,
        totalPages: newPagination.totalPages || 1,
        // Only update currentPage if it's explicitly provided and valid
        ...(newPagination.currentPage && newPagination.currentPage !== prev.currentPage 
          ? { currentPage: Math.max(1, Math.min(newPagination.currentPage, newPagination.totalPages || 1)) }
          : {})
      }));
      
      console.log('✅ Audit logs loaded successfully:', transformedLogs.length, 'logs');
    } catch (error) {
      console.error('❌ Failed to load audit logs:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to load audit logs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isApiAvailable, apiClient, selectedFilters, pagination.currentPage, pagination.pageSize, debouncedSearchTerm]);

  const loadUserRoles = useCallback(async () => {
    if (!isApiAvailable) return;

    try {
      console.log('👥 Loading user roles...');
      
      // First try to get roles from API
      let roles = [];
      try {
        roles = await auditLogsApi.getUserRoles(apiClient);
      } catch (apiError) {
        console.warn('⚠️ API getUserRoles failed, extracting from current data:', apiError);
      }
      
      // If API doesn't provide roles or returns empty, extract from current logs
      if (!Array.isArray(roles) || roles.length === 0) {
        // Extract unique roles from current audit logs
        const currentRoles = new Set();
        auditLogs.forEach(log => {
          if (log.userRole && log.userRole !== 'Unknown') {
            currentRoles.add(log.userRole);
          }
        });
        
        // Add common roles that might appear
        currentRoles.add('Super Admin');
        currentRoles.add('Admin');
        currentRoles.add('Citizen');
        currentRoles.add('System');
        
        roles = Array.from(currentRoles).sort();
      }
      
      setUserRoles(roles);
      console.log('✅ User roles loaded:', roles);
    } catch (error) {
      console.error('❌ Failed to load user roles:', error);
      // Fallback to basic roles
      const fallbackRoles = ['Super Admin', 'Admin', 'Citizen', 'System'];
      setUserRoles(fallbackRoles);
      console.log('🔄 Using fallback roles:', fallbackRoles);
    }
  }, [isApiAvailable, apiClient, auditLogs]);

  const handleUserRoleFilter = useCallback((role) => {
    setSelectedFilters(prev => ({
      ...prev,
      userRole: prev.userRole.includes(role) 
        ? prev.userRole.filter(r => r !== role)
        : [...prev.userRole, role]
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setShowUserRoleDropdown(false);
  }, []);

  const handleDateChange = useCallback((e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedFilters(prev => ({ ...prev, timeStamp: date }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setShowDatePicker(false);
  }, []);

  const removeFilter = useCallback((type, value) => {
    if (type === 'userRole') {
      setSelectedFilters(prev => ({
        ...prev,
        userRole: prev.userRole.filter(r => r !== value)
      }));
    } else if (type === 'timeStamp') {
      setSelectedFilters(prev => ({ ...prev, timeStamp: null }));
      setSelectedDate('');
    }
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters({ userRole: [], timeStamp: null });
    setSelectedDate('');
    setSearchTerm('');
    // Reset to first page when filters are cleared
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const exportToPDF = useCallback(async () => {
    try {
      setExporting(true);
      setError(null);
      
      if (isApiAvailable && auditLogsApi) {
        try {
          const filters = auditLogsUtils.validateFilters({
            userRole: selectedFilters.userRole,
            timeStamp: selectedFilters.timeStamp,
            search: debouncedSearchTerm
          });
          
          console.log('📥 Exporting logs from API with filters:', filters);
          const blob = await auditLogsApi.exportLogs(apiClient, filters);
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log('✅ API export successful');
        } catch (apiError) {
          console.warn('⚠️ API export failed, falling back to client-side export:', apiError);
          throw apiError;
        }
      } else {
        // Client-side CSV export fallback
        const headers = ['Log ID', 'User Role', 'User Name', 'Action Type', 'Time Stamp'];
        const csvContent = [
          headers.join(','),
          ...auditLogs.map(log => [
            `"${log.logId || log.id}"`,
            `"${log.userRole || ''}"`,
            `"${log.userName || ''}"`,
            `"${log.action || ''}"`,
            `"${log.time || ''} ${log.date || ''}"`
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Export failed:', error);
      setError('Failed to export audit logs. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [isApiAvailable, auditLogs, selectedFilters, debouncedSearchTerm, apiClient]);

  const handlePageChange = useCallback((page) => {
    const targetPage = Math.max(1, Math.min(page, pagination.totalPages));
    
    if (targetPage !== pagination.currentPage) {
      console.log(`📄 Changing page from ${pagination.currentPage} to ${targetPage}`);
      setPagination(prev => ({ 
        ...prev, 
        currentPage: targetPage 
      }));
    }
  }, [pagination.currentPage, pagination.totalPages]);

  const retryLoadData = useCallback(() => {
    setError(null);
    if (isApiAvailable) {
      loadAuditLogs();
      loadUserRoles();
    }
  }, [isApiAvailable, loadAuditLogs, loadUserRoles]);

  // Memoized filtered logs for client-side filtering when API is not available
  const filteredLogs = useMemo(() => {
    if (isApiAvailable) return auditLogs;
    
    let filtered = auditLogs.filter(log => {
      // Search filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = [
          log.logId,
          log.userRole,
          log.action,
          log.userName
        ].some(field => field?.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // User role filter
      if (selectedFilters.userRole.length > 0) {
        if (!selectedFilters.userRole.includes(log.userRole)) return false;
      }
      
      // Date filter (simplified for client-side)
      if (selectedFilters.timeStamp) {
        if (!log.date?.includes(selectedFilters.timeStamp)) return false;
      }
      
      return true;
    });

    // Client-side pagination
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filtered.slice(startIndex, endIndex);
  }, [auditLogs, debouncedSearchTerm, selectedFilters, isApiAvailable, pagination.currentPage, pagination.pageSize]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    if (isApiAvailable) {
      // Server-side pagination
      const totalLogs = pagination.total;
      const currentPage = pagination.currentPage;
      const pageSize = pagination.pageSize;
      const totalPages = pagination.totalPages;
      
      const startIndex = (currentPage - 1) * pageSize + 1;
      const endIndex = Math.min(currentPage * pageSize, totalLogs);
      
      return {
        startIndex: totalLogs > 0 ? startIndex : 0,
        endIndex,
        totalLogs,
        totalPages
      };
    } else {
      // Client-side pagination
      const allFilteredLogs = auditLogs.filter(log => {
        // Apply the same filters as above
        if (debouncedSearchTerm) {
          const searchLower = debouncedSearchTerm.toLowerCase();
          const matchesSearch = [
            log.logId,
            log.userRole,
            log.action,
            log.userName
          ].some(field => field?.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return false;
        }
        
        if (selectedFilters.userRole.length > 0) {
          if (!selectedFilters.userRole.includes(log.userRole)) return false;
        }
        
        if (selectedFilters.timeStamp) {
          if (!log.date?.includes(selectedFilters.timeStamp)) return false;
        }
        
        return true;
      });

      const totalLogs = allFilteredLogs.length;
      const currentPage = pagination.currentPage;
      const pageSize = pagination.pageSize;
      const totalPages = Math.ceil(totalLogs / pageSize);
      
      const startIndex = (currentPage - 1) * pageSize + 1;
      const endIndex = Math.min(currentPage * pageSize, totalLogs);
      
      return {
        startIndex: totalLogs > 0 ? startIndex : 0,
        endIndex,
        totalLogs,
        totalPages
      };
    }
  }, [pagination, auditLogs, debouncedSearchTerm, selectedFilters, isApiAvailable]);

  // Update pagination state for client-side when total pages change
  useEffect(() => {
    if (!isApiAvailable) {
      const newTotalPages = paginationInfo.totalPages;
      setPagination(prev => ({
        ...prev,
        totalPages: newTotalPages,
        total: paginationInfo.totalLogs,
        // Ensure current page is within bounds
        currentPage: Math.max(1, Math.min(prev.currentPage, newTotalPages))
      }));
    }
  }, [paginationInfo.totalPages, paginationInfo.totalLogs, isApiAvailable]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      // CMD/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search logs..."]');
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex text-sm text-gray-500">
          <li>
            <a href="/dashboard" className="hover:text-gray-700">Dashboard</a>
          </li>
          <li className="mx-2" aria-hidden="true">›</li>
          <li className="text-gray-900" aria-current="page">Audit Logs</li>
        </ol>
      </nav>

      {/* Error Alert */}
      <ErrorAlert 
        error={error} 
        onDismiss={() => setError(null)}
        onRetry={retryLoadData}
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
              <span 
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                aria-label={`${loading ? 'Loading' : paginationInfo.totalLogs} total logs`}
              >
                {loading ? '...' : paginationInfo.totalLogs}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-16 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search audit logs"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </div>
              
              {/* Export Button */}
              <button 
                onClick={exportToPDF}
                disabled={exporting || loading || (isApiAvailable ? paginationInfo.totalLogs === 0 : filteredLogs.length === 0)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={exporting ? 'Exporting logs...' : 'Export audit logs'}
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FiDownloadCloud className="w-4 h-4" aria-hidden="true" />
                )}
                {exporting ? 'Exporting...' : 'Export Log'}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedFilters.userRole.length > 0 || selectedFilters.timeStamp || searchTerm) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Active filters">
                {selectedFilters.userRole.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {role}
                    <button 
                      onClick={() => removeFilter('userRole', role)}
                      className="hover:bg-blue-200 rounded p-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      aria-label={`Remove ${role} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                
                {selectedFilters.timeStamp && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {auditLogsUtils?.formatDateForDisplay?.(selectedFilters.timeStamp) || selectedFilters.timeStamp}
                    <button 
                      onClick={() => removeFilter('timeStamp')}
                      className="hover:bg-blue-200 rounded p-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      aria-label="Remove date filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                    Search: "{searchTerm}"
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="hover:bg-green-200 rounded p-0.5 focus:outline-none focus:ring-1 focus:ring-green-400"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-1 focus:ring-gray-400 rounded px-1"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" aria-hidden="true" />
              <span className="text-gray-600">Loading audit logs...</span>
            </div>
          ) : (
            <table className="w-full" role="table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Log ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                    <button 
                      className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                      onClick={() => setShowUserRoleDropdown(!showUserRoleDropdown)}
                      aria-expanded={showUserRoleDropdown}
                      aria-haspopup="true"
                      aria-label="Filter by user role"
                    >
                      User Role
                      <ChevronDown className="w-3 h-3" aria-hidden="true" />
                    </button>
                    
                    {showUserRoleDropdown && (
                      <div 
                        ref={userRoleDropdownRef}
                        className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        role="listbox"
                        aria-label="User role filters"
                      >
                        {userRoles.map((role) => (
                          <label key={role} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFilters.userRole.includes(role)}
                              onChange={() => handleUserRoleFilter(role)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              aria-describedby={`role-${role.replace(/\s+/g, '-').toLowerCase()}`}
                            />
                            <span 
                              id={`role-${role.replace(/\s+/g, '-').toLowerCase()}`}
                              className="text-sm text-gray-700"
                            >
                              {role}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                    <button 
                      className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      aria-expanded={showDatePicker}
                      aria-haspopup="true"
                      aria-label="Filter by date"
                    >
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      Time Stamp
                      <ChevronDown className="w-3 h-3" aria-hidden="true" />
                    </button>
                    
                    {showDatePicker && (
                      <div 
                        ref={datePickerRef}
                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3"
                      >
                        <label htmlFor="date-filter" className="sr-only">
                          Filter by date
                        </label>
                        <input
                          id="date-filter"
                          type="date"
                          value={selectedDate}
                          onChange={handleDateChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" aria-hidden="true" />
                        <p>No audit logs found matching your criteria.</p>
                        {(selectedFilters.userRole.length > 0 || selectedFilters.timeStamp || searchTerm) && (
                          <button
                            onClick={clearAllFilters}
                            className="text-blue-600 hover:text-blue-700 text-sm underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={log.id || index} className="hover:bg-gray-50 focus-within:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {log.logId || log.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            log.userRole === 'Super Admin' 
                              ? 'bg-purple-100 text-purple-800'
                              : log.userRole === 'Admin'
                              ? 'bg-blue-100 text-blue-800'
                              : log.userRole === 'Citizen'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {log.userRole}
                          </span>
                          {log.userName && log.userName !== 'System' && (
                            <span className="text-xs text-gray-500 mt-1">{log.userName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={log.action}>
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <time className="font-medium">{log.time}</time>
                          <time className="text-xs text-gray-400">{log.date}</time>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && paginationInfo.totalLogs > 0 && paginationInfo.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="flex items-center gap-1 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to previous page"
            >
              <span>←</span>
              Previous
            </button>
            
            <nav className="flex items-center gap-2" aria-label="Pagination">
              {(() => {
                const { currentPage } = pagination;
                const { totalPages } = paginationInfo;
                const pages = [];
                
                // Always show first page
                if (totalPages > 0) {
                  pages.push(1);
                }
                
                // Show ellipsis if needed
                if (currentPage > 4) {
                  pages.push('...');
                }
                
                // Show pages around current page
                const startPage = Math.max(2, currentPage - 1);
                const endPage = Math.min(totalPages - 1, currentPage + 1);
                
                for (let i = startPage; i <= endPage; i++) {
                  if (i > 1 && i < totalPages) {
                    pages.push(i);
                  }
                }
                
                // Show ellipsis if needed
                if (currentPage < totalPages - 3) {
                  pages.push('...');
                }
                
                // Show last page if there are multiple pages
                if (totalPages > 1) {
                  pages.push(totalPages);
                }
                
                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-gray-400">
                        {page}
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        page === currentPage
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </nav>
            
            <button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= paginationInfo.totalPages}
              className="flex items-center gap-1 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to next page"
            >
              Next
              <span>→</span>
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {!loading && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500" role="status" aria-live="polite">
            Showing {paginationInfo.startIndex} to {paginationInfo.endIndex} of {paginationInfo.totalLogs} results
          </div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Export Successful!"
        message="Your audit logs have been successfully exported as a CSV file."
        buttonText="Continue"
      />
    </div>
  );
};

export default AuditLogs;