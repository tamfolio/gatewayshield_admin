import React, { useState, useEffect } from 'react';
import { ChevronDown, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, ChevronRight } from 'lucide-react';
import BroadcastLogs from './BroadcastLogs';
import { useApiClient, broadcastApi } from '../../../../Utils/apiClient';

export default function EmergencyBroadcastForm() {
  const [activeTab, setActiveTab] = useState('new'); 
  const [headerTitle, setHeaderTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [alertType, setAlertType] = useState('Red Alert');
  const [region, setRegion] = useState('All');
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [alertTypes, setAlertTypes] = useState(['Red Alert', 'Yellow Alert', 'Green Alert', 'Blue Alert', 'Weather']);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [loadingAlertTypes, setLoadingAlertTypes] = useState(false);

  const apiClient = useApiClient();
  
  // Region mappings with LGA IDs
  const regions = [
    { name: 'All', lgaId: null },
    { name: 'Lagos', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP3' },
    { name: 'Abuja', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP4' },
    { name: 'Kano', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP5' },
    { name: 'Ogun', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP6' },
    { name: 'Rivers', lgaId: '01JZJPZFSFDFERZQQEYQ39WZP7' }
  ];

  const characterCount = bodyText.length;
  const maxCharacters = 500;

  // Load alert types from API on component mount
  useEffect(() => {
    loadAlertTypes();
  }, []);

  const loadAlertTypes = async () => {
    try {
      setLoadingAlertTypes(true);
      const result = await broadcastApi.getAlertTypes(apiClient);
      
      if (result && result.data && Array.isArray(result.data)) {
        setAlertTypes(result.data);
        // Set first alert type as default if current default doesn't exist
        if (result.data.length > 0 && !result.data.includes(alertType)) {
          setAlertType(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load alert types:', error);
      // Keep using fallback alert types if API fails
      console.log('Using fallback alert types');
    } finally {
      setLoadingAlertTypes(false);
    }
  };

  const handleEdit = (broadcast) => {
    setEditingBroadcast(broadcast);
    setHeaderTitle(broadcast.title || '');
    setBodyText(broadcast.body || '');
    setAlertType(broadcast.alertType || alertTypes[0]);
    
    // Find region name by lgaId
    const regionObj = regions.find(r => r.lgaId === broadcast.lgaId);
    setRegion(regionObj ? regionObj.name : 'All');
    
    setActiveTab('new');
    setMessage('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!headerTitle.trim()) {
      setMessage('Error: Please enter a broadcast title');
      return;
    }
    
    if (!bodyText.trim()) {
      setMessage('Error: Please enter broadcast content');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Find the selected region object
      const selectedRegion = regions.find(r => r.name === region);
      
      // Prepare broadcast data according to API specification
      const broadcastData = {
        title: headerTitle.trim(),
        body: bodyText.trim(),
        alertType: alertType,
        lgaId: selectedRegion?.lgaId || null // null for "All" regions
      };

      let response;
      if (editingBroadcast) {
        // Edit existing broadcast
        response = await broadcastApi.edit(apiClient, {
          ...broadcastData,
          broadcastId: editingBroadcast.id
        });
        setMessage('Broadcast updated successfully!');
      } else {
        // Create new broadcast
        response = await broadcastApi.create(apiClient, broadcastData);
        setMessage('Broadcast sent successfully!');
      }
      
      console.log('Broadcast operation successful:', response);
      
      // Reset form after successful submission
      setTimeout(() => {
        handleCancel();
        // Switch to logs tab to see the result
        setActiveTab('logs');
      }, 2000);
      
    } catch (error) {
      console.error('Broadcast operation error:', error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        setMessage('Error: Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setMessage('Error: You do not have permission to perform this action.');
      } else if (error.response?.status === 400) {
        setMessage(`Error: ${error.response?.data?.message || 'Invalid request data'}`);
      } else if (error.response?.status === 500) {
        setMessage('Error: Server error. Please try again later.');
      } else {
        setMessage(`Error: ${error.response?.data?.message || error.message || 'Network error occurred'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setHeaderTitle('');
    setBodyText('');
    setAlertType(alertTypes[0] || 'Red Alert');
    setRegion('All');
    setMessage('');
    setEditingBroadcast(null);
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
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {editingBroadcast ? 'Edit Broadcast' : 'New Broadcast'}
        </button>
        <button
          onClick={() => {
            setActiveTab('logs');
            handleCancel(); // Clear edit state when switching to logs
          }}
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
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Error/Success Message */}
            {message && (
              <div className={`mb-6 p-3 rounded-md ${
                message.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                {message}
              </div>
            )}

            {/* Header/Title Field */}
            <div className="grid grid-cols-4 gap-6 items-center mb-6">
              <label className="text-sm font-medium text-gray-700">Header / Title *</label>
              <div className="col-span-3">
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  placeholder="Enter broadcast title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">
                      <Bold size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">
                      <Italic size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">
                      <Underline size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">
                      <List size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">
                      <AlignLeft size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">
                      <AlignCenter size={14} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">
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
                  <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500 text-right">
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
                    onClick={() => setIsAlertDropdownOpen(!isAlertDropdownOpen)}
                    disabled={loadingAlertTypes}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between disabled:opacity-50"
                  >
                    <span className="text-red-600">
                      {loadingAlertTypes ? 'Loading...' : alertType}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {isAlertDropdownOpen && !loadingAlertTypes && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {alertTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setAlertType(type);
                            setIsAlertDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
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
                <p className="text-xs text-gray-500 mt-1">Select Region.</p>
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <button
                    onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <span>{region}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {isRegionDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {regions.map((regionOption) => (
                        <button
                          key={regionOption.name}
                          onClick={() => {
                            setRegion(regionOption.name);
                            setIsRegionDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {regionOption.name}
                          {regionOption.lgaId && (
                            <span className="text-xs text-gray-500 ml-2">({regionOption.lgaId})</span>
                          )}
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
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (editingBroadcast ? 'Updating...' : 'Sending...') : (editingBroadcast ? 'Update Broadcast' : 'Send Emergency Broadcast')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <BroadcastLogs onEdit={handleEdit} />
      )}
    </div>
  );
}