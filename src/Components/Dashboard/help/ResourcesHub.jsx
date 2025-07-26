import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import AllResources from './AllResources';
import AddNewResources from './AddNewResources';

// Tab Switcher Component
const TabSwitcher = ({ activeTab, onTabChange, resourceCount, editingResource }) => {
  const tabs = [
    { id: 'all', label: 'All Resources' },
    { id: 'add', label: editingResource ? 'Edit Resource' : 'Add New Resources' }
  ];

  return (
    <div className="flex bg-gray-100 rounded-xl p-1 mb-6 max-w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-gray-300 text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Main ResourcesHub Component
const ResourcesHub = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [resourceCount, setResourceCount] = useState(null);
  
  // State for editing - this will be passed to AddNewResources
  const [editingResource, setEditingResource] = useState(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Clear editing resource when going back to all resources
    if (tabId === 'all') {
      setEditingResource(null);
    }
  };

  // Handle when a new resource is added
  const handleResourceAdded = (newResource) => {
    console.log('✅ New resource added:', newResource);
    
    // Trigger refresh of the All Resources tab
    setRefreshTrigger(prev => prev + 1);
    
    // Update resource count if available
    if (resourceCount !== null) {
      setResourceCount(prev => (prev || 0) + 1);
    }

    // Clear editing state since we just added/updated
    setEditingResource(null);
  };

  // Handle edit resource request from AllResources
  const handleEditResource = (resource) => {
    console.log('✏️ Edit resource requested:', resource);
    setEditingResource(resource);
    setActiveTab('add'); // Switch to the add/edit tab
  };

  // Handle going back from Add/Edit
  const handleGoBack = () => {
    setEditingResource(null);
    setActiveTab('all');
  };

  // Handle resource count updates from AllResources component
  const handleResourceCountUpdate = (count) => {
    setResourceCount(count);
  };

  // Get breadcrumb text based on active tab and editing state
  const getBreadcrumbText = () => {
    if (activeTab === 'add') {
      return editingResource ? `Edit Resource: ${editingResource.title}` : 'Add New Resources';
    }
    return 'All Resources';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 py-4">
            <span className="text-gray-600">Dashboard</span>
            <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
            <span className="text-gray-600">Help</span>
            <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
            <span className="text-blue-600 font-medium">
              {getBreadcrumbText()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabSwitcher 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          resourceCount={resourceCount}
          editingResource={editingResource}
        />
        
        {/* Render the appropriate component based on active tab */}
        {activeTab === 'add' ? (
          <AddNewResources 
            onGoBack={handleGoBack}
            onResourceAdded={handleResourceAdded}
            editingResource={editingResource} // Pass the resource to edit
          />
        ) : (
          <AllResources 
            refreshTrigger={refreshTrigger}
            onResourceCountUpdate={handleResourceCountUpdate}
            onEditResource={handleEditResource}
          />
        )}
      </div>
    </div>
  );
};

export default ResourcesHub;