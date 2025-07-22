import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Edit3, X, Eye, RefreshCw } from 'lucide-react';
import { useApiClient, newsApi } from '../../../../Utils/apiClient';
import useAccessToken from '../../../../Utils/useAccessToken';

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
  
  const itemsPerPage = 10;
  const accessToken = useAccessToken();
  const apiClient = useApiClient();

  // Fetch news using the newsApi helper
  const fetchNews = useCallback(async () => {
    if (!accessToken) {
      setError('No access token. Please log in.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        size: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(activeFilters.includes('Published') && { status: 'published' }),
      };

      // Use the newsApi helper function
      const resData = await newsApi.getAll(apiClient, params);
      
      // Handle the response data structure
      const dataContent = resData?.data || resData;
      let newsArray = [];

      if (Array.isArray(dataContent.items)) {
        newsArray = dataContent.items;
      } else if (Array.isArray(dataContent.news)) {
        newsArray = dataContent.news;
      } else if (Array.isArray(dataContent)) {
        newsArray = dataContent;
      }

      setNewsData(newsArray);

      // Handle pagination
      const pagination = dataContent.pagination || resData.pagination || {};
      setTotalPages(pagination.totalPages || Math.ceil((pagination.total || newsArray.length) / itemsPerPage) || 1);
      setTotalItems(pagination.total || newsArray.length || 0);

    } catch (err) {
      console.error('Fetch News Error:', err);
      
      // Enhanced error handling
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Insufficient permissions.');
      } else if (err.response?.status === 404) {
        setError('News endpoint not found.');
      } else {
        setError(err.message || 'Failed to load news');
      }
      
      setNewsData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, activeFilters, accessToken]);

  // Delete single news item using newsApi helper
  const handleDeleteNews = async (newsId, broadcastId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      setDeleteLoading(newsId);
      
      const deleteData = {
        ...(broadcastId && { broadcastId })
      };

      // Use the newsApi helper function
      await newsApi.delete(apiClient, newsId, deleteData);
      
      // Remove the deleted item from the local state
      setNewsData(prevData => prevData.filter(item => item.id !== newsId));
      setTotalItems(prev => prev - 1);
      setSelectedItems(prev => prev.filter(id => id !== newsId));
      
      // Navigate to previous page if current page is empty
      if (newsData.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
    } catch (err) {
      console.error('Delete News Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete news article');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Bulk delete functionality
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedItems.length} article${selectedItems.length > 1 ? 's' : ''}?`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setBulkDeleteLoading(true);
      setError('');
      
      // Delete all selected items
      const deletePromises = selectedItems.map(async (id) => {
        const article = newsData.find(item => item.id === id);
        const deleteData = article?.broadcastId ? { broadcastId: article.broadcastId } : {};
        return newsApi.delete(apiClient, id, deleteData);
      });
      
      await Promise.all(deletePromises);
      
      // Refresh the list after successful deletion
      setSelectedItems([]);
      await fetchNews();
      
    } catch (err) {
      console.error('Bulk Delete Error:', err);
      setError('Failed to delete some articles. Please try again.');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // View single news article
  const handleViewNews = async (newsId) => {
    try {
      const newsData = await newsApi.getById(apiClient, newsId);
      // You can implement a modal or navigate to a detailed view
      console.log('News details:', newsData);
      // For now, just log the data - you might want to open a modal or navigate
    } catch (err) {
      console.error('View News Error:', err);
      setError('Failed to load news details');
    }
  };

  useEffect(() => {
    fetchNews();
  }, [currentPage, searchTerm, activeFilters, accessToken]);

  // Reset page to 1 when search or filters change (but not on initial load)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, activeFilters]);

  const handleFilterToggle = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const removeFilter = (filter) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchTerm('');
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(newsData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const isPublished = status === 'published' || status === 'Published';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isPublished 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {isPublished ? 'Published' : 'Draft'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={fetchNews} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const isAllSelected = selectedItems.length === newsData.length && newsData.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < newsData.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">All News</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
            {totalItems || newsData.length}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm inline-flex items-center gap-1"
              >
                {bulkDeleteLoading ? (
                  <div className="w-3 h-3 animate-spin border border-current border-t-transparent rounded-full" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete Selected
              </button>
            </div>
          )}
          
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

      {/* Filter Buttons */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFilterToggle('John Doe')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilters.includes('John Doe')
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            John Doe
          </button>
          
          <button
            onClick={() => handleFilterToggle('Today')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilters.includes('Today')
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          
          <button
            onClick={() => handleFilterToggle('Published')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilters.includes('Published')
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Published
          </button>
          
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Tags */}
      {activeFilters.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {activeFilters.map(filter => (
              <span key={filter} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                {filter}
                <button 
                  onClick={() => removeFilter(filter)} 
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
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
        <div className="col-span-4 text-sm font-medium text-gray-700">Title</div>
        <div className="col-span-2 text-sm font-medium text-gray-700">Date Created</div>
        <div className="col-span-2 text-sm font-medium text-gray-700">Author</div>
        <div className="col-span-2 text-sm font-medium text-gray-700">Status</div>
        <div className="col-span-1 text-sm font-medium text-gray-700">Actions</div>
      </div>

      {/* News List */}
      <div className="divide-y divide-gray-200">
        {newsData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg font-medium mb-2">No news articles found</div>
            <p className="text-sm">Try adjusting your search or filters</p>
            <button
              onClick={onSwitchToCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Article
            </button>
          </div>
        ) : (
          newsData.map((article, index) => (
            <div key={article.id || index} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              {/* Checkbox */}
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(article.id)}
                  onChange={(e) => handleSelectItem(article.id, e.target.checked)}
                  className="rounded border-gray-300"
                />
              </div>

              {/* Title with thumbnail */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {article.thumbnail || article.coverImage ? (
                    <img 
                      src={article.thumbnail || article.coverImage} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {(article.title || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate text-sm">
                    {article.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {article.subHeading || article.body?.substring(0, 50) || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Date Created */}
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                {formatDate(article.createdAt || article.dateCreated)}
              </div>

              {/* Author */}
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                {article.author || article.createdBy || 'John Doe'}
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center">
                {getStatusBadge(article.status || (article.isDraft ? 'draft' : 'published'))}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center gap-1">
                <button
                  onClick={() => handleViewNews(article.id)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditNews(article.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNews(article.id, article.broadcastId)}
                  disabled={deleteLoading === article.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleteLoading === article.id ? (
                    <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                const isActive = pageNum === currentPage;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
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
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllNews;