import React, { useState } from 'react';
import { ChevronDown, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, ChevronRight } from 'lucide-react';
import BroadcastLogs from './BroadcastLogs'; 

export default function EmergencyBroadcastForm() {
  const [activeTab, setActiveTab] = useState('new'); 
  const [headerTitle, setHeaderTitle] = useState('Rampant Rape Case in Ogun State');
  const [bodyText, setBodyText] = useState("I'm a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and workflow development.");
  const [alertType, setAlertType] = useState('Red Alert');
  const [region, setRegion] = useState('All');
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const alertTypes = ['Red Alert', 'Yellow Alert', 'Green Alert', 'Blue Alert'];
  const regions = ['All', 'Lagos', 'Abuja', 'Kano', 'Ogun', 'Rivers'];

  const characterCount = bodyText.length;
  const maxCharacters = 500;

  const handleSubmit = async () => {
    if (!headerTitle.trim() || !bodyText.trim()) {
      setMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setMessage('');

 
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage('Broadcast sent successfully!');
      
      // Reset form after successful submission
      setTimeout(() => {
        setHeaderTitle('');
        setBodyText('');
        setAlertType('Red Alert');
        setRegion('All');
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage(`Error: ${error.message || 'Network error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setHeaderTitle('');
    setBodyText('');
    setAlertType('Red Alert');
    setRegion('All');
    setMessage('');
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
          New Broadcast
        </button>
        <button
          onClick={() => setActiveTab('logs')}
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
            <h2 className="text-xl font-semibold text-gray-900">Create New Broadcast</h2>
            <p className="text-sm text-gray-600 mt-1">Update your News information and Images via Media here.</p>
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
                  placeholder="Rampant Rape Case in Ogun State"
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
                <p className="text-xs text-gray-500 mt-1">Write a short introduction.</p>
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
                    placeholder="Write your broadcast message here..."
                    maxLength={maxCharacters}
                  />
                  
                  {/* Character Count */}
                  <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500 text-right">
                    {characterCount} characters left
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <span className="text-red-600">{alertType}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {isAlertDropdownOpen && (
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
                          key={regionOption}
                          onClick={() => {
                            setRegion(regionOption);
                            setIsRegionDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {regionOption}
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
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !headerTitle.trim() || !bodyText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Emergency Broadcast'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <BroadcastLogs />
      )}
    </div>
  );
}