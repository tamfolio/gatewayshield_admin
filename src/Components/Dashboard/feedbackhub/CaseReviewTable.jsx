import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Centralized API Integration for Case Review Feedbacks
const caseReviewFeedbackAPI = {
  baseURL: 'https://admin-api.thegatewayshield.com/api/v1/feedback/caseReview',
  
  getAuthToken: () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  async getAllFeedbacks(page = 1, size = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    // Add filters to params if they exist
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '' && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });

    const token = this.getAuthToken();
    const url = `${this.baseURL}/all-feedbacks?${params.toString()}`;
    
    try {
      console.log(`🚀 Case Review Feedback API Call: ${url}`);
      console.log(`🔑 Auth Token: ${token ? 'Present' : 'Missing'}`);
      console.log(`📋 Filters:`, filters);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
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
      console.log(`✅ Case Review Feedback API Success:`, data);
      console.log(`📊 Response data keys:`, Object.keys(data || {}));
      console.log(`📋 Response structure:`, JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error(`❌ Case Review Feedback API Error:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
        url: url
      });
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

// Filter Badge Component
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

// Error Display Component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-600 mb-4">Error: {error}</div>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="sm">
        Retry
      </Button>
    )}
  </div>
);

// Pagination Component
const TablePagination = ({ currentPage, totalPages, onPageChange, loading, totalItems, pageSize }) => {
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

  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
      
      <div className="flex items-center gap-4">
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
    </div>
  );
};

// Main Case Review Table Component
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

useEffect(() => {
  loadFeedbacks();
  // Safely compare object values, not references
}, [tableData.currentPage, searchTerm, JSON.stringify(filters), JSON.stringify(localFilters)]);
  const loadFeedbacks = async () => {
    setTableData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Combine all filters for the API call
      const apiFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(localFilters.rating && { rating: localFilters.rating }),
        ...(localFilters.status && { status: localFilters.status }),
        ...(filters.stationId && { stationId: filters.stationId }),
        ...(filters.incidentTypeId && { incidentTypeId: filters.incidentTypeId }),
        ...(filters.source && filters.source !== 'All' && { source: filters.source }),
        // Add date range if provided from main filters
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      const response = await caseReviewFeedbackAPI.getAllFeedbacks(
        tableData.currentPage,
        tableData.pageSize,
        apiFilters
      );

      // Handle different possible response structures
      let feedbacks = [];
      let total = 0;
      let totalPages = 1;

      if (response) {
        console.log(`🔍 Processing API response:`, response);
        console.log(`🔍 Response keys:`, Object.keys(response));
        
        // Handle the nested structure: { data: { data: [...], pagination: {...} } }
        const responseData = response.data || response;
        
        feedbacks = responseData.data || 
                   responseData.feedbacks || 
                   responseData.items || 
                   responseData.results ||
                   responseData.content ||
                   (Array.isArray(responseData) ? responseData : []);
                   
        // Extract pagination info from the nested pagination object
        const paginationInfo = responseData.pagination || responseData;
        
        total = paginationInfo.total || 
               paginationInfo.totalCount || 
               paginationInfo.totalItems || 
               paginationInfo.totalElements ||
               paginationInfo.count ||
               (feedbacks ? feedbacks.length : 0);
               
        totalPages = paginationInfo.totalPages || 
                    paginationInfo.pages ||
                    Math.ceil(total / tableData.pageSize);
        
        console.log(`📊 Extracted feedbacks:`, feedbacks);
        console.log(`📊 Total items:`, total);
        console.log(`📊 Total pages:`, totalPages);
        
        // Ensure feedbacks is an array
        if (!Array.isArray(feedbacks)) {
          console.log(`⚠️ Feedbacks is not an array, converting:`, feedbacks);
          feedbacks = [];
        }
      }

      setTableData(prev => ({
        ...prev,
        feedbacks: feedbacks,
        totalPages: Math.max(1, totalPages),
        totalItems: total,
        loading: false
      }));

    } catch (error) {
      console.error('Error loading case review feedbacks:', error);
      
      // Fallback mock data for development/testing
      const mockFeedbacks = [
        { 
          id: '#CR001', 
          reportId: '#CR001',
          stationId: 'surulere', 
          station: 'Surulere Station', 
          feedback: 'Very respectful and professional officers', 
          feedbackText: 'Very respectful and professional officers',
          comment: 'Very respectful and professional officers',
          rating: 5, 
          date: '2025-01-04',
          createdAt: '2025-01-04T10:30:00Z',
          dateClosed: '2025-01-04'
        },
        { 
          id: '#CR002', 
          reportId: '#CR002',
          stationId: 'ikeja', 
          station: 'Ikeja Station', 
          feedback: 'Station was closed when I arrived', 
          feedbackText: 'Station was closed when I arrived',
          comment: 'Station was closed when I arrived',
          rating: 2, 
          date: '2025-01-04',
          createdAt: '2025-01-04T09:15:00Z',
          dateClosed: '2025-01-04'
        },
        { 
          id: '#CR003', 
          reportId: '#CR003',
          stationId: 'surulere', 
          station: 'Surulere Station', 
          feedback: 'Need more female officers at the station', 
          feedbackText: 'Need more female officers at the station',
          comment: 'Need more female officers at the station',
          rating: 4, 
          date: '2025-01-03',
          createdAt: '2025-01-03T14:20:00Z',
          dateClosed: '2025-01-03'
        },
        { 
          id: '#CR004', 
          reportId: '#CR004',
          stationId: 'vi', 
          station: 'Victoria Island Station', 
          feedback: 'Quick response time and helpful staff', 
          feedbackText: 'Quick response time and helpful staff',
          comment: 'Quick response time and helpful staff',
          rating: 5, 
          date: '2025-01-03',
          createdAt: '2025-01-03T16:45:00Z',
          dateClosed: '2025-01-03'
        },
        { 
          id: '#CR005', 
          reportId: '#CR005',
          stationId: 'yaba', 
          station: 'Yaba Station', 
          feedback: 'Officer was very understanding of my situation', 
          feedbackText: 'Officer was very understanding of my situation',
          comment: 'Officer was very understanding of my situation',
          rating: 4, 
          date: '2025-01-02',
          createdAt: '2025-01-02T11:30:00Z',
          dateClosed: '2025-01-02'
        }
      ];

      setTableData(prev => ({
        ...prev,
        feedbacks: mockFeedbacks,
        totalPages: 3,
        totalItems: 25,
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

  const handleExportCSV = () => {
    try {
      const headers = ['Report ID', 'Station', 'Feedback Text', 'Citizen Rating', 'Date Closed'];
      const csvContent = [
        headers.join(','),
        ...tableData.feedbacks.map(row => [
          row.reportID || row.id || row.reportId || '',
          row.stationName || row.station || '',
          `"${(row.comments || row.feedback || row.feedbackText || row.comment || '').replace(/"/g, '""')}"`,
          row.rating || '',
          row.dateclosed || row.date || row.createdAt || row.dateClosed || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'case_review_feedbacks.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export CSV');
    }
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
              placeholder="Search feedbacks..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={tableData.loading}
              className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded border">
              ⌘K
            </kbd>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 ml-4"
            onClick={handleExportCSV}
            disabled={tableData.feedbacks.length === 0}
          >
            Export CSV ({tableData.feedbacks.length})
          </Button>
        </div>

        {/* Active Filters */}
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

      {/* Error Display */}
      {tableData.error && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="text-yellow-800 text-sm">
            ⚠️ {tableData.error}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {tableData.loading && tableData.feedbacks.length === 0 ? (
          <LoadingSpinner />
        ) : tableData.feedbacks.length === 0 && !tableData.loading ? (
          <div className="text-center py-12 text-gray-500">
            No case review feedback entries found
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
  {tableData.loading && tableData.feedbacks.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center py-8">
        <LoadingSpinner />
      </td>
    </tr>
  ) : !tableData.loading && tableData.feedbacks.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center py-8 text-gray-500">
        No case review feedback entries found
      </td>
    </tr>
  ) : (
    tableData.feedbacks.map((feedback, index) => (
      <tr key={feedback.reportID || feedback.id || index} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {feedback.reportID || feedback.id || feedback.reportId || `#${index + 1}`}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {feedback.stationName || feedback.station || 'Unknown Station'}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div
            className="max-w-xs truncate"
            title={
              feedback.comments ||
              feedback.feedback ||
              feedback.feedbackText ||
              feedback.comment
            }
          >
            {feedback.comments ||
              feedback.feedback ||
              feedback.feedbackText ||
              feedback.comment ||
              '-'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <StarRating rating={feedback.rating || 0} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(
            feedback.dateclosed ||
              feedback.date ||
              feedback.createdAt ||
              feedback.dateClosed
          )}
        </td>
      </tr>
    ))
  )}
</tbody>


          </table>
        )}
      </div>

      {/* Pagination */}
      {tableData.totalPages > 1 && (
        <TablePagination
          currentPage={tableData.currentPage}
          totalPages={tableData.totalPages}
          totalItems={tableData.totalItems}
          pageSize={tableData.pageSize}
          onPageChange={handlePageChange}
          loading={tableData.loading}
        />
      )}
    </Card>
  );
};

export default CaseReviewTable;