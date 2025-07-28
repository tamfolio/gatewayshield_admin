import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useApiClient, slaApi } from '../../../Utils/apiClient';
import { FormSkeleton } from './components/LoadingSkeleton';
import SuccessModal from './components/SuccessModal';

const SLASettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const apiClient = useApiClient();

  const [ticketStatuses, setTicketStatuses] = useState([]);
  const [originalTicketStatuses, setOriginalTicketStatuses] = useState([]);
  
  // Manage Resolution SLA state
  const [availableIncidents, setAvailableIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState('');
  const [selectedSla, setSelectedSla] = useState('2');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

        // Process ticket SLA data
        if (ticketSlaResponse?.data) {
          const processedTicketData = ticketSlaResponse.data.map((item, index) => ({
            id: item.id || index + 1,
            initial: item.initialStatus?.name || item.initialStatus?.description || '',
            updated: item.finalStatus?.name || item.finalStatus?.description || '',
            stage: `${item.time || '2'} hrs`
          }));
          
          setTicketStatuses(processedTicketData);
          setOriginalTicketStatuses(JSON.parse(JSON.stringify(processedTicketData)));
        }

        // Process incident SLA data for dropdown
        if (incidentSlaResponse?.data) {
          const incidents = incidentSlaResponse.data.map((item) => ({
            id: item.incidentType?.id || item.id,
            name: item.incidentType?.name || 'Unknown',
            currentSla: item.time || '2'
          }));
          
          setAvailableIncidents(incidents);
        }

      } catch (err) {
        if (isMounted) {
          console.error('❌ [ERROR] Loading SLA data failed:', err);
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

  // Check for unsaved changes
  useEffect(() => {
    const ticketChanges = JSON.stringify(ticketStatuses) !== JSON.stringify(originalTicketStatuses);
    setHasChanges(ticketChanges);
  }, [ticketStatuses, originalTicketStatuses]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const handleTicketStatusChange = (id, field, value) => {
    setTicketStatuses(prev =>
      prev.map(status =>
        status.id === id ? { ...status, [field]: value } : status
      )
    );
  };

  const handleResolutionSlaUpdate = async () => {
    if (!selectedIncident) {
      setError('Please select an incident type');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const requestData = {
        incidentId: selectedIncident,
        sla: parseInt(selectedSla)
      };

      console.log('📤 [RESOLUTION SLA] Updating:', requestData);
      await slaApi.manageResolutionSla(apiClient, requestData);

      // Reset form
      setSelectedIncident('');
      setSelectedSla('2');
      setSearchTerm('');
      
      // Refresh available incidents to show updated SLA
      const incidentSlaResponse = await slaApi.getIncidentSlas(apiClient);
      if (incidentSlaResponse?.data) {
        const incidents = incidentSlaResponse.data.map((item) => ({
          id: item.incidentType?.id || item.id,
          name: item.incidentType?.name || 'Unknown',
          currentSla: item.time || '2'
        }));
        setAvailableIncidents(incidents);
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error('❌ [RESOLUTION SLA] Error:', err);
      setError(err.message || 'Failed to update resolution SLA. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const validateData = () => {
    const errors = [];
    
    // Validate ticket statuses
    ticketStatuses.forEach((status, index) => {
      if (!status.initial?.trim()) {
        errors.push(`Ticket Row ${index + 1}: Initial Status is required`);
      }
      if (!status.updated?.trim()) {
        errors.push(`Ticket Row ${index + 1}: Updated Status is required`);
      }
      if (!status.stage?.trim()) {
        errors.push(`Ticket Row ${index + 1}: Stage SLA is required`);
      }
      if (status.initial === status.updated) {
        errors.push(`Ticket Row ${index + 1}: Initial and Updated Status cannot be the same`);
      }
    });

    return errors;
  };

  const saveChanges = async () => {
    try {
      // Validate data first
      const validationErrors = validateData();
      if (validationErrors.length > 0) {
        setError(`Validation failed:\n${validationErrors.join('\n')}`);
        return;
      }

      setSaving(true);
      setError(null);

      console.log('🚀 [SAVE] Starting save process...');
      console.log('📊 [SAVE] Ticket statuses to save:', ticketStatuses);

      // Save ticket SLAs
      const ticketSlaPromises = ticketStatuses.map(async (status) => {
        try {
          const original = originalTicketStatuses.find(orig => orig.id === status.id);
          if (original && JSON.stringify(original) === JSON.stringify(status)) {
            console.log('⏭️ [SKIP TICKET] No changes for:', status.id);
            return Promise.resolve();
          }

          const requestData = {
            id: status.id,
            sla: parseInt(status.stage.replace(' hrs', ''))
          };

          console.log('📤 [TICKET SLA] Updating:', requestData);
          return await slaApi.updateTicketSla(apiClient, requestData);
        } catch (error) {
          console.error('❌ [TICKET SLA] Failed to update:', status, error);
          throw new Error(`Failed to update ticket SLA for ${status.initial} → ${status.updated}: ${error.response?.data?.message || error.message}`);
        }
      });

      // Execute all API calls
      console.log('⚡ [SAVE] Executing all ticket SLA API calls...');
      await Promise.all(ticketSlaPromises);

      console.log('✅ [SAVE] All ticket SLA settings saved successfully');
      
      // Update original data to reflect saved state
      setOriginalTicketStatuses(JSON.parse(JSON.stringify(ticketStatuses)));
      setHasChanges(false);
      setShowSuccessModal(true);
      
    } catch (err) {
      console.error('❌ [SAVE] Error saving changes:', err);
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setTicketStatuses(JSON.parse(JSON.stringify(originalTicketStatuses)));
    setHasChanges(false);
    setError(null);
  };

  const retry = () => {
    window.location.reload();
  };

  // Filter incidents based on search term
  const filteredIncidents = availableIncidents.filter(incident =>
    incident.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (error && !ticketStatuses.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
              <p className="text-sm whitespace-pre-line">{error}</p>
            </div>
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ticket Status Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ticket Status</h2>
            {hasChanges && (
              <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
            </div>
          )}
          
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-sm font-medium text-gray-700">Initial Status</div>
            <div className="text-sm font-medium text-gray-700">Updated Status</div>
            <div className="text-sm font-medium text-gray-700">Stage SLA</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-4">
            {ticketStatuses.map((status) => (
              <div key={status.id} className="grid grid-cols-3 gap-4 items-center">
                <div className="relative">
                  <select
                    value={status.initial}
                    onChange={(e) => handleTicketStatusChange(status.id, 'initial', e.target.value)}
                    disabled={saving}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Initial Status</option>
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
                    disabled={saving}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Updated Status</option>
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
                    disabled={saving}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select SLA</option>
                    <option value="2 hrs">2 hrs</option>
                    <option value="4 hrs">4 hrs</option>
                    <option value="8 hrs">8 hrs</option>
                    <option value="12 hrs">12 hrs</option>
                    <option value="24 hrs">24 hrs</option>
                    <option value="48 hrs">48 hrs</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Status Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancel}
              disabled={saving || !hasChanges}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={saving || !hasChanges}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Manage Resolution SLA Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Manage Resolution SLA</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Incident Dropdown with Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Incident Type
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <span className="block truncate">
                    {selectedIncident ? 
                      availableIncidents.find(i => i.id === selectedIncident)?.name || 'Select incident type'
                      : 'Select incident type'
                    }
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {/* Search Input */}
                    <div className="sticky top-0 z-10 bg-white px-2 py-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search incidents..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    {filteredIncidents.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No incidents found
                      </div>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <button
                          key={incident.id}
                          type="button"
                          onClick={() => {
                            setSelectedIncident(incident.id);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                            selectedIncident === incident.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{incident.name}</span>
                            <span className="text-xs text-gray-500">
                              Current: {incident.currentSla}hrs
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SLA Time Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SLA Time
              </label>
              <div className="relative">
                <select
                  value={selectedSla}
                  onChange={(e) => setSelectedSla(e.target.value)}
                  disabled={saving}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="2">2 hrs</option>
                  <option value="4">4 hrs</option>
                  <option value="8">8 hrs</option>
                  <option value="12">12 hrs</option>
                  <option value="24">24 hrs</option>
                  <option value="48">48 hrs</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Resolution SLA Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setSelectedIncident('');
                setSelectedSla('2');
                setSearchTerm('');
              }}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Clear
            </button>
            <button
              onClick={handleResolutionSlaUpdate}
              disabled={saving || !selectedIncident}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {saving ? 'Updating...' : 'Update SLA'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="SLA Settings Updated Successfully"
      />
    </div>
  );
};

export default SLASettings;