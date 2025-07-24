import React, { useState } from 'react';
import AllResources from './AllResources';
import AddNewResources from './AddNewResources';

// Tab Switcher Component
const TabSwitcher = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'All Resources', count: 108 },
    { id: 'add', label: 'Add New Resources' }
  ];

  return (
    <div className="flex space-x-6 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-2 px-1 font-medium text-sm relative ${
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {tab.count && (
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// Main ResourcesHub Component
const ResourcesHub = () => {
  const [activeTab, setActiveTab] = useState('all');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6 py-4">
            <span className="text-gray-600">Dashboard</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-600">Help</span>
            <span className="text-gray-400">→</span>
            <span className="text-blue-600 font-medium">
              {activeTab === 'add' ? 'Add New Resources' : 'All Resources'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Render the appropriate component based on active tab */}
        {activeTab === 'add' ? <AddNewResources /> : <AllResources />}
      </div>
    </div>
  );
};

export default ResourcesHub;