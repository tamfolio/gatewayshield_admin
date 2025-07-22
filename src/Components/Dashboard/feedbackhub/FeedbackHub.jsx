import React, { useState } from 'react';
import CaseReview from './CaseReview';
import GeneralFeedback from './GeneralFeedback';

const FeedbackHub = () => {
  const [activeTab, setActiveTab] = useState('Case Review');
  
  const tabs = ['Case Review', 'General Feedback'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Case Review':
        return <CaseReview />;
      case 'General Feedback':
        return <GeneralFeedback />;
      default:
        return <CaseReview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb and Tabs */}
      <div className="p-6 pb-0">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span className="mx-2">›</span>
            <span>Admin Tools</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Feedback Hub</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Feedback Hub</h1>
          
          {/* Tabs */}
          <div className="flex border border-gray-400 rounded-lg p-1.5 mb-6 w-fit">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap text-sm ${
                  activeTab === tab 
                    ? 'bg-gray-200 text-gray-900 shadow-sm' 
                    : 'text-black hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default FeedbackHub;