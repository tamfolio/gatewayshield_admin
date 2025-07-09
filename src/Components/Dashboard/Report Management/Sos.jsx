import React, { useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const Sos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);

  // Sample data based on the image
  const reports = [
    {
      id: "RI0005667",
      status: "New",
      statusColor: "bg-green-500",
      type: "SOS",
      heading: "SOS HEADING",
      summary: "Report summary goes here lorem ipsum dolor...",
      reportedBy: "Olivia Rhye",
      avatar: "👤",
      dateReported: "02-04-2025",
      time: "12:00 AM",
      channel: "Mobile",
    },
    {
      id: "RI0005667",
      status: "Rejected",
      statusColor: "bg-red-500",
      type: "SOS",
      heading: "SOS HEADING",
      summary: "Report summary goes here lorem ipsum dolor...",
      reportedBy: "Olivia Rhye",
      avatar: "👤",
      dateReported: "02-04-2025",
      time: "12:00 AM",
      channel: "Mobile",
    },
    {
      id: "RI0005667",
      status: "In Progress",
      statusColor: "bg-orange-500",
      type: "SOS",
      heading: "SOS HEADING",
      summary: "Report summary goes here lorem ipsum dolor...",
      reportedBy: "Olivia Rhye",
      avatar: "👤",
      dateReported: "02-04-2025",
      time: "12:00 AM",
      channel: "Mobile",
    },
    {
      id: "RI0005667",
      status: "On Hold",
      statusColor: "bg-orange-400",
      type: "SOS",
      heading: "SOS HEADING",
      summary: "Report summary goes here lorem ipsum dolor...",
      reportedBy: "Olivia Rhye",
      avatar: "👤",
      dateReported: "02-04-2025",
      time: "12:00 AM",
      channel: "Mobile",
    },
    {
      id: "RI0005667",
      status: "New",
      statusColor: "bg-green-500",
      type: "SOS",
      heading: "SOS HEADING",
      summary: "Report summary goes here lorem ipsum dolor...",
      reportedBy: "Olivia Rhye",
      avatar: "👤",
      dateReported: "02-04-2025",
      time: "12:00 AM",
      channel: "Mobile",
    },
  ];

  const handleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setSelectedReports(reports.map((report) => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const StatusBadge = ({ status, color }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`w-full ${color} text-white text-xs font-medium px-3 py-1 text-center`}
      >
        {status}
      </div>
    </div>
  );

  const ReportCard = ({ report }) => (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden pb-3">
      <div className="flex items-start justify-start">
        {/* Status and Type Section */}
        <div className="flex flex-col">
          <div className="flex">
            <div className="w-32 flex flex-col">
              <div className="flex bg-gray-100 items-center justify-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={selectedReports.includes(report.id)}
                  onChange={() => handleSelectReport(report.id)}
                />
                <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                  #{report.id}
                </div>
              </div>
              <StatusBadge status={report.status} color={report.statusColor} />
              <div className="bg-gray-600 text-white text-xs font-medium px-3 py-1 text-center">
                {report.type}
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {report.heading}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{report.summary}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500 px-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                {report.avatar}
              </div>
              <div>
                <div className="text-xs text-gray-400">Reported By</div>
                <div className="font-medium">{report.reportedBy}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Date Reported</div>
              <div className="font-medium">{report.dateReported}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Time</div>
              <div className="font-medium">{report.time}</div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Channel</div>
              <div className="font-medium">{report.channel}</div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span>Dashboard</span>
          <span>›</span>
          <span>Report Management</span>
          <span>›</span>
          <span className="text-gray-900">SOS</span>
        </nav>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Incident Reports
            </h1>
            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
              1000 Total
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                ⌘K
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                checked={selectedAll}
                onChange={handleSelectAll}
              />
              <span className="text-gray-700">Select All</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Filter By:</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Report Status</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Police Station</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Date</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Origin Channel</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Report Type</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report, index) => (
          <ReportCard key={`${report.id}-${index}`} report={report} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-lg border border-gray-200">
        <button
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-2">
          {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              } ${page === "..." ? "cursor-default" : ""}`}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Sos;
