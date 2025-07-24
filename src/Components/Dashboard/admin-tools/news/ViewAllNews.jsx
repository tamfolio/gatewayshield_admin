import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Trash2, Edit3, X, Eye, RefreshCw } from 'lucide-react';
import { useApiClient, newsApi } from '../../../../Utils/apiClient';
import useAccessToken from '../../../../Utils/useAccessToken';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import DeletedSuccessModal from './components/DeletedSuccessModal';

const ViewAllNews = ({ onEditNews, onSwitchToCreate }) => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    newsId: null,
    isBulk: false
  });

  // Delete success modal state
  const [deleteSuccessModal, setDeleteSuccessModal] = useState({
    isOpen: false,
    message: ''
  });
  
  const itemsPerPage = 10;
  const accessToken = useAccessToken();
  const apiClient = useApiClient();
  
  // Use refs to track if we're already fetching to prevent duplicate calls
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // FIXED: Stable fetchNews function with proper parameter handling
  const fetchNews = useCallback(async (pageNum = 1, search = '', filters = []) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    if (!accessToken || !apiClient) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError('');

      // FIXED: Ensure we pass primitive values, not objects
      const searchTrimmed = typeof search === 'string' ? search.trim() : '';
      const filtersArray = Array.isArray(filters) ? filters : [];
      const pageNumber = Number(pageNum) || 1;
      const sizeNumber = Number(itemsPerPage) || 10;

      console.log('Fetching news with params:', {
        page: pageNumber,
        size: sizeNumber,
        search: searchTrimmed,
        filters: filtersArray
      });

      // FIXED: Call the API with primitive values directly
      const response = await newsApi.getAll(apiClient, pageNumber, sizeNumber);
      
      // Only update state if component is still mounted
      if (!mountedRef.current) return;
      
      console.log('Full API Response:', response);
      
      // Parse the response structure
      let newsArray = [];
      let paginationData = {};

      if (response?.data) {
        // Check for response.data.news.data (the actual structure from your API)
        if (response.data.news?.data && Array.isArray(response.data.news.data)) {
          newsArray = response.data.news.data;
          paginationData = response.data.news.pagination || {};
        }
        // Check for response.data.data.news.data (deeply nested structure)
        else if (response.data.data?.news?.data && Array.isArray(response.data.data.news.data)) {
          newsArray = response.data.data.news.data;
          paginationData = response.data.data.news.pagination || {};
        }
        // Check for other possible structures
        else if (response.data.data?.news && Array.isArray(response.data.data.news)) {
          newsArray = response.data.data.news;
          paginationData = response.data.data.pagination || {};
        }
        else if (Array.isArray(response.data.news)) {
          newsArray = response.data.news;
          paginationData = response.data.pagination || {};
        }
        else if (Array.isArray(response.data.data)) {
          newsArray = response.data.data;
          paginationData = response.data.pagination || {};
        }
        else if (Array.isArray(response.data)) {
          newsArray = response.data;
        }
      } else if (Array.isArray(response)) {
        newsArray = response;
      }

      console.log('Final parsed news array:', newsArray);
      
      // ADDED: Debug each article's status fields
      newsArray.forEach((article, index) => {
        console.log(`Article ${index + 1} status fields:`, {
          id: article.id,
          title: article.title,
          isDraft: article.isDraft,
          isActive: article.isActive,
          status: article.status,
          datePublished: article.datePublished,
          allFields: Object.keys(article)
        });
      });

      // Ensure we have valid data
      if (!Array.isArray(newsArray)) {
        console.warn('News data is not an array:', newsArray);
        newsArray = [];
      }

      // Batch state updates to prevent multiple re-renders
      const newTotalItems = paginationData.total || newsArray.length;
      const newTotalPages = paginationData.totalPages || Math.ceil(newTotalItems / itemsPerPage) || 1;

      setNewsData(newsArray);
      setTotalItems(newTotalItems);
      setTotalPages(newTotalPages);

    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Fetch News Error:', err);
      
      let errorMessage = 'Failed to load news articles';
      
      if (err.response) {
        const status = err.response.status;
        switch (status) {
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. Insufficient permissions.';
            break;
          case 404:
            errorMessage = 'News endpoint not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = err.response.data?.message || `Server error (${status})`;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      setNewsData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [apiClient, accessToken, itemsPerPage]);

  // FIXED: Single effect for initial load and auth changes
  useEffect(() => {
    if (apiClient && accessToken) {
      fetchNews(1, searchTerm, activeFilters);
    }
  }, [apiClient, accessToken]);

  // FIXED: Separate effect for page changes (not initial load)
  useEffect(() => {
    if (apiClient && accessToken && currentPage !== 1) {
      fetchNews(currentPage, searchTerm, activeFilters);
    }
  }, [currentPage]);

  // FIXED: Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (apiClient && accessToken) {
        setCurrentPage(1); // Reset to page 1 for new search
        fetchNews(1, searchTerm, activeFilters);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // FIXED: Filter effect
  useEffect(() => {
    if (apiClient && accessToken) {
      setCurrentPage(1); // Reset to page 1 for new filters
      fetchNews(1, searchTerm, activeFilters);
    }
  }, [activeFilters]);

  // FIXED: Memoized delete function
  const handleDeleteNews = useCallback(async (newsId, broadcastId) => {
    if (!newsId || deleteLoading) return;

    // Show confirmation modal
    setDeleteModal({
      isOpen: true,
      newsId: newsId,
      isBulk: false
    });
  }, [deleteLoading]);

  // Actual delete function called after confirmation
  const confirmDeleteNews = useCallback(async () => {
    const newsId = deleteModal.newsId;
    if (!newsId) return;

    try {
      setDeleteLoading(newsId);
      
      await newsApi.delete(apiClient, newsId);
      
      // Show success modal
      setDeleteSuccessModal({
        isOpen: true,
        message: 'News deleted successfully'
      });
      
      // Update local state immediately for better UX
      setNewsData(prevData => prevData.filter(item => item.id !== newsId));
      setTotalItems(prev => Math.max(0, prev - 1));
      setSelectedItems(prev => prev.filter(id => id !== newsId));
      
      // Navigate to previous page if current page is empty and not page 1
      const remainingItems = newsData.length - 1;
      if (remainingItems === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
      // Close modal
      setDeleteModal({ isOpen: false, newsId: null, isBulk: false });
      
    } catch (err) {
      console.error('Delete News Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete news article';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleteLoading(null);
    }
  }, [apiClient, newsData.length, currentPage, deleteModal.newsId]);

  // FIXED: Memoized bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0 || bulkDeleteLoading) return;
    
    // Show confirmation modal for bulk delete
    setDeleteModal({
      isOpen: true,
      newsId: null,
      isBulk: true
    });
  }, [selectedItems.length, bulkDeleteLoading]);

  // Actual bulk delete function called after confirmation
  const confirmBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    try {
      setBulkDeleteLoading(true);
      setError('');
      
      const deletePromises = selectedItems.map(async (id) => {
        return newsApi.delete(apiClient, id);
      });
      
      await Promise.all(deletePromises);
      
      // Show success modal for bulk delete
      setDeleteSuccessModal({
        isOpen: true,
        message: `${selectedItems.length} article${selectedItems.length > 1 ? 's' : ''} deleted successfully`
      });
      
      setSelectedItems([]);
      // Refresh after bulk delete
      await fetchNews(currentPage, searchTerm, activeFilters);
      
      // Close modal
      setDeleteModal({ isOpen: false, newsId: null, isBulk: false });
      
    } catch (err) {
      console.error('Bulk Delete Error:', err);
      const errorMessage = 'Failed to delete some articles. Please try again.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setBulkDeleteLoading(false);
    }
  }, [selectedItems, apiClient, currentPage, searchTerm, activeFilters, fetchNews]);

  // Close delete modal
  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, newsId: null, isBulk: false });
  }, []);

  // Close delete success modal
  const closeDeleteSuccessModal = useCallback(() => {
    setDeleteSuccessModal({ isOpen: false, message: '' });
  }, []);

  // FIXED: Memoized view function
  const handleViewNews = useCallback(async (newsId) => {
    if (!newsId) return;

    try {
      const newsDetails = await newsApi.getOne(apiClient, newsId);
      console.log('News details:', newsDetails);
      alert('News details loaded successfully. Check console for data.');
    } catch (err) {
      console.error('View News Error:', err);
      setError('Failed to load news details');
      alert('Error: Failed to load news details');
    }
  }, [apiClient]);

  // FIXED: Optimized filter handlers
  const handleFilterToggle = useCallback((filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }, []);

  const removeFilter = useCallback((filter) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
    setSearchTerm('');
  }, []);

  // FIXED: Optimized selection handlers
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedItems(newsData.map(item => item.id).filter(Boolean));
    } else {
      setSelectedItems([]);
    }
  }, [newsData]);

  const handleSelectItem = useCallback((itemId, checked) => {
    if (!itemId) return;
    
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  }, []);

  // FIXED: Memoized utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // FIXED: Improved status badge logic based on actual API response format
  const getStatusBadge = useCallback((item) => {
    console.log(`Status check for article "${item.title}":`, {
      isDraft: item.isDraft,
      isActive: item.isActive,
      status: item.status,
      datePublished: item.datePublished
    });

    // Based on the backend response: isDraft: 0/1, isActive: 0/1 (numbers, not booleans)
    const isDraft = item.isDraft === 1 || item.isDraft === true || item.isDraft === 'true';
    const isActive = item.isActive === 1 || item.isActive === true || item.isActive === 'true';
    const hasPublishedDate = item.datePublished && item.datePublished !== null;
    const statusField = typeof item.status === 'string' ? item.status.toLowerCase() : '';
    
    // Article is published if:
    // 1. isActive is 1 (or true) AND isDraft is 0 (or false)
    // 2. OR has a datePublished date AND isDraft is 0 (or false)
    // 3. OR status field explicitly says 'published'
    const isPublished = (
      (isActive && !isDraft) ||
      (hasPublishedDate && !isDraft) ||
      statusField === 'published' ||
      statusField === 'active'
    );
    
    console.log(`Final status decision for "${item.title}": ${isPublished ? 'Published' : 'Draft'} (isDraft: ${isDraft}, isActive: ${isActive})`);
    
    if (isPublished) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          Published
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
          Draft
        </span>
      );
    }
  }, []);

  // Loading state
  if (loading && newsData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading news articles...</p>
      </div>
    );
  }

  // Error state (only show if no data)
  if (error && newsData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <p className="font-medium">Error Loading News</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => fetchNews(1, searchTerm, activeFilters)} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // Calculate selection state
  const isAllSelected = selectedItems.length === newsData.length && newsData.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < newsData.length;

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">All News</h2>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
            {totalItems}
          </span>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFilterToggle('Published')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              activeFilters.includes('Published')
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Published
            {activeFilters.includes('Published') && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFilter('Published');
                }} 
                className="ml-1 text-white hover:text-gray-200"
              >
                <X className="w-3 h-3 inline" />
              </button>
            )}
          </button>
          
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 text-xs font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Show error banner if there's an error but data is still available */}
      {error && newsData.length > 0 && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <div className="text-yellow-700 text-sm">
            Warning: {error}
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={input => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300"
          />
        </div>
        <div className="col-span-4">Title</div>
        <div className="col-span-2">Date Created</div>
        <div className="col-span-2">Author</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* News List */}
      <div className="divide-y divide-gray-200">
        {newsData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg font-medium mb-2">No news articles found</div>
            <p className="text-sm">
              {searchTerm || activeFilters.length > 0 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first article'
              }
            </p>
            <button
              onClick={onSwitchToCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Article
            </button>
          </div>
        ) : (
          newsData.map((article, index) => {
            const articleId = article.id || `temp-${index}`;
            const articleTitle = article.title || 'Untitled';
            const articleSubtitle = article.subtitle || article.subHeading || article.body?.substring(0, 50) || 'No description available';
            
            // Based on actual API response: only createdById is available in list view
            // For now, we'll show the ID until backend provides author names
            const articleAuthor = article.createdById ? `User ${article.createdById.slice(-8)}` : 'Unknown Author';
            
            // Use datePublished which is available in the list response
            const articleDate = article.datePublished;
            
            // Debug logging to see what fields are available
            console.log(`Article "${articleTitle}" fields:`, {
              createdById: article.createdById,
              datePublished: article.datePublished,
              availableFields: Object.keys(article)
            });
            
            return (
              <div key={articleId} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                {/* Checkbox */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(articleId)}
                    onChange={(e) => handleSelectItem(articleId, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>

                {/* Title with thumbnail */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {article.thumbnail || article.coverImage || article.coverImageUrl ? (
                      <img 
                        src={article.thumbnail || article.coverImage || article.coverImageUrl} 
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {articleTitle.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {articleTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {articleSubtitle}
                    </p>
                  </div>
                </div>

                {/* Date Created */}
                <div className="col-span-2 flex items-center text-sm text-gray-600">
                  {formatDate(articleDate)}
                </div>

                {/* Author */}
                <div className="col-span-2 flex items-center text-sm text-gray-600">
                  {articleAuthor}
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  {getStatusBadge(article)}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center gap-1">
                  <button
                    onClick={() => handleViewNews(articleId)}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditNews(articleId)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(articleId, article.broadcastId)}
                    disabled={deleteLoading === articleId}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleteLoading === articleId ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {bulkDeleteLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 10))].map((_, i) => {
              let pageNum;
              if (totalPages <= 10) {
                pageNum = i + 1;
              } else if (currentPage <= 5) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 4) {
                pageNum = totalPages - 9 + i;
              } else {
                pageNum = currentPage - 4 + i;
              }
              
              const isActive = pageNum === currentPage;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Next →
          </button>
        </div>
      )}
    </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteModal.isBulk ? confirmBulkDelete : confirmDeleteNews}
        isLoading={deleteModal.isBulk ? bulkDeleteLoading : deleteLoading === deleteModal.newsId}
      />

      {/* Delete Success Modal */}
      <DeletedSuccessModal
        isOpen={deleteSuccessModal.isOpen}
        message={deleteSuccessModal.message}
        onClose={closeDeleteSuccessModal}
      />
    </>
  );
 
};

export default ViewAllNews;