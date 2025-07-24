import React, { useState, useMemo } from 'react';
import SLASettings from './SLASettings';
import ManageIncidentType from './ManageIncidentType';
import ClosureReasons from './ClosureReasons';

const SLAHub = () => {
  const [activeTab, setActiveTab] = useState('sla-settings');

  const tabs = useMemo(() => [
    { id: 'sla-settings', label: 'SLA Settings' },
    { id: 'manage-incident', label: 'Manage Incident Type' },
    { id: 'closure-reasons', label: 'Closure Reasons' }
  ], []);

  const renderActiveComponent = useMemo(() => {
    switch (activeTab) {
      case 'sla-settings':
        return <SLASettings key="sla-settings" />;
      case 'manage-incident':
        return <ManageIncidentType key="manage-incident" />;
      case 'closure-reasons':
        return <ClosureReasons key="closure-reasons" />;
      default:
        return <SLASettings key="default" />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center text-sm text-gray-600">
          <span className="hover:text-gray-900 cursor-pointer">Dashboard</span>
          <span className="mx-2">›</span>
          <span className="hover:text-gray-900 cursor-pointer">System Settings</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Community Hub</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="inline-flex space-x-1 bg-white p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gray-300 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {renderActiveComponent}
      </div>
    </div>
  );
};

export default SLAHub;