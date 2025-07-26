import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Calendar, X, Loader2, CheckCircle } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';
import { auditLogsApi, auditLogsUtils, useApiClient } from '../../../Utils/apiClient';

// Simple inline SuccessModal component
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully.", 
  buttonText = "Continue"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          {title}
        </h3>

        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const AuditLogs = () => {
  const apiClient = useApiClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    userRole: [],
    timeStamp: null
  });
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // API state
  const [auditLogs, setAuditLogs] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Load initial data
  useEffect(() => {
    // Check if API functions are available
    if (apiClient && auditLogsApi && auditLogsUtils) {
      loadAuditLogs();
      loadUserRoles();
    } else {
      console.warn('⚠️ API client or audit logs API not available, using mock data');
      // Use mock data immediately
      setAuditLogs([
        { id: '#F234567', logId: '#F234567', userRole: 'Police Station', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234568', logId: '#F234568', userRole: 'Comm. Centre Agent', action: 'Changed status to "Assigned to Station"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234569', logId: '#F234569', userRole: 'Police Station Officer', action: 'Changed status to "In Progress"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234570', logId: '#F234570', userRole: 'Comm. Centre Agent', action: 'Changed status to "Treated"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234571', logId: '#F234571', userRole: 'Citizen', action: 'Left 5 Star review on "xxx"', time: '23:00', date: 'Jan 4, 2025' }
      ]);
      setUserRoles(['Police Station', 'Police Station Officer', 'Citizen', 'Comm. Centre Agent']);
      setPagination(prev => ({ ...prev, total: 5 }));
      setLoading(false);
    }
  }, [apiClient]);

  // Load logs when filters or pagination change
  useEffect(() => {
    loadAuditLogs();
  }, [selectedFilters, pagination.currentPage, searchTerm]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if API functions are available
      if (!auditLogsApi || !auditLogsUtils) {
        throw new Error('Audit logs API not available');
      }
      
      const filters = auditLogsUtils.validateFilters({
        userRole: selectedFilters.userRole,
        timeStamp: selectedFilters.timeStamp,
        search: searchTerm
      });
      
      console.log('🔍 Loading audit logs with filters:', filters);
      
      const response = await auditLogsApi.getAll(
        apiClient, 
        pagination.currentPage, 
        pagination.pageSize, 
        filters
      );
      
      const { logs, pagination: newPagination } = auditLogsUtils.parseGetAllResponse(response);
      const transformedLogs = auditLogsUtils.transformAuditLogsData(logs);
      
      setAuditLogs(transformedLogs);
      setPagination(prev => ({ ...prev, ...newPagination }));
      
      console.log('✅ Audit logs loaded successfully:', transformedLogs.length, 'logs');
    } catch (error) {
      console.error('❌ Failed to load audit logs:', error);
      setError(error.message || 'Failed to load audit logs');
      
      // Fallback to mock data if API fails
      console.log('🔄 Using mock data fallback');
      setAuditLogs([
        { id: '#F234567', logId: '#F234567', userRole: 'Police Station', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234568', logId: '#F234568', userRole: 'Comm. Centre Agent', action: 'Changed status to "Assigned to Station"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234569', logId: '#F234569', userRole: 'Police Station Officer', action: 'Changed status to "In Progress"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234570', logId: '#F234570', userRole: 'Comm. Centre Agent', action: 'Changed status to "Treated"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234571', logId: '#F234571', userRole: 'Citizen', action: 'Left 5 Star review on "xxx"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234572', logId: '#F234572', userRole: 'Police Station', action: 'Changed status to "Treated"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234573', logId: '#F234573', userRole: 'Comm. Centre Agent', action: 'Changed status to "In Progress"', time: '23:00', date: 'Jan 4, 2025' },
        { id: '#F234574', logId: '#F234574', userRole: 'Police Station Officer', action: 'Changed status to "Rejected"', time: '23:00', date: 'Jan 4, 2025' }
      ]);
      setPagination(prev => ({ ...prev, total: 8 }));
    } finally {
      setLoading(false);
    }
  };

  const loadUserRoles = async () => {
    try {
      if (!auditLogsApi) {
        throw new Error('Audit logs API not available');
      }
      
      console.log('👥 Loading user roles...');
      const roles = await auditLogsApi.getUserRoles(apiClient);
      setUserRoles(Array.isArray(roles) ? roles : []);
      console.log('✅ User roles loaded:', roles);
    } catch (error) {
      console.error('❌ Failed to load user roles:', error);
      // Use fallback roles
      setUserRoles([
        'Police Station',
        'Police Station Officer', 
        'Citizen',
        'Comm. Centre Agent'
      ]);
    }
  };

  const handleUserRoleFilter = (role) => {
    setSelectedFilters(prev => ({
      ...prev,
      userRole: prev.userRole.includes(role) 
        ? prev.userRole.filter(r => r !== role)
        : [...prev.userRole, role]
    }));
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedFilters(prev => ({ ...prev, timeStamp: date }));
    setShowDatePicker(false);
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
    setSearchTerm('');
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      
      // Try to export from API first if available
      if (auditLogsApi && auditLogsUtils) {
        try {
          const filters = auditLogsUtils.validateFilters({
            userRole: selectedFilters.userRole,
            timeStamp: selectedFilters.timeStamp,
            search: searchTerm
          });
          
          console.log('📥 Exporting logs from API with filters:', filters);
          const blob = await auditLogsApi.exportLogs(apiClient, filters);
          
          // Create download link for API response
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log('✅ API export successful');
        } catch (apiError) {
          console.warn('⚠️ API export failed, falling back to client-side export:', apiError);
          
          // Fallback to client-side export
          const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          
          if (auditLogsUtils && auditLogsUtils.exportToCSV) {
            auditLogsUtils.exportToCSV(filteredLogs, filename);
          } else {
            // Manual CSV export if utility not available
            const headers = ['Log ID', 'User Role', 'Action Type', 'Time Stamp'];
            const csvContent = [
              headers.join(','),
              ...filteredLogs.map(log => [
                log.logId || log.id,
                `"${log.userRole}"`,
                `"${log.action}"`,
                `"${log.time} ${log.date}"`
              ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
        }
      } else {
        // Direct client-side export if API not available
        console.log('📥 Using direct client-side export');
        const headers = ['Log ID', 'User Role', 'Action Type', 'Time Stamp'];
        const csvContent = [
          headers.join(','),
          ...filteredLogs.map(log => [
            log.logId || log.id,
            `"${log.userRole}"`,
            `"${log.action}"`,
            `"${log.time} ${log.date}"`
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Export failed:', error);
      setError('Failed to export audit logs. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // Filter logs based on search term (client-side fallback)
  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.logId?.toLowerCase().includes(searchLower) ||
      log.userRole?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.userName?.toLowerCase().includes(searchLower)
    );
  });

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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {loading ? '...' : pagination.total}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
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
                disabled={exporting || loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FiDownloadCloud className="w-4 h-4" />
                )}
                {exporting ? 'Exporting...' : 'Export Log'}
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
          {(selectedFilters.userRole.length > 0 || selectedFilters.timeStamp || searchTerm) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
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
                    {auditLogsUtils.formatDateForDisplay(selectedFilters.timeStamp)}
                    <button onClick={() => removeFilter('timeStamp')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading audit logs...</span>
            </div>
          ) : (
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
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No audit logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={log.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.logId || log.id}
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
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="flex items-center gap-1 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
              <span>←</span>
            </button>
            
            <div className="flex items-center gap-2">
              {(() => {
                const { currentPage, totalPages } = pagination;
                const pages = [];
                
                // Always show first page
                if (totalPages > 0) {
                  pages.push(1);
                }
                
                // Show pages around current page
                if (currentPage > 3) {
                  pages.push('...');
                }
                
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                  if (i > 1) pages.push(i);
                }
                
                // Show last page if there are multiple pages
                if (totalPages > 1) {
                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }
                  pages.push(totalPages);
                }
                
                return pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                    className={`px-3 py-1 text-sm rounded ${
                      page === currentPage
                        ? 'bg-blue-600 text-white' 
                        : page === '...' 
                          ? 'text-gray-400 cursor-default'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    disabled={page === '...' || loading}
                  >
                    {page}
                  </button>
                ));
              })()}
            </div>
            
            <button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="flex items-center gap-1 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <span>→</span>
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {!loading && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Showing {filteredLogs.length > 0 ? ((pagination.currentPage - 1) * pagination.pageSize) + 1 : 0} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of {pagination.total} results
          </div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        title="Export Successful!"
        message="Your audit logs have been successfully exported as a CSV file."
        buttonText="Continue"
      />

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