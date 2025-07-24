import React, { useState, useEffect } from 'react';
import { ChevronDown, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, ChevronRight } from 'lucide-react';
import BroadcastLogs from './BroadcastLogs';
import SuccessModal from './SuccessModal'; // Import your success modal
import { useApiClient, broadcastApi } from '../../../../Utils/apiClient';

export default function EmergencyBroadcastForm({ onBroadcastUpdate }) {
  // Tab and form state
  const [activeTab, setActiveTab] = useState('new');
  const [headerTitle, setHeaderTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [alertType, setAlertType] = useState('Red Alert');
  const [region, setRegion] = useState('All');
  
  // Dropdown states
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  
  // Loading and message states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingAlertTypes, setLoadingAlertTypes] = useState(false);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState('created'); // 'created' or 'updated'
  
  // Data states
  const [alertTypes, setAlertTypes] = useState(['Red Alert', 'Yellow Alert', 'Green Alert', 'Blue Alert', 'Weather']);
  const [editingBroadcast, setEditingBroadcast] = useState(null);

  const apiClient = useApiClient();
  
  // Region mappings with LGA IDs
  const regions = [
    { name: 'All', lgaId: 'ALL' },
    { name: 'Lagos', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP3' },
    { name: 'Abuja', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP4' },
    { name: 'Kano', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP5' },
    { name: 'Ogun', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP6' },
    { name: 'Rivers', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP7' }
  ];

  // Character count for body text
  const characterCount = bodyText.length;
  const maxCharacters = 500;

  // Load alert types from API on component mount
  useEffect(() => {
    loadAlertTypes();
  }, []);

  /**
   * Load alert types from API
   */
  const loadAlertTypes = async () => {
    try {
      setLoadingAlertTypes(true);
      const result = await broadcastApi.getAlertTypes(apiClient);
      
      console.log('🏷️ Alert types API response:', result);
      
      // Handle different response structures
      let alertTypesArray = [];
      if (Array.isArray(result)) {
        alertTypesArray = result;
      } else if (result?.data && Array.isArray(result.data)) {
        alertTypesArray = result.data;
      } else if (result?.alertTypes && Array.isArray(result.alertTypes)) {
        alertTypesArray = result.alertTypes;
      }
      
      if (alertTypesArray.length > 0) {
        setAlertTypes(alertTypesArray);
        // Set first alert type as default if current default doesn't exist
        if (!alertTypesArray.includes(alertType)) {
          setAlertType(alertTypesArray[0]);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load alert types:', error);
      // Keep using fallback alert types if API fails
      console.log('Using fallback alert types');
    } finally {
      setLoadingAlertTypes(false);
    }
  };

  /**
   * Handle editing a broadcast from the logs
   */
  const handleEdit = (broadcast) => {
    console.log('📝 Editing broadcast:', broadcast);
    
    setEditingBroadcast(broadcast);
    setHeaderTitle(broadcast.title || '');
    setBodyText(broadcast.body || '');
    setAlertType(broadcast.alertType || alertTypes[0]);
    
    // Handle lgaId mapping properly
    const regionObj = regions.find(r => r.lgaId === broadcast.lgaId);
    // If no matching region found, check if it's a null/undefined value (meaning "All")
    if (!regionObj && (broadcast.lgaId === null || broadcast.lgaId === undefined || broadcast.lgaId === 'ALL')) {
      setRegion('All');
    } else {
      setRegion(regionObj ? regionObj.name : 'All');
    }
    
    console.log('📝 Edit form populated with:', {
      title: broadcast.title,
      body: broadcast.body,
      alertType: broadcast.alertType,
      lgaId: broadcast.lgaId,
      selectedRegion: regionObj?.name || 'All',
      broadcastId: broadcast.id || broadcast._id
    });
    
    setActiveTab('new');
    setMessage('');
  };

  /**
   * Validate form data before submission
   */
  const validateForm = () => {
    if (!headerTitle.trim()) {
      setMessage('Error: Please enter a broadcast title');
      return false;
    }
    
    if (!bodyText.trim()) {
      setMessage('Error: Please enter broadcast content');
      return false;
    }

    if (bodyText.length > maxCharacters) {
      setMessage(`Error: Body text exceeds maximum length of ${maxCharacters} characters`);
      return false;
    }

    return true;
  };

  /**
   * Handle form submission for both create and edit
   */
  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Find the selected region object
      const selectedRegion = regions.find(r => r.name === region);
      
      let response;
      
      if (editingBroadcast) {
        // Edit existing broadcast - ensure ALL required fields are included
        const editData = {
          title: headerTitle.trim(),
          body: bodyText.trim(),
          alertType: alertType,
          lgaId: selectedRegion?.lgaId || 'ALL',
          broadcastId: editingBroadcast.id || editingBroadcast._id
        };
        
        console.log('🔄 Editing broadcast with complete payload:', editData);
        
        // Validate broadcast ID is present
        if (!editData.broadcastId) {
          throw new Error('Broadcast ID is missing for edit operation');
        }
        
        response = await broadcastApi.edit(apiClient, editData);
        
        // Show success modal for update
        setSuccessModalType('updated');
        setShowSuccessModal(true);
        
      } else {
        // Create new broadcast
        const broadcastData = {
          title: headerTitle.trim(),
          body: bodyText.trim(),
          alertType: alertType,
          lgaId: selectedRegion?.lgaId || 'ALL'
        };
        
        console.log('📤 Creating new broadcast with payload:', broadcastData);
        response = await broadcastApi.create(apiClient, broadcastData);
        
        // Show success modal for create
        setSuccessModalType('created');
        setShowSuccessModal(true);
      }
      
      console.log('✅ Broadcast operation successful:', response);
      
    } catch (error) {
      console.error('❌ Broadcast operation error:', error);
      handleSubmissionError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle success modal close - stay on page
   */
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Reset form and switch to logs tab
    handleCancel();
    setActiveTab('logs');
    
    // Notify parent component to refresh if callback is provided
    if (onBroadcastUpdate) {
      onBroadcastUpdate();
    }
  };

  /**
   * Handle redirect to dashboard
   */
  const handleRedirectToDashboard = () => {
    setShowSuccessModal(false);
    
    // Reset form
    handleCancel();
    
    // Redirect to dashboard - you can customize this route
    window.location.href = '/dashboard';
    // Or if using React Router: navigate('/dashboard');
  };

  /**
   * Handle submission errors with specific error messages
   */
  const handleSubmissionError = (error) => {
    if (error.message && error.message.includes('Missing required fields')) {
      setMessage(`Error: ${error.message}`);
    } else if (error.response?.status === 401) {
      setMessage('Error: Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      setMessage('Error: You do not have permission to perform this action.');
    } else if (error.response?.status === 400) {
      // Handle validation errors more specifically
      const errorMsg = error.response?.data?.message || 'Invalid request data';
      if (errorMsg.includes('lgaId')) {
        setMessage('Error: Please select a valid region.');
      } else {
        setMessage(`Error: ${errorMsg}`);
      }
    } else if (error.response?.status === 404) {
      setMessage('Error: Broadcast not found. It may have been deleted.');
    } else if (error.response?.status === 500) {
      setMessage('Error: Server error. Please try again later.');
    } else {
      setMessage(`Error: ${error.response?.data?.message || error.message || 'Network error occurred'}`);
    }
  };

  /**
   * Reset form to initial state
   */
  const handleCancel = () => {
    setHeaderTitle('');
    setBodyText('');
    setAlertType(alertTypes[0] || 'Red Alert');
    setRegion('All');
    setMessage('');
    setEditingBroadcast(null);
    setIsAlertDropdownOpen(false);
    setIsRegionDropdownOpen(false);
  };

  /**
   * Handle tab switching with cleanup
   */
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'logs') {
      handleCancel(); // Clear edit state when switching to logs
    }
  };

  /**
   * Close all dropdowns
   */
  const closeAllDropdowns = () => {
    setIsAlertDropdownOpen(false);
    setIsRegionDropdownOpen(false);
  };

  /**
   * Handle dropdown selection for alert type
   */
  const handleAlertTypeSelect = (type) => {
    setAlertType(type);
    setIsAlertDropdownOpen(false);
  };

  /**
   * Handle dropdown selection for region
   */
  const handleRegionSelect = (regionName) => {
    setRegion(regionName);
    setIsRegionDropdownOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4" />
        <span>Admin Tools</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">Emergency Broadcast</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabSwitch('new')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {editingBroadcast ? 'Edit Broadcast' : 'New Broadcast'}
        </button>
        <button
          onClick={() => handleTabSwitch('logs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'logs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Broadcast Logs
        </button>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'new' ? (
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingBroadcast ? 'Edit Broadcast' : 'Create New Broadcast'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingBroadcast 
                ? 'Update the emergency broadcast details below.' 
                : 'Send emergency broadcasts to users in selected regions.'
              }
            </p>
            {editingBroadcast && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Editing:</strong> {editingBroadcast.title}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ID: {editingBroadcast.id || editingBroadcast._id}
                </p>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Error Message (Success is now handled by modal) */}
            {message && message.includes('Error') && (
              <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
                {message}
              </div>
            )}

            {/* Header/Title Field */}
            <div className="grid grid-cols-4 gap-6 items-center mb-6">
              <label className="text-sm font-medium text-gray-700">
                Header / Title *
              </label>
              <div className="col-span-3">
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  placeholder="Enter broadcast title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {headerTitle.length}/100 characters
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Body Text Field */}
            <div className="grid grid-cols-4 gap-6 items-start mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Body Text *</label>
                <p className="text-xs text-gray-500 mt-1">Write your emergency message.</p>
              </div>
              <div className="col-span-3">
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  {/* Rich Text Toolbar */}
                  <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1">
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Bold">
                      <Bold size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Italic">
                      <Italic size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Underline">
                      <Underline size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600" title="List">
                      <List size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Align Left">
                      <AlignLeft size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Align Center">
                      <AlignCenter size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Align Right">
                      <AlignRight size={14} />
                    </button>
                  </div>
                  
                  {/* Text Area */}
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full px-3 py-3 focus:outline-none resize-none text-sm"
                    rows="4"
                    placeholder="Write your emergency broadcast message here..."
                    maxLength={maxCharacters}
                  />
                  
                  {/* Character Count */}
                  <div className={`bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-right ${
                    characterCount > maxCharacters * 0.9 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {maxCharacters - characterCount} characters left
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Alert Type Field */}
            <div className="grid grid-cols-4 gap-6 items-start mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Alert Type</label>
                <p className="text-xs text-gray-500 mt-1">Select Alert type.</p>
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsAlertDropdownOpen(!isAlertDropdownOpen);
                      setIsRegionDropdownOpen(false);
                    }}
                    disabled={loadingAlertTypes}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-red-600">
                      {loadingAlertTypes ? 'Loading alert types...' : alertType}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                      isAlertDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {isAlertDropdownOpen && !loadingAlertTypes && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {alertTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleAlertTypeSelect(type)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                        >
                          <span className="text-red-600">{type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Region Field */}
            <div className="grid grid-cols-4 gap-6 items-start mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Region</label>
                <p className="text-xs text-gray-500 mt-1">Select target region.</p>
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsRegionDropdownOpen(!isRegionDropdownOpen);
                      setIsAlertDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    <span>{region}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                      isRegionDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {isRegionDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {regions.map((regionOption) => (
                        <button
                          key={regionOption.name}
                          onClick={() => handleRegionSelect(regionOption.name)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span>{regionOption.name}</span>
                            {regionOption.lgaId !== 'ALL' && (
                              <span className="text-xs text-gray-500">({regionOption.lgaId.slice(-6)})</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !headerTitle.trim() || !bodyText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isLoading 
                  ? (editingBroadcast ? 'Updating...' : 'Sending...') 
                  : (editingBroadcast ? 'Update Broadcast' : 'Send Emergency Broadcast')
                }
              </button>
            </div>
          </div>
        </div>
      ) : (
        <BroadcastLogs 
          onEdit={handleEdit} 
          refreshTrigger={onBroadcastUpdate ? Date.now() : 0} 
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        type={successModalType}
        onRedirectToDashboard={handleRedirectToDashboard}
      />

      {/* Click outside handler */}
      {(isAlertDropdownOpen || isRegionDropdownOpen) && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={closeAllDropdowns}
        />
      )}
    </div>
  );
}