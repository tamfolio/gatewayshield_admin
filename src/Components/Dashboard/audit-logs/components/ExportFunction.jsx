import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';

const ExportFunction = ({ 
  onExportAllLogs, 
  onExportSuccess,
  onExportError,
  disabled = false,
  isLoadingAllLogs = false,
  className = "",
  buttonText = "Export All Logs",
  exportingText = "Exporting All Logs..."
}) => {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = useCallback(async () => {
    try {
      setExporting(true);
      
      console.log('📥 Starting export of ALL audit logs...');
      
      // Get all logs from the parent component
      let allLogs = [];
      if (onExportAllLogs) {
        allLogs = await onExportAllLogs();
      }
      
      if (!allLogs || allLogs.length === 0) {
        throw new Error('No audit logs available for export');
      }
      
      console.log('📊 Exporting', allLogs.length, 'total audit logs');
      
      // Client-side CSV export with all logs
      const headers = ['Log ID', 'User Role', 'User Name', 'Action Type', 'Time Stamp'];
      const csvContent = [
        headers.join(','),
        ...allLogs.map(log => [
          `"${log.logId || log.id}"`,
          `"${log.userRole || ''}"`,
          `"${log.userName || ''}"`,
          `"${log.action || ''}"`,
          `"${log.time || ''} ${log.date || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-all-${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Export successful -', allLogs.length, 'logs exported');
      onExportSuccess?.();
    } catch (error) {
      console.error('❌ Export failed:', error);
      const errorMessage = error.message || 'Failed to export audit logs. Please try again.';
      onExportError?.(errorMessage);
    } finally {
      setExporting(false);
    }
  }, [onExportAllLogs, onExportSuccess, onExportError]);

  const isDisabled = disabled || exporting || isLoadingAllLogs;
  const isLoading = exporting || isLoadingAllLogs;

  // Show loading state and appropriate text
  const getButtonText = () => {
    if (isLoadingAllLogs) return "Loading All Logs...";
    if (exporting) return exportingText;
    return buttonText;
  };

  return (
    <button 
      onClick={exportToCSV}
      disabled={isDisabled}
      className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={getButtonText()}
      title="Export all audit logs from all pages as CSV"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <FiDownloadCloud className="w-4 h-4" aria-hidden="true" />
      )}
      {getButtonText()}
    </button>
  );
};

export default ExportFunction;