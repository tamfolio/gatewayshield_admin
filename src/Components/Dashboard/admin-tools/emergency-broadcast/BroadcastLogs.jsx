import React, { useState, useEffect } from 'react';
import { Search, X, Edit2, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, AlertTriangle, Check, Clock, XCircle } from 'lucide-react';
import { useApiClient, broadcastApi } from '../../../../Utils/apiClient';

export default function BroadcastLogs({ onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    joinDate: false,
    today: false,
    pending: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [error, setError] = useState('');
  const totalPages = 10;

  const apiClient = useApiClient();

  useEffect(() => {
    loadBroadcasts();
  }, [currentPage]);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await broadcastApi.getAll(apiClient, { page: currentPage });
      setBroadcasts(result.data || []);
    } catch (error) {
      console.error('Failed to load broadcasts:', error);
      setError('Failed to load broadcasts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (broadcastId) => {
    try {
      await broadcastApi.delete(apiClient, broadcastId);
      setBroadcasts(prev => prev.filter(b => b.id !== broadcastId));
      setDeleteModal(null);
      setError('');
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
      setError('Failed to delete broadcast: ' + error.message);
    }
  };

  const handleEdit = (broadcast) => {
    if (onEdit) {
      onEdit(broadcast);
    }
  };

  const handleFilterToggle = (filterName) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      joinDate: false,
      today: false,
      pending: false
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Filter broadcasts based on search term and filters
  const filteredBroadcasts = broadcasts.filter(broadcast => {
    const matchesSearch = broadcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broadcast.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broadcast.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = Object.keys(selectedFilters).every(filterKey => {
      if (!selectedFilters[filterKey]) return true;
      
      switch (filterKey) {
        case 'pending':
          return broadcast.status.toLowerCase() === 'pending';
        case 'today':
          // This would need proper date comparison in real implementation
          return broadcast.dateCreated.includes('Jul 19, 2025');
        case 'joinDate':
          // Custom filter logic would go here
          return true;
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesFilters;
  });

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Broadcast Logs</h2>
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                {filteredBroadcasts.length}
              </span>
            </div>
           
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search broadcasts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
             
              {/* More options */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleFilterToggle('joinDate')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                selectedFilters.joinDate
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Join Date
              {selectedFilters.joinDate && (
                <X className="w-3 h-3 ml-1" onClick={(e) => {
                  e.stopPropagation();
                  handleFilterToggle('joinDate');
                }} />
              )}
            </button>
           
            <button
              onClick={() => handleFilterToggle('today')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                selectedFilters.today
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
              {selectedFilters.today && (
                <X className="w-3 h-3 ml-1" onClick={(e) => {
                  e.stopPropagation();
                  handleFilterToggle('today');
                }} />
              )}
            </button>
           
            <button
              onClick={() => handleFilterToggle('pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                selectedFilters.pending
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
              {selectedFilters.pending && (
                <X className="w-3 h-3 ml-1" onClick={(e) => {
                  e.stopPropagation();
                  handleFilterToggle('pending');
                }} />
              )}
            </button>
           
            {(selectedFilters.joinDate || selectedFilters.today || selectedFilters.pending) && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBroadcasts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || Object.values(selectedFilters).some(Boolean) 
                      ? 'No broadcasts match your search criteria.' 
                      : 'No broadcasts found.'}
                  </td>
                </tr>
              ) : (
                filteredBroadcasts.map((broadcast) => (
                  <tr key={broadcast.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {broadcast.title.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {broadcast.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {broadcast.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {broadcast.alertType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {broadcast.dateCreated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {broadcast.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(broadcast.status)}`}>
                        {getStatusIcon(broadcast.status)}
                        {broadcast.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(broadcast)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit broadcast"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteModal(broadcast)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
           
            <div className="flex items-center gap-1">
              {pageNumbers.slice(0, 5).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
           
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Broadcast</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}