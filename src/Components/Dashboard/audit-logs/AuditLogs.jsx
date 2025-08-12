// AuditLogs.jsx - Client-Side Filtering Solution

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  auditLogsApi,
  auditLogsUtils,
  useApiClient,
} from "../../../Utils/apiClient";
import ExportFunction from "./components/ExportFunction";
import SuccessModal from "./components/SuccessModal";
import AuditTable from "./components/AuditTable";
import AuditFilters from "./components/AuditFilters";

const DEFAULT_PAGE_SIZE = 10;

const AuditLogs = () => {
  const apiClient = useApiClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial filters from URL
  const getInitialFilters = () => {
    const roleParam = searchParams.get('role');
    const dateParam = searchParams.get('date');
    
    return {
      userRole: roleParam ? roleParam.split(',') : [],
      timeStamp: dateParam || null,
    };
  };

  // State management
  const [selectedFilters, setSelectedFilters] = useState(getInitialFilters);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // CHANGED: Store ALL audit logs (unfiltered from server)
  const [allAuditLogs, setAllAuditLogs] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // CHANGED: Client-side pagination state
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Map audit log data
  const mapAuditLogData = (log) => {
    const timestamp = new Date(log.timestamp);
    
    return {
      logId: log.id,
      userRole: log.admin?.role || log.user?.role || "Unknown",
      userName: log.admin?.fullname || "Unknown User",
      action: log.action,
      timestamp: log.timestamp,
      date: timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      originalLog: log,
    };
  };

  // CHANGED: Load ALL audit logs from server (no filters, all pages)
  const loadAllAuditLogs = useCallback(async () => {
    if (!apiClient) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Loading ALL audit logs from server...');

      let allLogs = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Load all pages from server
      while (hasMorePages) {
        try {
          console.log(`📄 Loading page ${currentPage}...`);
          
          const response = await auditLogsApi.getAll(
            apiClient,
            currentPage,
            50, // Larger page size for efficiency
            {} // NO FILTERS - get everything
          );

          if (response?.data?.data) {
            const pageLogs = response.data.data.map(mapAuditLogData);
            allLogs = [...allLogs, ...pageLogs];
            
            // Check if there are more pages
            hasMorePages = currentPage < (response.data.pagination?.totalPages || 1);
            currentPage++;
            
            console.log(`✅ Page ${currentPage - 1} loaded: ${pageLogs.length} logs`);
          } else {
            hasMorePages = false;
          }
        } catch (pageError) {
          console.error(`❌ Error loading page ${currentPage}:`, pageError);
          hasMorePages = false;
        }
      }

      setAllAuditLogs(allLogs);
      
      // Extract available roles from all logs
      const rolesSet = new Set();
      allLogs.forEach(log => {
        if (log.userRole && log.userRole !== "Unknown") {
          rolesSet.add(log.userRole);
        }
      });
      const roles = Array.from(rolesSet).sort();
      setAvailableRoles(roles);
      
      console.log(`✅ ALL audit logs loaded: ${allLogs.length} total logs`);
      console.log(`✅ Available roles: ${roles.length} unique roles`);
      
    } catch (error) {
      console.error('❌ Failed to load audit logs:', error);
      setError(error.message || 'Failed to load audit logs');
      setAllAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  // CHANGED: Client-side filtering of all logs
  const filteredLogs = useMemo(() => {
    console.log('🔍 Applying client-side filtering...');
    console.log('📊 Total logs loaded:', allAuditLogs.length);
    console.log('🎯 Current filters:', selectedFilters);
    
    let filtered = [...allAuditLogs];

    // Apply role filter
    if (selectedFilters.userRole && selectedFilters.userRole.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(log => {
        const match = selectedFilters.userRole.includes(log.userRole);
        return match;
      });
      console.log(`👤 Role filter: ${beforeCount} → ${filtered.length} logs`);
    }

    // Apply date filter
    if (selectedFilters.timeStamp) {
      const beforeCount = filtered.length;
      const selectedDate = new Date(selectedFilters.timeStamp).toISOString().split('T')[0];
      
      filtered = filtered.filter(log => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return selectedDate === logDate;
      });
      console.log(`📅 Date filter: ${beforeCount} → ${filtered.length} logs`);
    }

    console.log('✅ Final filtered logs:', filtered.length);
    return filtered;
  }, [allAuditLogs, selectedFilters]);

  // CHANGED: Client-side pagination
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage]);

  // CHANGED: Pagination info based on filtered results
  const paginationInfo = useMemo(() => {
    const totalLogs = filteredLogs.length;
    const totalPages = Math.ceil(totalLogs / DEFAULT_PAGE_SIZE);
    const startIndex = totalLogs > 0 ? (currentPage - 1) * DEFAULT_PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * DEFAULT_PAGE_SIZE, totalLogs);

    return {
      startIndex,
      endIndex,
      totalLogs,
      totalPages,
    };
  }, [filteredLogs.length, currentPage]);

  // Update URL with current filters and page
  const updateURL = useCallback((filters, page) => {
    const params = new URLSearchParams();
    
    if (filters.userRole?.length > 0) {
      params.set('role', filters.userRole.join(','));
    }
    if (filters.timeStamp) {
      params.set('date', filters.timeStamp);
    }
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    setSearchParams(params);
  }, [setSearchParams]);

  // Event handlers
  const handleFilterChange = useCallback((newFilters) => {
    console.log('🔄 Filter change:', newFilters);
    setSelectedFilters(newFilters);
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    updateURL(newFilters, 1);
  }, [updateURL]);

  const handlePageChange = useCallback((newPage) => {
    const maxPage = Math.ceil(filteredLogs.length / DEFAULT_PAGE_SIZE);
    const targetPage = Math.max(1, Math.min(newPage, maxPage));
    
    console.log(`📄 Page change: ${currentPage} → ${targetPage}`);
    setCurrentPage(targetPage);
    updateURL(selectedFilters, targetPage);
  }, [filteredLogs.length, currentPage, selectedFilters, updateURL]);

  // CHANGED: Load all data once on mount
  useEffect(() => {
    if (apiClient) {
      console.log('🚀 Initial load - loading all audit logs');
      loadAllAuditLogs();
    }
  }, [apiClient, loadAllAuditLogs]);

  // URL sync effect
  useEffect(() => {
    const urlFilters = getInitialFilters();
    const urlPage = parseInt(searchParams.get('page')) || 1;
    
    const filtersChanged = JSON.stringify(urlFilters) !== JSON.stringify(selectedFilters);
    const pageChanged = urlPage !== currentPage;
    
    if (filtersChanged || pageChanged) {
      console.log('🔄 URL changed, syncing state');
      setSelectedFilters(urlFilters);
      setCurrentPage(urlPage);
    }
  }, [searchParams.toString()]);

  // CHANGED: Reset page when filtered results change
  useEffect(() => {
    const maxPage = Math.ceil(filteredLogs.length / DEFAULT_PAGE_SIZE);
    if (currentPage > maxPage && maxPage > 0) {
      console.log(`📄 Resetting page from ${currentPage} to ${maxPage}`);
      setCurrentPage(maxPage);
      updateURL(selectedFilters, maxPage);
    }
  }, [filteredLogs.length, currentPage, selectedFilters, updateURL]);

  // Other handlers
  const handleExportSuccess = () => setShowSuccessModal(true);
  const handleExportError = (errorMessage) => setError(errorMessage);
  const retryLoadData = () => {
    setError(null);
    loadAllAuditLogs();
  };

  // Check for active filters
  const hasActiveFilters = selectedFilters.userRole.length > 0 || selectedFilters.timeStamp;

  // Create pagination object for AuditTable
  const pagination = {
    currentPage,
    totalPages: paginationInfo.totalPages,
    total: paginationInfo.totalLogs,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex text-sm text-gray-500">
          <li>
            <a href="/dashboard" className="hover:text-gray-700">Dashboard</a>
          </li>
          <li className="mx-2" aria-hidden="true">›</li>
          <li className="text-gray-900" aria-current="page">Audit Logs</li>
        </ol>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={retryLoadData}
                className="text-red-600 hover:text-red-800 text-xs underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-xs underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {loading ? "..." : `${paginationInfo.totalLogs}${hasActiveFilters ? ' filtered' : ' total'}`}
              </span>
            </div>

            <ExportFunction
              onExportAllLogs={() => filteredLogs} // Export filtered logs
              onExportSuccess={handleExportSuccess}
              onExportError={handleExportError}
              disabled={loading}
              isLoadingAllLogs={false}
            />
          </div>

          <AuditFilters
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            hasActiveFilters={hasActiveFilters}
            auditLogsUtils={auditLogsUtils}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading all audit logs...</span>
          </div>
        ) : (
          <AuditTable
            filteredLogs={paginatedLogs} // Show paginated filtered logs
            pagination={pagination}
            paginationInfo={paginationInfo}
            onPageChange={handlePageChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => handleFilterChange({ userRole: [], timeStamp: null })}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            userRoles={availableRoles}
          />
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Export Successful!"
        message="Your audit logs have been successfully exported as a CSV file."
        buttonText="Continue"
      />
    </div>
  );
};

export default AuditLogs;