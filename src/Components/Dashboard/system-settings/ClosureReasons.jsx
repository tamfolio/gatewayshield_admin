import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, X } from 'lucide-react';
import { useApiClient, slaApi } from '../../../Utils/apiClient';
import { ListSkeleton } from './LoadingSkeleton';

const ClosureReasons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const apiClient = useApiClient();
  const [reasons, setReasons] = useState([]);

  // Load closure reasons on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadClosureReasons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await incidentApi.getClosureReasons(apiClient);
        
        if (!isMounted) return;
        
        if (response?.data) {
          // Handle both array and object responses
          const reasonsArray = Array.isArray(response.data) 
            ? response.data 
            : response.data.closureReasons || [];
          
          const formattedReasons = reasonsArray.map((item, index) => ({
            id: item.id || index + 1,
            reason: item.reason || item.closureReason || item.name || item
          }));
          
          setReasons(formattedReasons);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading closure reasons:', err);
          setError('Failed to load closure reasons. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClosureReasons();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Add Closure Reason Modal
  const AddClosureReasonModal = ({ isOpen, onClose }) => {
    const [closureReason, setClosureReason] = useState('');

    if (!isOpen) return null;

    const handleSave = async () => {
      if (closureReason.trim()) {
        try {
          setSaving(true);
          
          const response = await incidentApi.createClosureReason(apiClient, {
            reason: closureReason.trim()
          });

          if (response?.data) {
            const newReason = {
              id: response.data.id || reasons.length + 1,
              reason: closureReason.trim()
            };
            setReasons(prev => [...prev, newReason]);
          }

          setClosureReason('');
          onClose();
          setShowSuccessModal(true);
        } catch (err) {
          console.error('Error creating closure reason:', err);
          setError('Failed to create closure reason. Please try again.');
        } finally {
          setSaving(false);
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add New Closure Reason</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Closure Reason
              </label>
              <input
                type="text"
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="Enter closure reason"
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !closureReason.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Success Modal
  const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Closure Reason Created successfully
          </h3>
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Stay on Page
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-gray-600 hover:text-gray-800"
            >
              Redirect to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredReasons = reasons.filter(reason =>
    reason.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header skeleton */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="p-6">
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <ListSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Error Loading Data</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Closure Reasons</h2>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘K</span>
          </div>
          {/* Add Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Closure Reason
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Table Header */}
        <div className="mb-4">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <span>Reason</span>
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        </div>

        {/* Reasons List */}
        <div className="space-y-3">
          {filteredReasons.length > 0 ? (
            filteredReasons.map((reason) => (
              <div key={reason.id} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-900">{reason.reason}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm 
                ? 'No closure reasons found matching your search.' 
                : 'No closure reasons available. Add one to get started.'
              }
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddClosureReasonModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </div>
  );
};

export default ClosureReasons;