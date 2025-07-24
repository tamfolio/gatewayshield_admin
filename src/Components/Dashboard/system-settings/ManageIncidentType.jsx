import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Check, X } from 'lucide-react';
import { useApiClient, slaApi } from '../../../Utils/apiClient';
import { DataTableSkeleton } from './LoadingSkeleton';

const ManageIncidentType = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const apiClient = useApiClient();
  
  const [incidents, setIncidents] = useState([]);

  // Load incidents on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await slaApi.getIncidentSlas(apiClient);
        
        if (!isMounted) return;
        
        if (response?.data) {
          const formattedIncidents = response.data.map((item, index) => ({
            id: item.id || index + 1,
            name: item.incidentName || item.name || '',
            resolution: item.resolutionSla ? `${item.resolutionSla}hrs` : '4hrs'
          }));
          setIncidents(formattedIncidents);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading incidents:', err);
          setError('Failed to load incidents. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadIncidents();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Add Incident Modal
  const AddIncidentModal = ({ isOpen, onClose }) => {
    const [incidentName, setIncidentName] = useState('');
    const [resolutionSLA, setResolutionSLA] = useState('4');

    if (!isOpen) return null;

    const handleSave = async () => {
      if (incidentName.trim()) {
        try {
          setSaving(true);
          
          const response = await slaApi.createIncident(apiClient, {
            name: incidentName.trim(),
            resolutionSla: resolutionSLA
          });

          if (response?.data) {
            const newIncident = {
              id: response.data.id || incidents.length + 1,
              name: incidentName.trim(),
              resolution: `${resolutionSLA}hrs`
            };
            setIncidents(prev => [...prev, newIncident]);
          }

          setIncidentName('');
          setResolutionSLA('4');
          onClose();
          setShowSuccessModal(true);
        } catch (err) {
          console.error('Error creating incident:', err);
          setError('Failed to create incident. Please try again.');
        } finally {
          setSaving(false);
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add New Incident</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Name
              </label>
              <input
                type="text"
                value={incidentName}
                onChange={(e) => setIncidentName(e.target.value)}
                placeholder="Enter incident name"
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution SLA (hours)
              </label>
              <div className="relative">
                <select
                  value={resolutionSLA}
                  onChange={(e) => setResolutionSLA(e.target.value)}
                  disabled={saving}
                  className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 disabled:opacity-50"
                >
                  <option value="2">2 hours</option>
                  <option value="4">4 hours</option>
                  <option value="8">8 hours</option>
                  <option value="24">24 hours</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !incidentName.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Success Modal
  const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Incident Created successfully
          </h3>
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

  const filteredIncidents = incidents.filter(incident =>
    incident.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort incidents
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'resolution') {
      const aHours = parseInt(a.resolution.replace('hrs', ''));
      const bHours = parseInt(b.resolution.replace('hrs', ''));
      return aHours - bHours;
    }
    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIncidents = sortedIncidents.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return <DataTableSkeleton />;
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Manage Incident Type</h2>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘K</span>
          </div>
          
          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="resolution">Sort by Resolution</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Add Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Incident
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Incident
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-end">
                  Resolution SLA
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedIncidents.length > 0 ? (
              paginatedIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {incident.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {incident.resolution}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No incidents found matching your search.' : 'No incidents available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      <AddIncidentModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </div>
  );
};

export default ManageIncidentType;