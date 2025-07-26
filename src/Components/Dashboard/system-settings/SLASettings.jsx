import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Check, X } from 'lucide-react';
import { useApiClient, slaApi } from '../../../Utils/apiClient';
import { FormSkeleton } from './LoadingSkeleton';

const SLASettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  const apiClient = useApiClient();

  const [ticketStatuses, setTicketStatuses] = useState([]);
  const [incidentSlas, setIncidentSlas] = useState([]);
  const [resolutionSLA, setResolutionSLA] = useState({
    category: '',
    sla: '2'
  });

  // Load data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [ticketSlaResponse, incidentSlaResponse] = await Promise.all([
          slaApi.getTicketSlas(apiClient),
          slaApi.getIncidentSlas(apiClient)
        ]);

        if (!isMounted) return;

        // Process ticket SLA data based on actual API structure
        if (ticketSlaResponse?.data) {
          setTicketStatuses(ticketSlaResponse.data.map((item, index) => ({
            id: item.id || index + 1,
            initial: item.initialStatus?.name || item.initialStatus?.description || '',
            updated: item.finalStatus?.name || item.finalStatus?.description || '',
            stage: `${item.time || '2'} hrs`
          })));
        }

        // Process incident SLA data based on actual API structure
        if (incidentSlaResponse?.data) {
          setIncidentSlas(incidentSlaResponse.data.map((item, index) => ({
            id: item.id || index + 1,
            category: item.initialStatus?.description || item.name || 'Unknown',
            sla: item.time || '2'
          })));
        }

      } catch (err) {
        if (isMounted) {
          console.error('Error loading SLA data:', err);
          setError('Failed to load SLA settings. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [apiClient]);

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
      const newResolution = {
        id: Date.now(),
        category: resolutionSLA.category,
        sla: resolutionSLA.sla
      };
      setIncidentSlas(prev => [...prev, newResolution]);
      setResolutionSLA({ category: '', sla: '2' });
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      setError(null);

      // Format data for API based on expected structure
      const ticketSlaData = ticketStatuses.map(status => ({
        id: status.id,
        time: parseInt(status.stage.replace(' hrs', '')),
        initialStatus: {
          name: status.initial.toLowerCase().replace(/\s+/g, ''),
          description: status.initial
        },
        finalStatus: {
          name: status.updated.toLowerCase().replace(/\s+/g, ''),
          description: status.updated
        }
      }));

      const incidentSlaData = incidentSlas.map(incident => ({
        id: incident.id,
        time: parseInt(incident.sla),
        initialStatus: {
          name: incident.category.toLowerCase().replace(/\s+/g, ''),
          description: incident.category
        }
      }));

      // Save to API
      await Promise.all([
        slaApi.updateTicketSlas(apiClient, { data: ticketSlaData }),
        slaApi.updateIncidentSlas(apiClient, { data: incidentSlaData })
      ]);

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    // Reload data to reset changes
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <FormSkeleton />
        <FormSkeleton />
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
                    <option value="New">New</option>
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
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Manage Resolution SLA Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Manage Resolution SLA</h2>
          
          {/* Existing SLAs */}
          {incidentSlas.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-sm font-medium text-gray-700">Categories</div>
                <div className="text-sm font-medium text-gray-700">SLA</div>
              </div>
              <div className="space-y-2">
                {incidentSlas.map((sla) => (
                  <div key={sla.id} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100">
                    <div className="text-sm text-gray-900">{sla.category}</div>
                    <div className="text-sm text-gray-900">{sla.sla} hrs</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
                <option value="2">2 hrs</option>
                <option value="4">4 hrs</option>
                <option value="8">8 hrs</option>
                <option value="24">24 hrs</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Add More Button */}
          <button
            onClick={addMoreResolution}
            disabled={!resolutionSLA.category || !resolutionSLA.sla}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add more
          </button>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancel}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
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