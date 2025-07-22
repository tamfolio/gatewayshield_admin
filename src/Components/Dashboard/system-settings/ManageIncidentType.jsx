import React, { useState } from 'react';
import { Search, Plus, ChevronDown, Check, X } from 'lucide-react';

const ManageIncidentType = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [incidents, setIncidents] = useState([
    { id: 1, name: 'SOS', resolution: '4hrs' },
    { id: 2, name: 'Fraud', resolution: '4hrs' },
    { id: 3, name: 'Fire', resolution: '4hrs' },
    { id: 4, name: 'Vandalism', resolution: '4hrs' },
    { id: 5, name: 'Arson', resolution: '4hrs' },
    { id: 6, name: 'Vandalism', resolution: '4hrs' },
    { id: 7, name: 'Vandalism', resolution: '4hrs' },
    { id: 8, name: 'Vandalism', resolution: '4hrs' },
    { id: 9, name: 'Vandalism', resolution: '4hrs' },
    { id: 10, name: 'Vandalism', resolution: '4hrs' }
  ]);

  // Add Incident Modal
  const AddIncidentModal = ({ isOpen, onClose }) => {
    const [incidentName, setIncidentName] = useState('');
    const [resolutionSLA, setResolutionSLA] = useState('4hrs');

    if (!isOpen) return null;

    const handleSave = () => {
      if (incidentName.trim()) {
        const newIncident = {
          id: incidents.length + 1,
          name: incidentName.trim(),
          resolution: resolutionSLA
        };
        setIncidents(prev => [...prev, newIncident]);
        setIncidentName('');
        setResolutionSLA('4hrs');
        onClose();
        setShowSuccessModal(true);
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution SLA
              </label>
              <div className="relative">
                <select
                  value={resolutionSLA}
                  onChange={(e) => setResolutionSLA(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                >
                  <option value="2hrs">2 hours</option>
                  <option value="4hrs">4 hours</option>
                  <option value="8hrs">8 hours</option>
                  <option value="24hrs">24 hours</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Save
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

  const totalPages = Math.ceil(filteredIncidents.length / 10);

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
              <option value="name">Sort by</option>
              <option value="resolution">Resolution</option>
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
            {filteredIncidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {incident.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {incident.resolution}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <div className="flex space-x-2">
          {[1, 2, 3, '...', 8, 9, 10].map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : typeof page === 'number'
                  ? 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                  : 'text-gray-400 cursor-default'
              }`}
              disabled={typeof page !== 'number'}
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
    </div>
  );
};

export default ManageIncidentType;