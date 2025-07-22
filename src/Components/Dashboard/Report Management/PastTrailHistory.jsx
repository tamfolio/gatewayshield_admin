import React, { useEffect, useState } from 'react';

const PastHistoryGeneral = ({pastHistory}) => {
  // Format date to match the design
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format status with proper styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    switch(status.toLowerCase()) {
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'closed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Sample data for demo - replace with your actual data
  const sampleData = [
    {
      id: "#123455",
      incidentType: "Rape Case",
      incidentStatus: "In Progress",
      station: "Lafenwa",
      datePublished: "2025-01-04T00:00:00.000Z",
      ticketId: "sample-ticket-1"
    },
    {
      id: "#123455",
      incidentType: "Kidnapping",
      incidentStatus: "Closed",
      station: "Lafenwa",
      datePublished: "2025-01-04T00:00:00.000Z",
      ticketId: "sample-ticket-2"
    },
    {
      id: "#123455",
      incidentType: "Killing",
      incidentStatus: "In Progress",
      station: "Lafenwa",
      datePublished: "2025-01-02T00:00:00.000Z",
      ticketId: "sample-ticket-3"
    }
  ];

  const dataToUse = pastHistory && pastHistory.length > 0 ? pastHistory : sampleData;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 py-4 px-6 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-700">Report ID</div>
        <div className="text-sm font-semibold text-gray-700">Report Type</div>
        <div className="text-sm font-semibold text-gray-700">Date Reported</div>
        <div className="text-sm font-semibold text-gray-700">Status</div>
        <div className="text-sm font-semibold text-gray-700">Assigned Station</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {pastHistory.map((item, index) => (
          <div key={item.ticketId || index} className="grid grid-cols-5 gap-4 py-4 px-6 hover:bg-gray-50 transition-colors">
            <div className="text-sm text-gray-900 font-medium">
              {item.id.startsWith('#') ? item.id : `#${item.id.slice(-6)}`}
            </div>
            <div className="text-sm text-gray-700 capitalize">
              {item.incidentType}
            </div>
            <div className="text-sm text-gray-700">
              {formatDate(item.datePublished)}
            </div>
            <div className="text-sm">
              <span className={getStatusBadge(item.incidentStatus)}>
                {item.incidentStatus}
              </span>
            </div>
            <div className="text-sm text-gray-700">
              {item.station}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!pastHistory || dataToUse.length === 0) && (
        <div className="py-12 text-center">
          <div className="text-gray-500 text-sm">No past reports found</div>
        </div>
      )}
    </div>
  );
};

export default PastHistoryGeneral;