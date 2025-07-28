import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Trash2, Eye, Share, Filter, X, Calendar, ChevronDown } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { generalFeedbackApi, feedbackUtils } from '../../../Utils/apiClient';
import PublishFeedback from './components/PublishFeedback';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import DeleteSuccessModal from './components/DeleteSuccessModal';

// Table Utility Functions
const tableUtils = {
  extractApiResponseData: (response) => {
    // Handle the nested data structure 
    if (response?.data?.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || {
          total: response.data.data.length,
          currentPage: 1,
          totalPages: 1,
          pageSize: 10
        }
      };
    }
    
    // Fallback for different response structures
    if (response?.data) {
      return {
        data: Array.isArray(response.data) ? response.data : [],
        pagination: {
          total: Array.isArray(response.data) ? response.data.length : 0,
          currentPage: 1,
          totalPages: 1,
          pageSize: 10
        }
      };
    }
    
    return {
      data: [],
      pagination: { total: 0, currentPage: 1, totalPages: 1, pageSize: 10 }
    };
  },

  transformGeneralFeedbackData: (rawData) => {
    if (!Array.isArray(rawData)) {
      console.warn('Expected array for feedback data, got:', typeof rawData);
      return [];
    }

    return rawData.map((item, index) => {
      // Handle different possible field names from API
      const feedbackId = item.id || item.feedbackId || `temp-${index}`;
      const feedbackType = item.feedbackType || item.type || 'Unknown';
      const officerName = item.officerName || item.officer || '';
      const stationName = item.stationName || item.station || '';
      const comment = item.comment || item.commentText || '';
      const createdAt = item.createdAt || item.date || item.submissionDate || '';
      
      // Format date
      let formattedDate = '';
      if (createdAt) {
        try {
          const date = new Date(createdAt);
          formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (err) {
          formattedDate = createdAt;
        }
      }

      return {
        id: feedbackId,
        feedbackId: feedbackId,
        type: feedbackType,
        officer: officerName || 'N/A',
        station: stationName,
        comment: comment,
        date: formattedDate,
        dateRaw: createdAt, 
        status: item.status || 'pending',
        // Keep original data 
        original: item
      };
    });
  },

  // Format date helper
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  }
};

// Skeleton Components
const SkeletonPulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100">
    <td className="py-3 px-4"><SkeletonPulse className="h-6 w-20 rounded-full" /></td>
    <td className="py-3 px-4"><SkeletonPulse className="h-4 w-24" /></td>
    <td className="py-3 px-4"><SkeletonPulse className="h-4 w-20" /></td>
    <td className="py-3 px-4"><SkeletonPulse className="h-4 w-48" /></td>
    <td className="py-3 px-4"><SkeletonPulse className="h-4 w-16" /></td>
    <td className="py-3 px-4">
      <div className="flex gap-2">
        <SkeletonPulse className="h-7 w-12" />
        <SkeletonPulse className="h-7 w-8" />
      </div>
    </td>
  </tr>
);

const TableSkeleton = ({ rows = 8 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <SkeletonPulse className="h-10 w-64" />
      <div className="flex gap-2">
        <SkeletonPulse className="h-8 w-20" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="text-left py-3 px-4">
                <SkeletonPulse className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Reusable Components
const Button = ({ children, variant = "primary", size = "md", className = "", disabled = false, loading = false, ...props }) => {
  const base = "font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || loading} 
      {...props}
    >
      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-center py-8 bg-red-50 rounded-lg border border-red-200">
      <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
      <div className="text-center">
        <p className="text-red-800 font-medium">Failed to load feedback data</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  </div>
);

const EmptyState = ({ hasFilters, error }) => (
  <tr>
    <td colSpan="6" className="py-12 px-4 text-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {error ? (
            <AlertCircle className="w-8 h-8 text-red-400" />
          ) : (
            <Search className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error ? 'API Connection Issue' : 
           hasFilters ? 'No matching feedback found' : 'No feedback data available'}
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          {error ? 'There was a problem loading the feedback data.' :
           hasFilters ? 'Try adjusting your search criteria.' : 
           'No feedback submissions have been recorded yet.'}
        </p>
        {error && (
          <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded max-w-md">
            <strong>Debug Info:</strong><br/>
            Check the browser console for detailed API response information.
          </div>
        )}
      </div>
    </td>
  </tr>
);

// Dropdown Components
const Dropdown = ({ isOpen, onToggle, children, className = "" }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {children}
    </div>
  );
};

const FeedbackTypeDropdown = ({ value, onChange, isOpen, onToggle }) => {
  const feedbackTypes = ['All Types', 'Suggestion', 'Complaint', 'Compliment'];

  return (
    <Dropdown isOpen={isOpen} onToggle={onToggle}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="flex items-center gap-1"
      >
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {feedbackTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  onChange(type === 'All Types' ? '' : type);
                  onToggle(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                  (value || 'All Types') === type ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </Dropdown>
  );
};

const SearchableDropdown = ({ value, onChange, options, placeholder, isOpen, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return ['All', ...options];
    return ['All', ...options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    )];
  }, [options, searchTerm]);

  const handleSelect = (option) => {
    onChange(option === 'All' ? '' : option);
    onToggle(false);
    setSearchTerm('');
  };

  return (
    <Dropdown isOpen={isOpen} onToggle={onToggle}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="flex items-center gap-1"
      >
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-32 overflow-y-auto py-1">
            {filteredOptions.map((option, index) => (
              <button
                key={`${option}-${index}`}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                  (value || 'All') === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
            {filteredOptions.length === 1 && (
              <div className="px-3 py-2 text-xs text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </Dropdown>
  );
};

const DatePickerDropdown = ({ value, onChange, isOpen, onToggle }) => {
  const [selectedDate, setSelectedDate] = useState(value || '');

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    onChange(date);
    onToggle(false);
  };

  const clearDate = () => {
    setSelectedDate('');
    onChange('');
    onToggle(false);
  };

  return (
    <Dropdown isOpen={isOpen} onToggle={onToggle}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="flex items-center gap-1"
      >
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={clearDate}
                className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </Dropdown>
  );
};

// Sortable Header Component with Dropdown Filter
const SortableFilterHeader = ({ children, sortKey, currentSort, onSort, hasFilter, filterComponent, className = "" }) => {
  const isActive = currentSort.key === sortKey;
  const isAsc = isActive && currentSort.direction === 'asc';

  return (
    <th className={`text-left py-3 px-4 font-medium text-gray-600 ${className}`}>
      <div className="flex flex-col gap-2">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded select-none"
          onClick={() => onSort(sortKey)}
        >
          {children}
          <IoIosArrowDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isActive 
                ? (isAsc ? 'rotate-180 text-blue-600' : 'rotate-0 text-blue-600')
                : 'text-gray-400'
            }`}
          />
        </div>
        {hasFilter && (
          <div className="w-full">
            {filterComponent}
          </div>
        )}
      </div>
    </th>
  );
};

const SortableHeader = ({ children, sortKey, currentSort, onSort, className = "" }) => {
  const isActive = currentSort.key === sortKey;
  const isAsc = isActive && currentSort.direction === 'asc';

  return (
    <th 
      className={`text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        <IoIosArrowDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isActive 
              ? (isAsc ? 'rotate-180 text-blue-600' : 'rotate-0 text-blue-600')
              : 'text-gray-400'
          }`}
        />
      </div>
    </th>
  );
};

const GeneralFeedbackTable = ({ apiClient }) => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState({});

  // Modal states
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ 
    isOpen: false, 
    feedbackId: '', 
    title: '', 
    message: '' 
  });
  const [deleteSuccessModal, setDeleteSuccessModal] = useState({
    isOpen: false,
    message: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    feedbackType: '',
    officer: '',
    station: '',
    date: ''
  });

  // Dropdown states
  const [dropdownStates, setDropdownStates] = useState({
    feedbackType: false,
    officer: false,
    station: false,
    date: false
  });

  // Modal states
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc' // Default to newest first
  });

  const itemsPerPage = 10;

  // Toggle dropdown function
  const toggleDropdown = (dropdownName, isOpen) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownName]: isOpen
    }));
  };

  // Get unique values for dropdowns
  const uniqueOfficers = useMemo(() => {
    const officers = [...new Set(data.map(item => item.officer).filter(officer => officer && officer !== 'N/A'))];
    return officers.sort();
  }, [data]);

  const uniqueStations = useMemo(() => {
    const stations = [...new Set(data.map(item => item.station).filter(station => station && station !== 'N/A'))];
    return stations.sort();
  }, [data]);

  // Fetch feedbacks from API
  const fetchFeedbacks = async (page = 1, showLoader = false) => {
    if (!apiClient) {
      console.log('⏳ API client not available, skipping fetch');
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      console.log(`🚀 Fetching feedbacks - Page: ${page}, Size: ${itemsPerPage}`);
      
      // Use your real API client
      const response = await generalFeedbackApi.getAllFeedbacks(apiClient, page, itemsPerPage);
      console.log('📡 Raw Table API Response:', JSON.stringify(response, null, 2));
      
      // Check if response has the expected structure
      if (!response || !response.data) {
        throw new Error('Invalid API response structure - missing data field');
      }
      
      // Use the table-specific utility functions
      const { data: extractedData, pagination } = tableUtils.extractApiResponseData(response);
      
      // Transform data using table-specific utility function
      const transformedData = tableUtils.transformGeneralFeedbackData(extractedData);
      
      console.log('📊 Transformed feedbacks:', transformedData);
      console.log('📊 Total items:', pagination.total);
      console.log('📊 Total pages:', pagination.totalPages);
      
      setData(transformedData);
      setTotalItems(pagination.total);
      setTotalPages(Math.max(1, pagination.totalPages));
      
    } catch (err) {
      console.error('❌ Error fetching feedbacks:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      
      setError(err.message);
      setData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Sorting function
  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'date') {
        // Use raw date for proper sorting
        aVal = new Date(a.dateRaw || a.date || 0);
        bVal = new Date(b.dateRaw || b.date || 0);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal ? bVal.toLowerCase() : '';
      }

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevSort => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    try {
      let filtered = data;
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
          Object.values(item).some(val => 
            val && typeof val === 'string' && val.toLowerCase().includes(searchLower)
          )
        );
      }
      
      // Apply feedback type filter
      if (filters.feedbackType) {
        filtered = filtered.filter(item => 
          item.type && item.type.toLowerCase() === filters.feedbackType.toLowerCase()
        );
      }
      
      // Apply officer filter
      if (filters.officer) {
        filtered = filtered.filter(item => 
          item.officer && item.officer.toLowerCase().includes(filters.officer.toLowerCase())
        );
      }
      
      // Apply station filter
      if (filters.station) {
        filtered = filtered.filter(item => 
          item.station && item.station.toLowerCase().includes(filters.station.toLowerCase())
        );
      }
      
      // Apply date filter
      if (filters.date) {
        const filterDate = new Date(filters.date);
        filtered = filtered.filter(item => {
          if (!item.dateRaw) return false;
          const itemDate = new Date(item.dateRaw);
          return itemDate.toDateString() === filterDate.toDateString();
        });
      }
      
      return filtered;
    } catch (err) {
      console.error('Error filtering data:', err);
      return [];
    }
  }, [data, searchTerm, filters]);

  // Sort and paginate filtered data
  const sortedAndPaginatedData = useMemo(() => {
    try {
      const sortedData = sortData(filteredData, sortConfig);
      const start = (currentPage - 1) * itemsPerPage;
      return sortedData.slice(start, start + itemsPerPage);
    } catch (err) {
      console.error('Error sorting/paginating data:', err);
      return [];
    }
  }, [filteredData, sortConfig, currentPage]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      feedbackType: '',
      officer: '',
      station: '',
      date: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle view feedback
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setPublishModalOpen(true);
  };

  // Handle delete action
  const handleDelete = async (feedbackId) => {
    if (!apiClient) {
      alert('API client not available');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [feedbackId]: true }));
      
      await generalFeedbackApi.deleteFeedback(apiClient, feedbackId);
      
      // Remove from local state
      setData(prev => prev.filter(item => (item.id || item.feedbackId) !== feedbackId));
      setTotalItems(prev => Math.max(0, prev - 1));
      
      // Close confirmation modal and show success modal
      setDeleteConfirmModal({ isOpen: false, feedbackId: '', title: '', message: '' });
      setDeleteSuccessModal({
        isOpen: true,
        message: 'Feedback has been successfully deleted.'
      });
      
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  // Handle publish action
  const handlePublish = async (feedbackId) => {
    if (!apiClient) {
      alert('API client not available');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [feedbackId]: true }));
      
      await generalFeedbackApi.publishFeedback(apiClient, feedbackId);
      
      // Update local state
      setData(prev => prev.map(item => 
        (item.id || item.feedbackId) === feedbackId ? { ...item, status: 'published' } : item
      ));
      
    } catch (err) {
      console.error('Error publishing feedback:', err);
      alert('Failed to publish feedback: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  const showDeleteConfirmation = (feedbackId, title, message) => {
    setDeleteConfirmModal({ isOpen: true, feedbackId, title, message });
  };

  const handleDeleteConfirm = () => {
    const { feedbackId } = deleteConfirmModal;
    handleDelete(feedbackId);
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Feedback Type', 'Officer', 'Station', 'Comment Text', 'Submission Date'];
      const csvContent = [
        headers.join(','),
        ...filteredData.map(row => [
          row.type || '',
          row.officer || '',
          row.station || '',
          (row.comment || '').replace(/"/g, '""'),
          row.date || ''
        ].map(val => `"${val}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', 'general_feedback_export.csv');
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setInitialLoadComplete(false);
    fetchFeedbacks(1, true);
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'compliment': return 'bg-green-100 text-green-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '') || searchTerm !== '';

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Initial data fetch
  useEffect(() => {
    if (apiClient) {
      fetchFeedbacks(1, true);
    }
  }, [apiClient]);

  // Calculate pagination info
  const localTotalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Show skeleton during initial load
  if (loading && !initialLoadComplete) {
    return <TableSkeleton rows={8} />;
  }

  // Show error state if initial load failed
  if (error && !initialLoadComplete) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback..."
            className="pl-10 pr-12 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded border">
            ⌘K
          </kbd>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              disabled={loading}
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV}
            disabled={filteredData.length === 0 || loading}
          >
            <FiDownloadCloud className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {searchTerm && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="hover:bg-blue-200 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.feedbackType && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
              Type: {filters.feedbackType}
              <button onClick={() => handleFilterChange('feedbackType', '')} className="hover:bg-green-200 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.officer && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
              Officer: {filters.officer}
              <button onClick={() => handleFilterChange('officer', '')} className="hover:bg-purple-200 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.station && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2">
              Station: {filters.station}
              <button onClick={() => handleFilterChange('station', '')} className="hover:bg-orange-200 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.date && (
            <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2">
              Date: {new Date(filters.date).toLocaleDateString()}
              <button onClick={() => handleFilterChange('date', '')} className="hover:bg-pink-200 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}


      {/* Error banner for ongoing issues */}
      {error && initialLoadComplete && data.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            API connection issue: {error}. Showing cached data.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Feedback Type</span>
                  <FeedbackTypeDropdown
                    value={filters.feedbackType}
                    onChange={(value) => handleFilterChange('feedbackType', value)}
                    isOpen={dropdownStates.feedbackType}
                    onToggle={(isOpen) => toggleDropdown('feedbackType', isOpen)}
                  />
                </div>
              </th>
              
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Officer</span>
                  <SearchableDropdown
                    value={filters.officer}
                    onChange={(value) => handleFilterChange('officer', value)}
                    options={uniqueOfficers}
                    placeholder="officers"
                    isOpen={dropdownStates.officer}
                    onToggle={(isOpen) => toggleDropdown('officer', isOpen)}
                  />
                </div>
              </th>
              
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Station</span>
                  <SearchableDropdown
                    value={filters.station}
                    onChange={(value) => handleFilterChange('station', value)}
                    options={uniqueStations}
                    placeholder="stations"
                    isOpen={dropdownStates.station}
                    onToggle={(isOpen) => toggleDropdown('station', isOpen)}
                  />
                </div>
              </th>
              
              <th className="text-left py-3 px-4 font-medium text-gray-600">Comment Text</th>
              
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Submission Date</span>
                  <DatePickerDropdown
                    value={filters.date}
                    onChange={(value) => handleFilterChange('date', value)}
                    isOpen={dropdownStates.date}
                    onToggle={(isOpen) => toggleDropdown('date', isOpen)}
                  />
                </div>
              </th>
              
              <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndPaginatedData.length > 0 ? (
              sortedAndPaginatedData.map(item => {
                const itemId = item.id || item.feedbackId;
                const isLoading = actionLoading[itemId];
                
                return (
                  <tr key={itemId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{item.officer || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">{item.station || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="max-w-xs truncate" title={item.comment}>
                        {item.comment || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.date || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewFeedback(item)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
                          disabled={isLoading}
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 disabled:opacity-50" 
                          title="Delete"
                          disabled={isLoading}
                          onClick={() => showDeleteConfirmation(
                            itemId, 
                            'Delete Feedback', 
                            'Are you sure you want to delete this feedback? This action cannot be undone.'
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <EmptyState hasFilters={hasActiveFilters} error={error} />
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {localTotalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(localTotalPages, 10) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum} 
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100 disabled:opacity-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(Math.min(localTotalPages, currentPage + 1))} 
              disabled={currentPage === localTotalPages || loading}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, feedbackId: '', title: '', message: '' })}
        onConfirm={handleDeleteConfirm}
        title={deleteConfirmModal.title}
        message={deleteConfirmModal.message}
        loading={actionLoading[deleteConfirmModal.feedbackId]}
      />

      {/* Delete Success Modal */}
      <DeleteSuccessModal
        isOpen={deleteSuccessModal.isOpen}
        onClose={() => setDeleteSuccessModal({ isOpen: false, message: '' })}
        message={deleteSuccessModal.message}
      />

      {/* Publish Feedback Modal */}
      {publishModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div 
            className="bg-gray-200 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto shadow-2xl border border-gray-200 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <PublishFeedback
                isOpen={publishModalOpen}
                onClose={() => {
                  setPublishModalOpen(false);
                  setSelectedFeedback(null);
                }}
                feedback={selectedFeedback}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralFeedbackTable;