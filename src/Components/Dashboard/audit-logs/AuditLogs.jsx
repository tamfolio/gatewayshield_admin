import React, { useState } from 'react';
import { ChevronDown, Search, Calendar, X } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    userRole: [],
    timeStamp: null
  });
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const userRoles = [
    'Police Station',
    'Police Station Officer', 
    'Citizen',
    'Comm. Centre Agent'
  ];

  const auditData = [
    { id: '#F234567', userRole: 'Police Station', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Comm. Centre Agent', action: 'Changed status to "Assigned to Station"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Police Station Officer', action: 'Changed status to "In Progress"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Comm. Centre Agent', action: 'Changed status to "Treated"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Citizen', action: 'Left 5 Star review on "xxx"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Police Station', action: 'Changed status to "Treated"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Comm. Centre Agent', action: 'Changed status to "In Progress"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Police Station Officer', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Police Station Officer', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' },
    { id: '#F234567', userRole: 'Police Station Officer', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' }
  ];

  const handleUserRoleFilter = (role) => {
    setSelectedFilters(prev => ({
      ...prev,
      userRole: prev.userRole.includes(role) 
        ? prev.userRole.filter(r => r !== role)
        : [...prev.userRole, role]
    }));
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const removeFilter = (type, value) => {
    if (type === 'userRole') {
      setSelectedFilters(prev => ({
        ...prev,
        userRole: prev.userRole.filter(r => r !== value)
      }));
    } else if (type === 'timeStamp') {
      setSelectedFilters(prev => ({ ...prev, timeStamp: null }));
      setSelectedDate('');
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({ userRole: [], timeStamp: null });
    setSelectedDate('');
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedFilters(prev => ({ ...prev, timeStamp: date }));
    setShowDatePicker(false);
  };

  const exportToPDF = () => {
    // Create CSV-like content for download
    const headers = ['Log ID', 'User Role', 'Action Type', 'Time Stamp'];
    const csvContent = [
      headers.join(','),
      ...auditData.map(log => [
        log.id,
        `"${log.userRole}"`,
        `"${log.action}"`,
        `"${log.time} ${log.date}"`
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-logs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    alert('Audit logs exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500">
          <span>Dashboard</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Audit Logs</span>
        </nav>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">100</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </div>
              
              {/* Export Log Button */}
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FiDownloadCloud className="w-4 h-4" />
                Export Log
              </button>
              
              {/* More Actions */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full mt-1"></div>
                <div className="w-1 h-1 bg-current rounded-full mt-1"></div>
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedFilters.userRole.length > 0 || selectedFilters.timeStamp) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFilters.userRole.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {role}
                    <button onClick={() => removeFilter('userRole', role)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                
                {selectedFilters.timeStamp && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {formatDateForDisplay(selectedFilters.timeStamp)}
                    <button onClick={() => removeFilter('timeStamp')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Log ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => setShowUserRoleDropdown(!showUserRoleDropdown)}
                  >
                    User Role
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {showUserRoleDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {userRoles.map((role) => (
                        <label key={role} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.userRole.includes(role)}
                            onChange={() => handleUserRoleFilter(role)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{role}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <Calendar className="w-3 h-3" />
                    Time Stamp
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditData.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {log.userRole}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{log.time}</div>
                      <div className="text-xs">{log.date}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button className="flex items-center gap-1 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors shadow-md" >
            Previous
            <span>←</span>
          </button>
          <div className="flex items-center gap-2">
            {[1, 2, 3, '...', 8, 9, 10].map((page, index) => (
              <button
                key={index}
                className={`px-3 py-1 text-sm rounded ${
                  page === 1 
                    ? 'bg-blue-600 text-white' 
                    : page === '...' 
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors shadow-md">
            Next
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserRoleDropdown || showDatePicker) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowUserRoleDropdown(false);
            setShowDatePicker(false);
          }}
        />
      )}
    </div>
  );
};

export default AuditLogs;