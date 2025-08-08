import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// Constants
const DEFAULT_PAGE_SIZE = 10;

// Error Alert Component
const ErrorAlert = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-800 text-sm">{error}</p>
        <div className="flex gap-3 mt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 hover:text-red-800 text-xs underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// Main AuditLogs Component
const AuditLogs = () => {
  const apiClient = useApiClient();

  // State management
  const [selectedFilters, setSelectedFilters] = useState({
    userRole: [],
    timeStamp: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // API state
  const [auditLogs, setAuditLogs] = useState([]);
  const [allAuditLogs, setAllAuditLogs] = useState([]); // Store all logs for export
  const [userRoles, setUserRoles] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [loadingAllLogs, setLoadingAllLogs] = useState(false);
  const [error, setError] = useState(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  // Utility functions

  const transformLogData = useCallback((log) => {
    // Determine the actor (admin takes precedence over user)
    const actor = log.admin?.fullname ? log.admin : log.user;
    const actorName = actor?.fullname || "System";
    const userRole = actor?.role || "Unknown";

    // Parse timestamp correctly to avoid timezone offset issues
    const timestamp = new Date(log.timestamp);

    // Option 1: Use UTC time to avoid timezone conversion
    const time = timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC", // This will show the actual UTC time from backend
    });

    const date = timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC", // This will show the actual UTC date from backend
    });

    // Option 2: If you want to show local time but need to adjust for your timezone
    // Uncomment the following if you need to show Nigeria time (WAT = UTC+1)
    /*
  const time = timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos' // Nigeria timezone
  });
  
  const date = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Lagos' // Nigeria timezone
  });
  */

    return {
      id: log.id,
      logId: log.id,
      action: log.action,
      userRole: userRole,
      userName: actorName,
      time: time,
      date: date,
      timestamp: log.timestamp, // Keep original timestamp
      originalLog: log, // Keep original for debugging
    };
  }, []);

  const checkApiAvailability = useCallback(() => {
    const available = Boolean(apiClient && auditLogsApi && auditLogsUtils);
    setIsApiAvailable(available);

    if (!available) {
      console.warn("API not available - please check API configuration");
      setError(
        "API configuration is missing. Please contact your administrator."
      );
      setLoading(false);
    }
  }, [apiClient]);

  // Load audit logs with pagination
  const loadAuditLogs = useCallback(async () => {
    if (!isApiAvailable) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Only send filters to API if it supports them
      const filters = auditLogsUtils?.validateFilters
        ? auditLogsUtils.validateFilters({
            userRole: selectedFilters.userRole,
            timeStamp: selectedFilters.timeStamp,
          })
        : {};

      console.log(
        "🔍 Loading audit logs with filters:",
        filters,
        "Page:",
        pagination.currentPage
      );

      const response = await auditLogsApi.getAll(
        apiClient,
        pagination.currentPage,
        pagination.pageSize,
        filters
      );

      let logs, newPagination;

      if (response?.data?.data && Array.isArray(response.data.data)) {
        logs = response.data.data;
        newPagination = response.data.pagination || {};
      } else if (auditLogsUtils?.parseGetAllResponse) {
        const parsed = auditLogsUtils.parseGetAllResponse(response);
        logs = parsed.logs;
        newPagination = parsed.pagination;
      } else {
        logs = [];
        newPagination = {};
      }

      const transformedLogs = logs.map(transformLogData);
      setAuditLogs(transformedLogs);

      // Only update pagination from API if it provides it
      if (newPagination.total !== undefined) {
        setPagination((prev) => ({
          ...prev,
          total: newPagination.total || 0,
          totalPages: newPagination.totalPages || 1,
        }));
      }

      console.log(
        "✅ Audit logs loaded successfully:",
        transformedLogs.length,
        "logs"
      );
    } catch (error) {
      console.error("❌ Failed to load audit logs:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to load audit logs";
      setError(errorMessage);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [
    isApiAvailable,
    apiClient,
    transformLogData,
    pagination.currentPage,
    pagination.pageSize,
    selectedFilters,
  ]);

  // Load ALL audit logs for export (without pagination)
  const loadAllAuditLogs = useCallback(async () => {
    if (!isApiAvailable) return [];

    try {
      setLoadingAllLogs(true);
      console.log("📥 Loading ALL audit logs for export...");

      let allLogs = [];
      let currentPage = 1;
      let hasMorePages = true;

      // If API supports getting all logs at once
      if (auditLogsApi.getAllForExport) {
        console.log("Using getAllForExport API");
        const response = await auditLogsApi.getAllForExport(apiClient);

        if (response?.data?.data && Array.isArray(response.data.data)) {
          allLogs = response.data.data;
        } else if (auditLogsUtils?.parseGetAllResponse) {
          const parsed = auditLogsUtils.parseGetAllResponse(response);
          allLogs = parsed.logs;
        }
      } else {
        // Fallback: Paginate through all pages
        console.log("Paginating through all pages for export");

        while (hasMorePages) {
          try {
            const response = await auditLogsApi.getAll(
              apiClient,
              currentPage,
              100, // Use larger page size for efficiency
              {} // No filters for export - get ALL logs
            );

            let logs, paginationInfo;

            if (response?.data?.data && Array.isArray(response.data.data)) {
              logs = response.data.data;
              paginationInfo = response.data.pagination || {};
            } else if (auditLogsUtils?.parseGetAllResponse) {
              const parsed = auditLogsUtils.parseGetAllResponse(response);
              logs = parsed.logs;
              paginationInfo = parsed.pagination;
            } else {
              logs = [];
              paginationInfo = {};
            }

            if (logs && logs.length > 0) {
              allLogs = [...allLogs, ...logs];

              // Check if there are more pages
              const totalPages = paginationInfo.totalPages || 1;
              hasMorePages = currentPage < totalPages;
              currentPage++;

              console.log(
                `📄 Loaded page ${currentPage - 1}, total logs so far: ${
                  allLogs.length
                }`
              );
            } else {
              hasMorePages = false;
            }
          } catch (pageError) {
            console.error(`❌ Error loading page ${currentPage}:`, pageError);
            hasMorePages = false;
          }
        }
      }

      const transformedAllLogs = allLogs.map(transformLogData);
      console.log(
        "✅ All audit logs loaded for export:",
        transformedAllLogs.length,
        "total logs"
      );

      setAllAuditLogs(transformedAllLogs);
      return transformedAllLogs;
    } catch (error) {
      console.error("❌ Failed to load all audit logs:", error);
      return [];
    } finally {
      setLoadingAllLogs(false);
    }
  }, [isApiAvailable, apiClient, transformLogData]);

  // Load user roles from API
  const loadUserRoles = useCallback(async () => {
    if (!isApiAvailable) return;

    try {
      console.log("👥 Loading user roles...");

      const roles = await auditLogsApi.getAdminRoles(apiClient);

      setUserRoles(Array.isArray(roles) ? roles : []);
      console.log("✅ Final user roles loaded:", roles);
    } catch (error) {
      console.error("❌ Failed to load user roles:", error);
      setUserRoles([]);
    }
  }, [isApiAvailable, apiClient]);

  // Event handlers
  const handleFilterChange = useCallback((filters) => {
    console.log("Filter change:", filters);
    setSelectedFilters(filters);
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleExportSuccess = useCallback(() => {
    setShowSuccessModal(true);
  }, []);

  const handleExportError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  // Export all logs
  const handleExportAllLogs = useCallback(async () => {
    try {
      console.log("🚀 Starting export of all logs...");

      // Load all logs if not already loaded or if they're stale
      let logsToExport = allAuditLogs;

      if (allAuditLogs.length === 0 || loadingAllLogs) {
        console.log("📥 Loading fresh data for export...");
        logsToExport = await loadAllAuditLogs();
      }

      console.log("📊 Exporting", logsToExport.length, "total logs");
      return logsToExport;
    } catch (error) {
      console.error("❌ Export preparation failed:", error);
      throw error;
    }
  }, [allAuditLogs, loadAllAuditLogs, loadingAllLogs]);

  const handlePageChange = useCallback(
    (page) => {
      const targetPage = Math.max(1, Math.min(page, pagination.totalPages));

      if (targetPage !== pagination.currentPage) {
        console.log(
          `📄 Changing page from ${pagination.currentPage} to ${targetPage}`
        );
        setPagination((prev) => ({
          ...prev,
          currentPage: targetPage,
        }));
      }
    },
    [pagination.currentPage, pagination.totalPages]
  );

  const retryLoadData = useCallback(() => {
    setError(null);
    if (isApiAvailable) {
      loadAuditLogs();
      loadUserRoles();
    }
  }, [isApiAvailable, loadAuditLogs, loadUserRoles]);

  // Simplified logic for display
  const { displayLogs, paginationInfo } = useMemo(() => {
    console.log("🔍 Filtering logs - API Available:", isApiAvailable);
    console.log("📊 Total logs received:", auditLogs.length);
    console.log("🎯 Active filters:", selectedFilters);

    if (isApiAvailable) {
      // SERVER-SIDE FILTERING - API handles filtering, just display results
      console.log("✅ Using server-side filtering");

      const totalLogs = pagination.total;
      const currentPage = pagination.currentPage;
      const pageSize = pagination.pageSize;
      const totalPages = pagination.totalPages;

      const startIndex = totalLogs > 0 ? (currentPage - 1) * pageSize + 1 : 0;
      const endIndex = Math.min(currentPage * pageSize, totalLogs);

      console.log("📄 Server pagination:", {
        startIndex,
        endIndex,
        totalLogs,
        totalPages,
      });

      return {
        displayLogs: auditLogs, // Use API results directly - NO client-side filtering
        paginationInfo: {
          startIndex,
          endIndex,
          totalLogs,
          totalPages,
        },
      };
    } else {
      // CLIENT-SIDE FILTERING - Filter and paginate locally
      console.log("⚙️ Using client-side filtering");

      let filtered = [...auditLogs]; // Create a copy to avoid mutations

      console.log("📊 Starting with logs:", filtered.length);

      // Apply role filter
      if (selectedFilters.userRole && selectedFilters.userRole.length > 0) {
        const beforeCount = filtered.length;
        filtered = filtered.filter((log) => {
          const logRole = log.userRole || "";
          const matches = selectedFilters.userRole.some(
            (selectedRole) =>
              logRole.toLowerCase().trim() === selectedRole.toLowerCase().trim()
          );

          if (!matches) {
            console.log(
              `❌ Log ${
                log.id
              } with role "${logRole}" filtered out (looking for: [${selectedFilters.userRole.join(
                ", "
              )}])`
            );
          }
          return matches;
        });
        console.log(
          `👤 Role filter applied: ${beforeCount} → ${filtered.length} logs`
        );
      }

      // Apply date filter
      if (selectedFilters.timeStamp) {
        const beforeCount = filtered.length;
        const selectedDate = new Date(selectedFilters.timeStamp);
        const selectedDateString = selectedDate.toISOString().split("T")[0];

        filtered = filtered.filter((log) => {
          if (!log.timestamp) return false;

          const logDate = new Date(log.timestamp);
          const logDateString = logDate.toISOString().split("T")[0];

          const matches = selectedDateString === logDateString;

          if (!matches) {
            console.log(
              `❌ Log ${log.id} with date "${logDateString}" filtered out (looking for: "${selectedDateString}")`
            );
          }
          return matches;
        });
        console.log(
          `📅 Date filter applied: ${beforeCount} → ${filtered.length} logs`
        );
      }

      console.log("✅ Final filtered count:", filtered.length);

      const totalFiltered = filtered.length;
      const totalPages = Math.ceil(totalFiltered / pagination.pageSize) || 1;

      // Apply pagination to filtered results
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedResults = filtered.slice(startIndex, endIndex);

      const displayStartIndex = totalFiltered > 0 ? startIndex + 1 : 0;
      const displayEndIndex = Math.min(
        startIndex + paginatedResults.length,
        totalFiltered
      );

      console.log("📄 Client pagination:", {
        displayStartIndex,
        displayEndIndex,
        totalFiltered,
        totalPages,
        showingCount: paginatedResults.length,
      });

      return {
        displayLogs: paginatedResults,
        paginationInfo: {
          startIndex: displayStartIndex,
          endIndex: displayEndIndex,
          totalLogs: totalFiltered,
          totalPages,
        },
      };
    }
  }, [auditLogs, selectedFilters, pagination, isApiAvailable]);

  // Effects
  useEffect(() => {
    checkApiAvailability();
  }, [checkApiAvailability]);

  // Load data when component mounts or when pagination/filters change
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  useEffect(() => {
    if (isApiAvailable) {
      loadUserRoles();
    }
  }, [isApiAvailable, loadUserRoles]);

  // Load all logs on mount for export preparation
  useEffect(() => {
    if (isApiAvailable && allAuditLogs.length === 0) {
      loadAllAuditLogs();
    }
  }, [isApiAvailable, allAuditLogs.length, loadAllAuditLogs]);

  // Update client-side pagination info when not using API
  useEffect(() => {
    if (!isApiAvailable && paginationInfo.totalPages > 0) {
      setPagination((prev) => ({
        ...prev,
        totalPages: paginationInfo.totalPages,
        total: paginationInfo.totalLogs,
      }));
    }
  }, [paginationInfo.totalPages, paginationInfo.totalLogs, isApiAvailable]);

  // Check for active filters
  const hasActiveFilters =
    selectedFilters.userRole.length > 0 || selectedFilters.timeStamp;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex text-sm text-gray-500">
          <li>
            <a href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </a>
          </li>
          <li className="mx-2" aria-hidden="true">
            ›
          </li>
          <li className="text-gray-900" aria-current="page">
            Audit Logs
          </li>
        </ol>
      </nav>

      {/* Error Alert */}
      <ErrorAlert
        error={error}
        onDismiss={() => setError(null)}
        onRetry={retryLoadData}
      />

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">
                Audit Logs
              </h1>
              <span
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                aria-label={`${
                  loading ? "Loading" : paginationInfo.totalLogs
                } total logs`}
              >
                {loading ? "..." : paginationInfo.totalLogs}
              </span>
            </div>

            {/* Export Button  */}
            <ExportFunction
              onExportAllLogs={handleExportAllLogs}
              onExportSuccess={handleExportSuccess}
              onExportError={handleExportError}
              disabled={loading}
              isLoadingAllLogs={loadingAllLogs}
            />
          </div>

          {/* Filters Component */}
          <AuditFilters
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            hasActiveFilters={hasActiveFilters}
            auditLogsUtils={auditLogsUtils}
          />
        </div>

        {/* Table Component */}
        {loading ? (
          <div
            className="flex items-center justify-center py-12"
            role="status"
            aria-live="polite"
          >
            <Loader2
              className="w-6 h-6 animate-spin text-blue-600 mr-2"
              aria-hidden="true"
            />
            <span className="text-gray-600">Loading audit logs...</span>
          </div>
        ) : (
          <AuditTable
            filteredLogs={displayLogs}
            pagination={pagination}
            paginationInfo={paginationInfo}
            onPageChange={handlePageChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() =>
              handleFilterChange({ userRole: [], timeStamp: null })
            }
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            userRoles={userRoles} // Pass all available roles from API
          />
        )}
      </div>

      {/* Success Modal */}
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
