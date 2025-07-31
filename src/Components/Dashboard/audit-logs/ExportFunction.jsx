import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';

const ExportFunction = ({ 
  auditLogs,
  onExportSuccess,
  onExportError,
  disabled = false,
  className = "",
  buttonText = "Export Log",
  exportingText = "Exporting..."
}) => {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = useCallback(async () => {
    try {
      setExporting(true);
      
      console.log('📥 Exporting audit logs from frontend (client-side)');
      
      // Client-side CSV export
      const headers = ['Log ID', 'User Role', 'User Name', 'Action Type', 'Time Stamp'];
      const csvContent = [
        headers.join(','),
        ...auditLogs.map(log => [
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
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Client-side export successful');
      onExportSuccess?.();
    } catch (error) {
      console.error('❌ Export failed:', error);
      const errorMessage = 'Failed to export audit logs. Please try again.';
      onExportError?.(errorMessage);
    } finally {
      setExporting(false);
    }
  }, [
    auditLogs, 
    onExportSuccess, 
    onExportError
  ]);

  const isDisabled = disabled || exporting || (auditLogs && auditLogs.length === 0);

  return (
    <button 
      onClick={exportToCSV}
      disabled={isDisabled}
      className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={exporting ? exportingText : buttonText}
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <FiDownloadCloud className="w-4 h-4" aria-hidden="true" />
      )}
      {exporting ? exportingText : buttonText}
    </button>
  );
};

export default ExportFunction;