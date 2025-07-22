import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// API Integration for Feedback Table
const feedbackAPI = {
  baseURL: 'https://admin-api.thegatewayshield.com/api/v1/feedback/caseReview',
  
  getAuthToken: () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  async getAllFeedbacks(page = 1, size = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...filters
    });

    const token = this.getAuthToken();
    const url = `${this.baseURL}/all-feedbacks?${params}`;
    
    try {
      console.log(`🚀 Feedback API Call: ${url}`);
      console.log(`🔑 Auth Token: ${token ? 'Present' : 'Missing'}`);
      console.log(`📋 Filters:`, filters);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors', // Explicitly handle CORS
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Feedback API Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Feedback API Detailed Error:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
        url: url
      });
      throw error;
    }
  }
};

// Station API (reusing from CaseReview)
const stationAPI = {
  baseURL: 'https://admin-api.thegatewayshield.com/api',
  
  getAuthToken: () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  async getStations() {
    const token = this.getAuthToken();
    
    try {
      const response = await fetch(`${this.baseURL}/v1/feedback/caseReview/stations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Station API Error:`, error);
      throw error;
    }
  }
};

// Reusable Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", size = "sm", className = "", disabled = false, ...props }) => {
  const baseClasses = "font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200", 
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Filter Badge Component (like in the original)
const FilterBadge = ({ children, onRemove, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800"
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${variants[variant]}`}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </span>
  );
};

// Star Rating Component
const StarRating = ({ rating, size = "sm" }) => {
  const stars = Math.floor(rating || 0);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`${i < stars ? 'text-yellow-400' : 'text-gray-300'} text-sm`}>
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-gray-500">{stars} Stars</span>
    </div>
  );
};

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

// Pagination Component (matching original design)
const TablePagination = ({ currentPage, totalPages, onPageChange, loading }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-gray-400">...</span>
            ) : (
              <Button
                variant={page === currentPage ? "primary" : "ghost"}
                onClick={() => onPageChange(page)}
                disabled={loading}
                className="min-w-[2rem]"
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Main Feedback Table Component
const CaseReviewTable = ({ filters = {}, onFilterChange }) => {
  const [tableData, setTableData] = useState({
    feedbacks: [],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState({
    rating: null,
    status: null,
    dateRange: null
  });
  const [stations, setStations] = useState([]);

  // Load stations for mapping
  useEffect(() => {
    loadStations();
  }, []);

  // Load feedbacks when page or filters change
  useEffect(() => {
    loadFeedbacks();
  }, [tableData.currentPage, searchTerm, filters]);

  const loadStations = async () => {
    try {
      const result = await stationAPI.getStations();
      if (result?.data) {
        setStations(result.data);
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  };

  const loadFeedbacks = async () => {
    setTableData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const apiFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(localFilters.rating && { rating: localFilters.rating }),
        ...(localFilters.status && { status: localFilters.status }),
        ...(filters.stationId && { stationId: filters.stationId }),
        ...(filters.incidentTypeId && { incidentTypeId: filters.incidentTypeId }),
        ...(filters.source && filters.source !== 'All' && { source: filters.source })
      };

      const response = await feedbackAPI.getAllFeedbacks(
        tableData.currentPage,
        tableData.pageSize,
        apiFilters
      );

      // Handle response structure
      const feedbacks = response.data || response.feedbacks || response || [];
      const total = response.total || response.totalCount || feedbacks.length;
      const totalPages = response.totalPages || Math.ceil(total / tableData.pageSize);

      setTableData(prev => ({
        ...prev,
        feedbacks: Array.isArray(feedbacks) ? feedbacks : [],
        totalPages: totalPages || 1,
        totalItems: total,
        loading: false
      }));

    } catch (error) {
      console.error('Error loading feedbacks:', error);
      
      // Fallback mock data (matching original table)
      const mockFeedbacks = [
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: 'Very respectful officer', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'ikeja', station: 'Ikeja', feedback: 'Station was locked', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: 'Add more female officers', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: '-', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: '-', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: '-', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: '-', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: '-', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: '-', rating: 5, date: 'Jan 4, 2025' },
        { id: '#23456', stationId: 'surulere', station: 'Surulere', feedback: '-', rating: 5, date: 'Jan 4, 2025' }
      ];

      setTableData(prev => ({
        ...prev,
        feedbacks: mockFeedbacks,
        totalPages: 10,
        totalItems: 100,
        loading: false,
        error: `API Error: ${error.message}. Showing sample data.`
      }));
    }
  };

  const handlePageChange = (page) => {
    setTableData(prev => ({ ...prev, currentPage: page }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setTableData(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setLocalFilters({
      rating: null,
      status: null,
      dateRange: null
    });
    setTableData(prev => ({ ...prev, currentPage: 1 }));
    
    // Also clear main dashboard filters if onFilterChange is available
    if (typeof onFilterChange === 'function') {
      onFilterChange({
        dateRange: 'Last 7 Days',
        crimeType: 'All',
        source: 'All',
        area: 'All',
        stationId: '',
        incidentTypeId: ''
      });
    }
  };

  const addFilter = (type, value) => {
    setLocalFilters(prev => ({ ...prev, [type]: value }));
    setTableData(prev => ({ ...prev, currentPage: 1 }));
  };

  const removeFilter = (type) => {
    setLocalFilters(prev => ({ ...prev, [type]: null }));
    setTableData(prev => ({ ...prev, currentPage: 1 }));
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || 
    Object.values(localFilters).some(filter => filter !== null) ||
    (filters.stationId && filters.stationId !== '') ||
    (filters.source && filters.source !== 'All') ||
    (filters.crimeType && filters.crimeType !== 'All');

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString || 'N/A';
    }
  };

  // Map station ID to station name
  const getStationName = (stationId, fallbackName) => {
    if (fallbackName && fallbackName !== 'N/A') return fallbackName;
    
    const station = stations.find(s => s.id === stationId);
    return station?.formation || station?.name || fallbackName || 'Unknown Station';
  };

  return (
    <Card className="mt-8">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={tableData.loading}
              className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded border">
              ⌘K
            </kbd>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2 ml-4">
            Export CSV
          </Button>
        </div>

        {/* Active Filters - Only show when there are active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <FilterBadge variant="blue" onRemove={() => setSearchTerm('')}>
                Search: "{searchTerm}"
              </FilterBadge>
            )}
            
            {localFilters.rating && (
              <FilterBadge variant="blue" onRemove={() => removeFilter('rating')}>
                {localFilters.rating} Stars
              </FilterBadge>
            )}
            
            {localFilters.status && (
              <FilterBadge variant="blue" onRemove={() => removeFilter('status')}>
                Status: {localFilters.status}
              </FilterBadge>
            )}
            
            {filters.stationId && filters.area !== 'All' && (
              <FilterBadge variant="blue" onRemove={() => onFilterChange && onFilterChange({...filters, area: 'All', stationId: ''})}>
                Station: {filters.area}
              </FilterBadge>
            )}
            
            {filters.source && filters.source !== 'All' && (
              <FilterBadge variant="blue" onRemove={() => onFilterChange && onFilterChange({...filters, source: 'All'})}>
                Source: {filters.source}
              </FilterBadge>
            )}
            
            {filters.crimeType && filters.crimeType !== 'All' && (
              <FilterBadge variant="blue" onRemove={() => onFilterChange && onFilterChange({...filters, crimeType: 'All', incidentTypeId: ''})}>
                Crime: {filters.crimeType}
              </FilterBadge>
            )}
            
            <Button variant="ghost" size="sm" className="text-blue-600" onClick={handleClearAllFilters}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {tableData.loading && tableData.feedbacks.length === 0 ? (
          <LoadingSpinner />
        ) : tableData.feedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No feedback entries found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen Rating ↕
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Closed ↕
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.feedbacks.map((feedback, index) => (
                <tr key={feedback.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {feedback.id || feedback.reportId || `#23456`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getStationName(feedback.stationId, feedback.station)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {feedback.feedback || feedback.feedbackText || feedback.comment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <StarRating rating={feedback.rating || 5} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(feedback.date || feedback.createdAt || feedback.dateClosed || 'Jan 4, 2025')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {tableData.totalPages > 1 && (
        <TablePagination
          currentPage={tableData.currentPage}
          totalPages={tableData.totalPages}
          onPageChange={handlePageChange}
          loading={tableData.loading}
        />
      )}
    </Card>
  );
};

export default CaseReviewTable;