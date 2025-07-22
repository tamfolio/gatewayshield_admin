import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Trash2, Eye, Share } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';

// API service
const API_BASE_URL = 'https://admin-api.thegatewayshield.com/api/v1/feedback/generalFeedback';

const feedbackAPI = {
  getAllFeedbacks: async (page = 1, size = 10) => {
    const response = await fetch(`${API_BASE_URL}/all-feedbacks?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch feedbacks');
    return response.json();
  },
  
  deleteFeedback: async (feedbackId) => {
    const response = await fetch(`${API_BASE_URL}/delete-feedback`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackId }),
    });
    if (!response.ok) throw new Error('Failed to delete feedback');
    return response.json();
  },
  
  publishFeedback: async (feedbackId) => {
    const response = await fetch(`${API_BASE_URL}/publish-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackId }),
    });
    if (!response.ok) throw new Error('Failed to publish feedback');
    return response.json();
  }
};

// Utility function to safely get array
const safeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.feedbacks)) return data.feedbacks;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

// Skeleton Components
const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {/* Type */}
    <td className="py-3 px-4">
      <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
    </td>
    {/* Officer */}
    <td className="py-3 px-4">
      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    {/* Station */}
    <td className="py-3 px-4">
      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    {/* Comment */}
    <td className="py-3 px-4">
      <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    {/* Date */}
    <td className="py-3 px-4">
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    {/* Status */}
    <td className="py-3 px-4">
      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
    </td>
    {/* Actions */}
    <td className="py-3 px-4">
      <div className="flex gap-2">
        <div className="w-12 h-7 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-7 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-7 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </td>
  </tr>
);

const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="w-64 h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex gap-2">
        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="overflow-x-auto relative">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
            <th className="text-left py-3 px-4">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
            <th className="text-left py-3 px-4">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
            <th className="text-left py-3 px-4">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
            <th className="text-left py-3 px-4">
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
            <th className="text-left py-3 px-4">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
            <th className="text-left py-3 px-4">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination Skeleton */}
    <div className="mt-6 flex items-center justify-between">
      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Reusable Button
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

// Error Display
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

// Confirmation Modal
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading = false, variant = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

// Reusable DropdownFilter component
const DropdownFilter = ({ label, options = [], selected, setSelected, showDropdown, setShowDropdown, searchTerm, setSearchTerm, disabled = false }) => {
  const filteredOptions = useMemo(() => {
    const safeOptions = Array.isArray(options) ? options : [];
    const safeSearchTerm = searchTerm || '';
    return safeOptions.filter(option =>
      option && typeof option === 'string' && option.toLowerCase().includes(safeSearchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  return (
    <th className="text-left py-3 px-4 font-medium text-gray-600">
      <div className="relative flex items-center gap-2">
        <span>{label}</span>
        <button 
          onClick={() => !disabled && setShowDropdown(prev => !prev)} 
          className={`text-gray-500 hover:text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          <ChevronDown size={16} />
        </button>
        {showDropdown && !disabled && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}`}
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
            />
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    setSelected(option);
                    setShowDropdown(false);
                    setSearchTerm('');
                  }}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
    </th>
  );
};

// Empty State Component
const EmptyState = ({ hasFilters }) => (
  <tr>
    <td colSpan="7" className="py-12 px-4 text-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {hasFilters ? 'No matching feedback found' : 'No feedback data yet'}
        </h3>
        <p className="text-gray-500 text-sm">
          {hasFilters 
            ? 'Try adjusting your search or filter criteria.' 
            : 'Feedback submissions will appear here once available.'}
        </p>
      </div>
    </td>
  </tr>
);

const GeneralFeedbackTable = () => {
  // Initialize with empty state - will show skeleton first
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [officerSearchTerm, setOfficerSearchTerm] = useState('');
  const [stationSearchTerm, setStationSearchTerm] = useState('');
  const [typeSearchTerm, setTypeSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', feedbackId: '', title: '', message: '' });

  const itemsPerPage = 10;

  // Fetch feedbacks from API
  const fetchFeedbacks = async (page = 1, showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const response = await feedbackAPI.getAllFeedbacks(page, itemsPerPage);
      console.log('API Response:', response);
      
      const feedbackData = safeArray(response);
      setData(feedbackData);
      setTotalItems(response?.total || feedbackData.length);
      setTotalPages(response?.totalPages || Math.ceil(feedbackData.length / itemsPerPage));
      
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Safe data processing with proper array checks
  const filterOptions = useMemo(() => {
    try {
      const safeData = Array.isArray(data) ? data : [];
      const validData = safeData.filter(item => item && typeof item === 'object');
      
      return {
        types: [...new Set(validData.map(item => item?.type).filter(type => type && typeof type === 'string'))].sort(),
        officers: [...new Set(validData.map(item => item?.officer).filter(officer => officer && typeof officer === 'string'))].sort(),
        stations: [...new Set(validData.map(item => item?.station).filter(station => station && typeof station === 'string'))].sort()
      };
    } catch (err) {
      console.error('Error processing filter options:', err);
      return { types: [], officers: [], stations: [] };
    }
  }, [data]);

  const filteredData = useMemo(() => {
    try {
      const safeData = Array.isArray(data) ? data : [];
      const validData = safeData.filter(item => item && typeof item === 'object');
      
      return validData.filter(item => {
        if (selectedType && item.type !== selectedType) return false;
        if (selectedOfficer && item.officer !== selectedOfficer) return false;
        if (selectedStation && item.station !== selectedStation) return false;
        if (searchTerm) {
          const safeSearchTerm = searchTerm.toLowerCase();
          return Object.values(item).some(val => {
            if (val && typeof val === 'string') {
              return val.toLowerCase().includes(safeSearchTerm);
            }
            return false;
          });
        }
        return true;
      });
    } catch (err) {
      console.error('Error filtering data:', err);
      return [];
    }
  }, [data, selectedType, selectedOfficer, selectedStation, searchTerm]);

  const paginatedData = useMemo(() => {
    try {
      const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];
      const start = (currentPage - 1) * itemsPerPage;
      return safeFilteredData.slice(start, start + itemsPerPage);
    } catch (err) {
      console.error('Error paginating data:', err);
      return [];
    }
  }, [filteredData, currentPage]);

  // Handle actions with error handling
  const handleDelete = async (feedbackId) => {
    try {
      setActionLoading(prev => ({ ...prev, [feedbackId]: true }));
      await feedbackAPI.deleteFeedback(feedbackId);
      
      setData(prev => {
        const safeData = Array.isArray(prev) ? prev : [];
        return safeData.filter(item => item.id !== feedbackId);
      });
      
      setTotalItems(prev => Math.max(0, prev - 1));
      setConfirmModal({ isOpen: false, type: '', feedbackId: '', title: '', message: '' });
      
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  const handlePublish = async (feedbackId) => {
    try {
      setActionLoading(prev => ({ ...prev, [feedbackId]: true }));
      await feedbackAPI.publishFeedback(feedbackId);
      
      setData(prev => {
        const safeData = Array.isArray(prev) ? prev : [];
        return safeData.map(item => 
          item.id === feedbackId ? { ...item, status: 'published' } : item
        );
      });
      
      setConfirmModal({ isOpen: false, type: '', feedbackId: '', title: '', message: '' });
      
    } catch (err) {
      console.error('Error publishing feedback:', err);
      alert('Failed to publish feedback: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [feedbackId]: false }));
    }
  };

  const showConfirmation = (type, feedbackId, title, message) => {
    setConfirmModal({ isOpen: true, type, feedbackId, title, message });
  };

  const handleConfirm = () => {
    const { type, feedbackId } = confirmModal;
    if (type === 'delete') {
      handleDelete(feedbackId);
    } else if (type === 'publish') {
      handlePublish(feedbackId);
    }
  };

  const handleExportCSV = () => {
    try {
      const dataToExport = Array.isArray(filteredData) ? filteredData : [];
      const headers = ['Feedback Type', 'Officer', 'Station', 'Comment', 'Date', 'Status'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => {
          const safeRow = [
            row?.type || '',
            row?.officer || '',
            row?.station || '',
            (row?.comment || '').replace(/"/g, '""'),
            row?.date || '',
            row?.status || 'pending'
          ];
          return safeRow.map(val => `"${val}"`).join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', 'feedback_export.csv');
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedOfficer('');
    setSelectedStation('');
    setTypeSearchTerm('');
    setOfficerSearchTerm('');
    setStationSearchTerm('');
    setCurrentPage(1);
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedOfficer, selectedStation, searchTerm]);

  // Initial data fetch
  useEffect(() => {
    fetchFeedbacks(1, true);
  }, []);

  // Calculate pagination
  const localTotalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const activeFiltersCount = [selectedType, selectedOfficer, selectedStation].filter(Boolean).length;
  const hasSearchOrFilters = searchTerm || activeFiltersCount > 0;

  // Show skeleton during initial load
  if (loading && !initialLoadComplete) {
    return <SkeletonTable rows={8} />;
  }

  // Show error state
  if (error && !initialLoadComplete) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback..."
            className="pl-10 pr-16 w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!initialLoadComplete}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 bg-gray-100 border border-gray-300 rounded">⌘K</kbd>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV} 
            className="flex items-center gap-2"
            disabled={!initialLoadComplete || filteredData.length === 0}
          >
            <FiDownloadCloud className="w-3 h-3" />
            Export CSV ({filteredData?.length || 0})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters} 
            disabled={!hasSearchOrFilters || !initialLoadComplete}
          >
            Clear All {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchFeedbacks(currentPage, true)}
            loading={loading}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && initialLoadComplete && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            API connection issue: {error}
          </p>
        </div>
      )}

      {/* Filter tags */}
      {activeFiltersCount > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {selectedType && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
              Type: {selectedType}
              <button onClick={() => setSelectedType('')} className="hover:bg-green-200 rounded-full p-0.5">×</button>
            </span>
          )}
          {selectedOfficer && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
              Officer: {selectedOfficer}
              <button onClick={() => setSelectedOfficer('')} className="hover:bg-blue-200 rounded-full p-0.5">×</button>
            </span>
          )}
          {selectedStation && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
              Station: {selectedStation}
              <button onClick={() => setSelectedStation('')} className="hover:bg-purple-200 rounded-full p-0.5">×</button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <DropdownFilter
                label="Feedback Type"
                options={filterOptions.types}
                selected={selectedType}
                setSelected={setSelectedType}
                showDropdown={showTypeDropdown}
                setShowDropdown={setShowTypeDropdown}
                searchTerm={typeSearchTerm}
                setSearchTerm={setTypeSearchTerm}
                disabled={!initialLoadComplete}
              />
              <DropdownFilter
                label="Officer"
                options={filterOptions.officers}
                selected={selectedOfficer}
                setSelected={setSelectedOfficer}
                showDropdown={showOfficerDropdown}
                setShowDropdown={setShowOfficerDropdown}
                searchTerm={officerSearchTerm}
                setSearchTerm={setOfficerSearchTerm}
                disabled={!initialLoadComplete}
              />
              <DropdownFilter
                label="Station"
                options={filterOptions.stations}
                selected={selectedStation}
                setSelected={setSelectedStation}
                showDropdown={showStationDropdown}
                setShowDropdown={setShowStationDropdown}
                searchTerm={stationSearchTerm}
                setSearchTerm={setStationSearchTerm}
                disabled={!initialLoadComplete}
              />
              <th className="text-left py-3 px-4 font-medium text-gray-600">Comment</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                      Compliment: 'bg-green-100 text-green-800',
                      Complaint: 'bg-red-100 text-red-800',
                      Suggestion: 'bg-blue-100 text-blue-800'
                    }[item.type] || 'bg-gray-100 text-gray-800'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{item.officer}</td>
                  <td className="py-3 px-4 text-sm">{item.station}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="max-w-xs truncate" title={item.comment}>{item.comment}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{item.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-blue-600">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {item.status !== 'published' && (
                        <Button 
                          variant="success" 
                          size="sm"
                          loading={actionLoading[item.id]}
                          onClick={() => showConfirmation(
                            'publish', 
                            item.id, 
                            'Publish Feedback', 
                            'Are you sure you want to publish this feedback?'
                          )}
                        >
                          <Share className="w-4 h-4" />
                          Publish
                        </Button>
                      )}
                      <button 
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 disabled:opacity-50" 
                        title="Delete"
                        disabled={actionLoading[item.id]}
                        onClick={() => showConfirmation(
                          'delete', 
                          item.id, 
                          'Delete Feedback', 
                          'Are you sure you want to delete this feedback? This action cannot be undone.'
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyState hasFilters={hasSearchOrFilters} />
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {localTotalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
              disabled={currentPage === 1}
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
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
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
              disabled={currentPage === localTotalPages}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', feedbackId: '', title: '', message: '' })}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={actionLoading[confirmModal.feedbackId]}
        variant={confirmModal.type === 'delete' ? 'danger' : 'success'}
      />
    </div>
  );
};

export default GeneralFeedbackTable;