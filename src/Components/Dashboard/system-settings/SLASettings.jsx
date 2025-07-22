import React, { useState } from 'react';
import { ChevronDown, Plus, Check, X } from 'lucide-react';

const SLASettings = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketStatuses, setTicketStatuses] = useState([
    { id: 1, initial: 'General', updated: 'In Progress', stage: '2 hrs' },
    { id: 2, initial: 'General', updated: 'Rejected', stage: '2 hrs' },
    { id: 3, initial: 'Treated', updated: 'Closed', stage: '2 hrs' },
    { id: 4, initial: 'SOS', updated: 'In Progress', stage: '2 hrs' },
    { id: 5, initial: 'SOS', updated: 'Rejected', stage: '2 hrs' },
    { id: 6, initial: 'In Progress', updated: 'On Hold', stage: '2 hrs' },
    { id: 7, initial: 'Treated', updated: 'Closed', stage: '2 hrs' }
  ]);

  const [resolutionSLA, setResolutionSLA] = useState({
    category: '',
    sla: '2 hrs'
  });

  const [resolutionSLAs, setResolutionSLAs] = useState([]);

  // Success Modal for SLA Settings
  const SuccessModal = ({ isOpen, onClose, title = "SLA Settings Updated successfully" }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
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

  const handleTicketStatusChange = (id, field, value) => {
    setTicketStatuses(prev =>
      prev.map(status =>
        status.id === id ? { ...status, [field]: value } : status
      )
    );
  };

  const addMoreResolution = () => {
    if (resolutionSLA.category && resolutionSLA.sla) {
      setResolutionSLAs(prev => [...prev, { ...resolutionSLA, id: Date.now() }]);
      setResolutionSLA({ category: '', sla: '2 hrs' });
    }
  };

  const saveChanges = () => {
    console.log('Saving changes...', { ticketStatuses, resolutionSLAs });
    setShowSuccessModal(true);
  };

  const cancel = () => {
    console.log('Cancelling changes...');
  };

  return (
    <div className="space-y-6">
      {/* Ticket Status Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Ticket Status</h2>
          
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-sm font-medium text-gray-700">Initial Status</div>
            <div className="text-sm font-medium text-gray-700">Updated Status</div>
            <div className="text-sm font-medium text-gray-700">Stage SLA</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-4">
            {ticketStatuses.map((status) => (
              <div key={status.id} className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <select
                    value={status.initial}
                    onChange={(e) => handleTicketStatusChange(status.id, 'initial', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Treated">Treated</option>
                    <option value="SOS">SOS</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    value={status.updated}
                    onChange={(e) => handleTicketStatusChange(status.id, 'updated', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Closed">Closed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    value={status.stage}
                    onChange={(e) => handleTicketStatusChange(status.id, 'stage', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="2 hrs">2 hrs</option>
                    <option value="4 hrs">4 hrs</option>
                    <option value="8 hrs">8 hrs</option>
                    <option value="24 hrs">24 hrs</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Manage Resolution SLA Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Manage Resolution SLA</h2>
          
          {/* Table Header */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-sm font-medium text-gray-700">Categories</div>
            <div className="text-sm font-medium text-gray-700">SLA</div>
          </div>

          {/* Table Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <select
                value={resolutionSLA.category}
                onChange={(e) => setResolutionSLA(prev => ({ ...prev, category: e.target.value }))}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Incident Type</option>
                <option value="SOS">SOS</option>
                <option value="Fire">Fire</option>
                <option value="Fraud">Fraud</option>
                <option value="Vandalism">Vandalism</option>
                <option value="Arson">Arson</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={resolutionSLA.sla}
                onChange={(e) => setResolutionSLA(prev => ({ ...prev, sla: e.target.value }))}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2 hrs">2 hrs</option>
                <option value="4 hrs">4 hrs</option>
                <option value="8 hrs">8 hrs</option>
                <option value="24 hrs">24 hrs</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Add More Button */}
          <button
            onClick={addMoreResolution}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add more
          </button>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </div>
  );
};

export default SLASettings;