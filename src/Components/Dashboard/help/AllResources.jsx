import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, FileDown, Edit2, Trash2, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useApiClient, resourcesApi, resourcesUtils } from '../../../Utils/apiClient';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import DeletedSuccessModal from './components/DeletedSuccessModal';

const AllResources = ({ refreshTrigger, onResourceCountUpdate, onEditResource }) => {
  const apiClient = useApiClient();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  // Action loading states
  const [actionLoading, setActionLoading] = useState({});

  // Load resources data
  const loadResources = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare filters for API call
      const apiFilters = {
        ...filters
      };

      // Add search term to filters
      if (searchTerm.trim()) {
        apiFilters.search = searchTerm.trim();
      }

      console.log('🔍 Loading resources with filters:', apiFilters);
      
      const response = await resourcesApi.getAll(apiClient, page, pagination.pageSize, apiFilters);
      
      console.log('📥 Resources API response:', response);
      
      // Extract data and pagination from response
      const { data: extractedData, pagination: extractedPagination } = resourcesUtils.extractApiResponseData(response);
      
      // Transform the data for UI - with debug logging
      console.log('🔧 Raw data before transformation:', extractedData);
      const transformedResources = resourcesUtils.transformResourcesData(extractedData);
      console.log('🔧 Transformed data:', transformedResources);
      
      setResources(transformedResources);
      setPagination(prev => ({
        ...prev,
        ...extractedPagination,
        currentPage: page
      }));
      
      // Update resource count in parent component
      if (onResourceCountUpdate && extractedPagination.total !== undefined) {
        onResourceCountUpdate(extractedPagination.total);
      }
      
      console.log(`✅ Loaded ${transformedResources.length} resources`);
      
    } catch (err) {
      console.error('❌ Failed to load resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (apiClient) {
      loadResources();
    }
  }, [apiClient, refreshTrigger]);

  // Reload when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (apiClient) {
        loadResources(1, buildApiFilters());
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reload when active filters change
  useEffect(() => {
    if (apiClient && activeFilters.length >= 0) {
      loadResources(1, buildApiFilters());
    }
  }, [activeFilters]);

  // Build API filters from UI state
  const buildApiFilters = () => {
    const filters = {};
    
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'status':
          filters.isPublished = filter.value.toLowerCase() === 'published';
          break;
        case 'date':
          if (filter.value === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filters.createdDate = today;
          }
          break;
        default:
          filters[filter.type] = filter.value;
      }
    });
    
    return filters;
  };

  // Function to add filter
  const addFilter = (filterType, filterValue) => {
    const newFilter = { type: filterType, value: filterValue };
    if (!activeFilters.some(f => f.type === filterType && f.value === filterValue)) {
      setActiveFilters([...activeFilters, newFilter]);
    }
  };

  // Function to remove filter
  const removeFilter = (filterToRemove) => {
    setActiveFilters(activeFilters.filter(filter => 
      !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
    ));
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  // Handle delete initiation - show confirmation modal
  const handleDeleteInitiate = (resource) => {
    console.log('🗑️ Initiating delete for resource:', resource);
    setResourceToDelete(resource);
    setShowDeleteConfirmation(true);
  };

  // Handle confirmed delete
  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;

    try {
      setActionLoading(prev => ({ ...prev, [resourceToDelete.id]: 'delete' }));
      setError('');
      
      console.log('🗑️ Deleting resource:', resourceToDelete.id);
      
      await resourcesApi.delete(apiClient, resourceToDelete.id);
      
      // Close confirmation modal
      setShowDeleteConfirmation(false);
      
      // Show success modal
      setShowDeleteSuccess(true);
      
      // Reload the current page to reflect changes
      loadResources(pagination.currentPage, buildApiFilters());
      
    } catch (err) {
      console.error('❌ Failed to delete resource:', err);
      setError(err.message || 'Failed to delete resource');
      setShowDeleteConfirmation(false);
    } finally {
      setActionLoading(prev => ({ ...prev, [resourceToDelete.id]: null }));
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setResourceToDelete(null);
  };

  // Handle delete success modal close
  const handleDeleteSuccessClose = () => {
    setShowDeleteSuccess(false);
    setResourceToDelete(null);
  };

  // Handle download (placeholder - implement based on your file storage)
  const handleDownload = (resource) => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    } else {
      console.log('Download resource:', resource.id);
      setError('Download link not available for this resource');
    }
  };

  // Handle view resource
  const handleView = (resource) => {
    console.log('View resource:', resource.id);
    // Implement view logic (e.g., open modal, navigate to detail page)
  };

  // Handle edit resource - FIXED
  const handleEdit = (resource) => {
    console.log('✏️ Edit resource:', resource);
    
    // Check if parent component provided onEditResource callback
    if (onEditResource && typeof onEditResource === 'function') {
      onEditResource(resource);
    } else {
      // Fallback: you can implement your own edit logic here
      console.warn('No onEditResource callback provided from parent component');
      // For example, you could navigate to an edit page or open an edit modal
      // window.location.href = `/edit-resource/${resource.id}`;
      // or setShowEditModal(true); setEditingResource(resource);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadResources(newPage, buildApiFilters());
    }
  };

  // Handle sort change
  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
    // Implement sorting logic based on your API capabilities
    console.log('Sort by:', sortValue);
  };

  // Filter resources based on client-side filters and search
  const getFilteredResources = () => {
    let filtered = [...resources];
    
    // Apply sorting if selected
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'date':
            return new Date(b.submissionDate) - new Date(a.submissionDate);
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  };

  const filteredResources = getFilteredResources();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          All Resources
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-normal">
            {pagination.total || filteredResources.length}
          </span>
        </h2>
        
        <button
          onClick={() => loadResources(pagination.currentPage, buildApiFilters())}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-green-700 text-sm">{success}</div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
              disabled={loading}
            >
              <option value="">Sort by</option>
              <option value="title">Title</option>
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => addFilter('date', 'today')}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              disabled={loading}
            >
              Today
            </button>
            <button
              onClick={() => addFilter('status', 'published')}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              disabled={loading}
            >
              Published
            </button>
            <button
              onClick={() => addFilter('status', 'draft')}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              disabled={loading}
            >
              Draft
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm text-gray-600">Active filters:</span>
          <div className="flex space-x-2">
            {activeFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => removeFilter(filter)}
                className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 flex items-center"
              >
                {filter.value === 'today' ? 'Today' : 
                 filter.value.charAt(0).toUpperCase() + filter.value.slice(1)}
                <span className="ml-1">×</span>
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 rounded-full text-sm bg-gray-800 text-white hover:bg-gray-900"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading resources...</span>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 min-w-48">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-32">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-36">
                    Sub-Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-32">
                    Submission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12 min-w-24">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-48">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{resource.title}</div>
                            {resource.description && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {resource.description.substring(0, 100)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-32">
                        <div className="truncate">{resource.category}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-36">
                        <div className="truncate">{resource.subCategory}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-32">
                        <div className="truncate">{resource.submissionDate}</div>
                        {resource.isToday && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            Today
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            resource.status === 'Published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {resource.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 min-w-max">
                          {/* Download Button */}
                          <button 
                            onClick={() => handleDownload(resource)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
                            title="Download"
                          >
                            <FileDown className="h-4 w-4 mr-1.5" />
                            Download
                          </button>

                          {/* Edit Button */}
                          <button 
                            onClick={() => handleEdit(resource)}
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteInitiate(resource)}
                            disabled={actionLoading[resource.id] === 'delete'}
                            className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors flex-shrink-0"
                            title="Delete"
                          >
                            {actionLoading[resource.id] === 'delete' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        {searchTerm || activeFilters.length > 0 
                          ? 'No resources found matching your criteria'
                          : 'No resources available'
                        }
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button 
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex space-x-2">
            {/* Generate page numbers */}
            {(() => {
              const pages = [];
              const totalPages = pagination.totalPages;
              const currentPage = pagination.currentPage;
              
              // Always show first page
              if (totalPages > 0) {
                pages.push(1);
              }
              
              // Add ellipsis if there's a gap
              if (currentPage > 3) {
                pages.push('...');
              }
              
              // Add pages around current page
              for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (!pages.includes(i)) {
                  pages.push(i);
                }
              }
              
              // Add ellipsis if there's a gap
              if (currentPage < totalPages - 2) {
                pages.push('...');
              }
              
              // Always show last page if there's more than one page
              if (totalPages > 1 && !pages.includes(totalPages)) {
                pages.push(totalPages);
              }
              
              return pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={typeof page !== 'number'}
                  className={`px-3 py-1 text-sm rounded ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : typeof page === 'number'
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-gray-300 cursor-default'
                  }`}
                >
                  {page}
                </button>
              ));
            })()}
          </div>
          
          <button 
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Results Summary */}
      {!loading && filteredResources.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of{' '}
          {pagination.total} resources
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={resourceToDelete ? actionLoading[resourceToDelete.id] === 'delete' : false}
      />

      {/* Delete Success Modal */}
      <DeletedSuccessModal
        isOpen={showDeleteSuccess}
        onClose={handleDeleteSuccessClose}
        message="Resource deleted successfully"
      />

    
    </div>
  );
};

export default AllResources;