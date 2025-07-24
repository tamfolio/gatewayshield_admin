import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BroadcastLogs from './BroadcastLogs';
import EmergencyBroadcastForm from './EmergencyBroadcastForm';

export default function EmergencyBroadcastPage() {
  const [currentView, setCurrentView] = useState('logs'); // 'logs' or 'form'
  const [showForm, setShowForm] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewBroadcast = () => {
    setEditingBroadcast(null);
    setShowForm(true);
  };

  const handleEditBroadcast = (broadcast) => {
    setEditingBroadcast(broadcast);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBroadcast(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBroadcast(null);
    // Trigger refresh of the logs
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTabChange = (tab) => {
    setCurrentView(tab);
    if (tab === 'form') {
      handleNewBroadcast();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 text-sm text-gray-600">
            <span>Dashboard</span>
            <span>/</span>
            <span>Admin Tools</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Emergency Broadcast</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('form')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === 'form'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Send Emergency Broadcast
              </button>
              <button
                onClick={() => handleTabChange('logs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Broadcast Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {currentView === 'logs' && (
          <div>
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Broadcast Management</h1>
                <p className="text-gray-600 mt-1">
                  View and manage all emergency broadcasts sent to your users.
                </p>
              </div>
              <button
                onClick={handleNewBroadcast}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Broadcast
              </button>
            </div>

            {/* Broadcast Logs Component */}
            <BroadcastLogs 
              onEdit={handleEditBroadcast}
              onRefresh={refreshTrigger}
            />
          </div>
        )}

        {currentView === 'form' && !showForm && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Send a Broadcast?
              </h2>
              <p className="text-gray-600 mb-6">
                Create and send emergency broadcasts to keep your users informed about important updates and alerts.
              </p>
              <button
                onClick={handleNewBroadcast}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Broadcast
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <EmergencyBroadcastForm
          onClose={handleCloseForm}
          editBroadcast={editingBroadcast}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}