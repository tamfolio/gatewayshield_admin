import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Edit2, Trash2, ChevronDown, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { useApiClient, broadcastApi } from '../../../../Utils/apiClient';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import DeletedSuccessModal from './components/DeletedSuccessModal';
import BroadcastDetails from './components/BroadcastDetails';


export default function BroadcastLogs({ onEdit, refreshTrigger = 0 }) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alertTypes, setAlertTypes] = useState([]);
  const [loadingAlertTypes, setLoadingAlertTypes] = useState(false);
  
  // Modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deletingBroadcast, setDeletingBroadcast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Broadcast Details Modal states
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [showBroadcastDetails, setShowBroadcastDetails] = useState(false);
  
  // Dropdown states
  const [alertTypeDropdown, setAlertTypeDropdown] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [dateDropdown, setDateDropdown] = useState(false);
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState('');

  const apiClient = useApiClient();

  // Load alert types on component mount
  useEffect(() => {
    loadAlertTypes();
  }, []);

  // Load alert types function
  const loadAlertTypes = async () => {
    try {
      setLoadingAlertTypes(true);
      const result = await broadcastApi.getAlertTypes(apiClient);
      console.log('Alert types response:', result);
      
      // Handle different response structures
      let alertTypesArray = [];
      if (Array.isArray(result)) {
        alertTypesArray = result;
      } else if (result?.data && Array.isArray(result.data)) {
        alertTypesArray = result.data;
      } else if (result?.alertTypes && Array.isArray(result.alertTypes)) {
        alertTypesArray = result.alertTypes;
      }
      
      setAlertTypes(alertTypesArray);
    } catch (error) {
      console.error('Failed to load alert types:', error);
      // Fallback alert types
      setAlertTypes(['Red Alert', 'Yellow Alert', 'Green Alert', 'Blue Alert', 'Weather']);
    } finally {
      setLoadingAlertTypes(false);
    }
  };

  // Main function to load broadcasts
  const loadBroadcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build filters for API call
      const apiFilters = {};
      selectedFilters.forEach(filter => {
        if (filter.type === 'alertType') {
          apiFilters.alertType = filter.value;
        } else if (filter.type === 'status') {
          apiFilters.status = filter.value;
        }
      });
      
      // Call API with filters
      const result = await broadcastApi.getAll(apiClient, currentPage, 10, apiFilters);
      
      console.log('=== BROADCAST API DEBUG ===');
      console.log('Full result:', result);
      console.log('Type of result:', typeof result);
      console.log('Is result an array?', Array.isArray(result));
      
      if (result && typeof result === 'object') {
        console.log('Result keys:', Object.keys(result));
      }
      console.log('=== END DEBUG ===');
      
      // Extract broadcasts data from response
      let broadcastsArray = [];
      let totalPagesResult = 1;
      let totalCountResult = 0;
      
      if (result) {
        if (Array.isArray(result)) {
          // Direct array response
          broadcastsArray = result;
          console.log('✅ Result is directly an array, length:', result.length);
        } else if (result.data) {
          // Response has data property
          if (Array.isArray(result.data)) {
            broadcastsArray = result.data;
            console.log('✅ Found array in result.data, length:', result.data.length);
          } else if (result.data.broadcasts && result.data.broadcasts.data && Array.isArray(result.data.broadcasts.data)) {
            // NEW: Handle nested structure like result.data.broadcasts.data
            broadcastsArray = result.data.broadcasts.data;
            console.log('✅ Found array in result.data.broadcasts.data, length:', result.data.broadcasts.data.length);
            
            // Extract pagination from result.data.broadcasts.pagination
            if (result.data.broadcasts.pagination) {
              totalPagesResult = result.data.broadcasts.pagination.totalPages || 1;
              totalCountResult = result.data.broadcasts.pagination.total || broadcastsArray.length;
            }
          } else if (result.data.data && Array.isArray(result.data.data)) {
            // Handle nested data structure like result.data.data
            broadcastsArray = result.data.data;
            console.log('✅ Found array in result.data.data, length:', result.data.data.length);
            
            // Extract pagination from result.data.pagination
            if (result.data.pagination) {
              totalPagesResult = result.data.pagination.totalPages || 1;
              totalCountResult = result.data.pagination.total || broadcastsArray.length;
            }
          } else if (result.data.broadcasts && Array.isArray(result.data.broadcasts)) {
            broadcastsArray = result.data.broadcasts;
            console.log('✅ Found array in result.data.broadcasts, length:', result.data.broadcasts.length);
          }
          
          // Extract pagination info (fallback)
          if (totalPagesResult === 1 && totalCountResult === 0) {
            totalPagesResult = result.totalPages || result.data?.totalPages || 1;
            totalCountResult = result.totalCount || result.data?.totalCount || broadcastsArray.length;
          }
        } else if (result.broadcasts && Array.isArray(result.broadcasts)) {
          // Direct broadcasts property
          broadcastsArray = result.broadcasts;
          totalPagesResult = result.totalPages || 1;
          totalCountResult = result.totalCount || broadcastsArray.length;
          console.log('✅ Found array in result.broadcasts, length:', result.broadcasts.length);
        }
      }
      
      // Apply client-side search filter (since API doesn't support search)
      if (searchTerm.trim()) {
        broadcastsArray = broadcastsArray.filter(broadcast => 
          broadcast.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          broadcast.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          broadcast.alertType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('🔍 Applied search filter, filtered count:', broadcastsArray.length);
      }
      
      // Apply client-side date filter (if not handled by API)
      const dateFilter = selectedFilters.find(f => f.type === 'date');
      if (dateFilter) {
        const filterDate = new Date(dateFilter.value).toDateString();
        broadcastsArray = broadcastsArray.filter(broadcast => {
          const broadcastDate = new Date(broadcast.dateCreated || broadcast.createdAt).toDateString();
          return broadcastDate === filterDate;
        });
        console.log('📅 Applied date filter, filtered count:', broadcastsArray.length);
      }
      
      // Update state
      setBroadcasts(broadcastsArray);
      setTotalPages(totalPagesResult);
      setTotalCount(totalCountResult);
      
      console.log('📊 Final state set:', {
        broadcastsCount: broadcastsArray.length,
        totalPages: totalPagesResult,
        totalCount: totalCountResult
      });
      
    } catch (error) {
      console.error('💥 API Error:', error);
      console.error('Error response:', error.response);
      setError(`Failed to load broadcasts: ${error.response?.data?.message || error.message}`);
      setBroadcasts([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [apiClient, currentPage, searchTerm, selectedFilters]);

  // Load broadcasts when dependencies change
  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts, refreshTrigger]); // Add refreshTrigger dependency

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle view details click
  const handleViewDetails = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setShowBroadcastDetails(true);
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setShowBroadcastDetails(false);
    setSelectedBroadcast(null);
  };

  // Handle delete click - show confirmation modal
  const handleDeleteClick = (broadcast) => {
    setDeletingBroadcast(broadcast);
    setShowDeleteConfirmation(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!deletingBroadcast) return;
    
    try {
      setIsDeleting(true);
      await broadcastApi.delete(apiClient, deletingBroadcast.id || deletingBroadcast._id);
      
      // Update local state
      setBroadcasts(prev => prev.filter(b => b.id !== deletingBroadcast.id && b._id !== deletingBroadcast._id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      // Go to previous page if current page becomes empty
      if (broadcasts.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
      // Close confirmation modal and show success modal
      setShowDeleteConfirmation(false);
      setShowDeleteSuccess(true);
      setError('');
      
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
      setError('Failed to delete broadcast: ' + (error.response?.data?.message || error.message));
      setShowDeleteConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel deletion
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeletingBroadcast(null);
  };

  // Handle close success modal
  const handleCloseSuccessModal = () => {
    setShowDeleteSuccess(false);
    setDeletingBroadcast(null);
  };

  // Handle broadcast editing
  const handleEdit = (broadcast) => {
    if (onEdit) {
      onEdit(broadcast);
    }
  };

  // Add filter
  const addFilter = (type, value, label) => {
    const newFilters = selectedFilters.filter(f => f.type !== type);
    newFilters.push({ type, value, label });
    setSelectedFilters(newFilters);
    setCurrentPage(1);
    
    // Close all dropdowns
    closeAllDropdowns();
  };

  // Remove filter
  const removeFilter = (filterToRemove) => {
    setSelectedFilters(prev => prev.filter(f => f !== filterToRemove));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm('');
    setSelectedDate('');
    setCurrentPage(1);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (date) {
      const formattedDate = new Date(date).toLocaleDateString();
      addFilter('date', date, `Date: ${formattedDate}`);
      setSelectedDate(date);
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setAlertTypeDropdown(false);
    setStatusDropdown(false);
    setDateDropdown(false);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    
    for (let i = 1; i <= Math.min(maxButtons, totalPages); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            currentPage === i
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis and last page if needed
    if (totalPages > maxButtons) {
      buttons.push(
        <span key="ellipsis" className="px-2 text-gray-500">...</span>,
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Broadcast Logs</h2>
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              {totalCount}
            </span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search broadcasts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-sm"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Filter Tags */}
        {selectedFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedFilters.map((filter, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white flex items-center gap-1"
              >
                {filter.label}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-gray-300" 
                  onClick={() => removeFilter(filter)}
                />
              </span>
            ))}
            
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white hover:bg-gray-900 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Alert Type
                    <div className="relative">
                      <button
                        onClick={() => {
                          setAlertTypeDropdown(!alertTypeDropdown);
                          setStatusDropdown(false);
                          setDateDropdown(false);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {alertTypeDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                          {loadingAlertTypes ? (
                            <div className="p-2 text-sm text-gray-500">Loading...</div>
                          ) : alertTypes.length > 0 ? (
                            alertTypes.map((type) => (
                              <button
                                key={type}
                                onClick={() => addFilter('alertType', type, `Alert: ${type}`)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                              >
                                {type}
                              </button>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-gray-500">No alert types available</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Date Created
                    <div className="relative">
                      <button
                        onClick={() => {
                          setDateDropdown(!dateDropdown);
                          setAlertTypeDropdown(false);
                          setStatusDropdown(false);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {dateDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                          <div className="p-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Date
                            </label>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => handleDateSelect(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Status
                    <div className="relative">
                      <button
                        onClick={() => {
                          setStatusDropdown(!statusDropdown);
                          setAlertTypeDropdown(false);
                          setDateDropdown(false);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {statusDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                          {['Sent', 'Pending', 'Failed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => addFilter('status', status, `Status: ${status}`)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {broadcasts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-sm">
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="w-8 h-8 text-gray-400 mb-2" />
                      <div>
                        {searchTerm || selectedFilters.length > 0
                          ? 'No broadcasts match your search criteria.'
                          : 'No broadcasts found.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                broadcasts.map((broadcast) => (
                  <tr key={broadcast.id || broadcast._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {broadcast.title?.charAt(0)?.toUpperCase() || 'B'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {broadcast.title || 'Untitled Broadcast'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {broadcast.subtitle || 
                             (broadcast.body && broadcast.body.length > 50 
                               ? broadcast.body.substring(0, 50) + '...' 
                               : broadcast.body)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {broadcast.alertType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(broadcast.dateCreated || broadcast.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {broadcast.createdBy || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                        {broadcast.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(broadcast)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                          title="View broadcast details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(broadcast)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit broadcast"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(broadcast)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete broadcast"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {generatePaginationButtons()}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Delete Success Modal */}
      <DeletedSuccessModal
        isOpen={showDeleteSuccess}
        onClose={handleCloseSuccessModal}
        message="Broadcast deleted successfully"
      />

      {/* Broadcast Details Modal */}
      <BroadcastDetails
        broadcast={selectedBroadcast}
        isOpen={showBroadcastDetails}
        onClose={handleCloseDetails}
      />
    </>
  );
}