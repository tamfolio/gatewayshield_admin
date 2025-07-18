import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
} from "lucide-react";
import { userRequest } from "../../../requestMethod";
import { useSelector } from "react-redux";
import {
  extractDate,
  extractTime,
  getAvatarInitial, avatarColors, getAvatarColor, statusColorMap
} from "../../../Utils/dateUtils";
import { Link } from "react-router-dom";


const General = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const token = useSelector(
    (state) => state.user?.currentUser?.tokens?.access?.token
  );

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const res = await userRequest(token).get(
          "/incident/all?page=1&size=10"
        );
        console.log("✅ Incidents fetched:", res.data);
        setIncidents(res.data?.data?.incidents?.data || []);
        setPaginationData(res.data?.data?.incidents?.pagination || []);
      } catch (err) {
        console.error("❌ Failed to fetch incidents:", err);
        setError("Failed to fetch incidents");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchIncidents();
    }
  }, [token]);

  // Filter states
  const [showReportStatusDropdown, setShowReportStatusDropdown] =
    useState(false);
  const [showPoliceStationDropdown, setShowPoliceStationDropdown] =
    useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOriginChannelDropdown, setShowOriginChannelDropdown] =
    useState(false);
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);

  // Filter values
  const [selectedReportStatus, setSelectedReportStatus] = useState("");
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOriginChannel, setSelectedOriginChannel] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");

  // Active filters for display
  const [activeFilters, setActiveFilters] = useState([]);

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");

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
      id: "RI0005668",
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
      id: "RI0005669",
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
      id: "RI0005670",
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
      id: "RI0005671",
      status: "New",
      statusColor: "bg-green-500",
      type: "General",
      heading: "SOS HEADING",
      summary: "Report summary goes here lorem ipsum dolor...",
      reportedBy: "Olivia Rhye",
      avatar: "👤",
      dateReported: "02-04-2025",
      time: "12:00 AM",
      channel: "Web",
    },
  ];

  // Filter options
  const reportStatusOptions = ["New", "In Progress", "On Hold", "Rejected"];
  const policeStationOptions = [
    "Station A",
    "Station B",
    "Station C",
    "Station D",
  ];
  const originChannelOptions = ["Mobile", "Web", "Phone"];
  const reportTypeOptions = ["SOS", "General"];

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

  const handleFilterSelect = (filterType, value) => {
    let newFilters = [...activeFilters];

    // Remove existing filter of the same type
    newFilters = newFilters.filter((filter) => filter.type !== filterType);

    // Add new filter if value is not empty
    if (value) {
      newFilters.push({ type: filterType, value, label: value });
    }

    setActiveFilters(newFilters);

    // Update filter states
    switch (filterType) {
      case "reportStatus":
        setSelectedReportStatus(value);
        setShowReportStatusDropdown(false);
        break;
      case "policeStation":
        setSelectedPoliceStation(value);
        setShowPoliceStationDropdown(false);
        break;
      case "originChannel":
        setSelectedOriginChannel(value);
        setShowOriginChannelDropdown(false);
        break;
      case "reportType":
        setSelectedReportType(value);
        setShowReportTypeDropdown(false);
        break;
      default:
        break;
    }
  };

  const removeFilter = (filterType) => {
    setActiveFilters(
      activeFilters.filter((filter) => filter.type !== filterType)
    );

    switch (filterType) {
      case "reportStatus":
        setSelectedReportStatus("");
        break;
      case "policeStation":
        setSelectedPoliceStation("");
        break;
      case "date":
        setSelectedDate("");
        setSelectedCalendarDate("");
        break;
      case "originChannel":
        setSelectedOriginChannel("");
        break;
      case "reportType":
        setSelectedReportType("");
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedReportStatus("");
    setSelectedPoliceStation("");
    setSelectedDate("");
    setSelectedOriginChannel("");
    setSelectedReportType("");
    setSelectedCalendarDate("");
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDayOfMonth = getFirstDayOfMonth(calendarDate);
    const days = [];

    // Previous month days
    const prevMonth = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() - 1,
      0
    );
    const daysInPrevMonth = prevMonth.getDate();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        calendarDate.getMonth() === today.getMonth() &&
        calendarDate.getFullYear() === today.getFullYear();

      days.push({
        day,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month days
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const handleDateSelect = (day) => {
    if (day.isCurrentMonth) {
      const selectedDate = new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        day.day
      );
      const formattedDate = selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      setSelectedCalendarDate(formattedDate);
    }
  };





  const applyDateFilter = () => {
    if (selectedCalendarDate) {
      let newFilters = [...activeFilters];
      newFilters = newFilters.filter((filter) => filter.type !== "date");
      newFilters.push({
        type: "date",
        value: selectedCalendarDate,
        label: selectedCalendarDate,
      });
      setActiveFilters(newFilters);
      setSelectedDate(selectedCalendarDate);
    }
    setShowDatePicker(false);
  };



  const StatusBadge = ({ status }) => {
    const normalizedStatus = status?.toLowerCase()?.replace(/\s/g, "_");
    const color = statusColorMap[normalizedStatus] || "bg-gray-400";

    return (
      <div className="flex items-center space-x-2">
        <div
          className={`w-full ${color} text-white text-xs font-medium px-3 py-1 text-center`}
        >
          {status}
        </div>
      </div>
    );
  };

  const ReportCard = ({ report }) => {
    return (
      <Link to={`/dashboard/reports/sos/${report.id}`} className="block">
        <div className="block bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden pb-3 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-start">
            <div className="flex flex-col w-full">
              <div className="flex">
                <div className="flex flex-col bg-white">
                  <div className="flex bg-[#E9EAEB] items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                    />
                    <div className="bg-[#E9EAEB] px-3 py-2 text-sm font-medium text-gray-600">
                      #{report.id}
                    </div>
                  </div>
                  <StatusBadge
                    status={report.incidentStatus}
                    color={report.statusColor}
                  />
                  <div className="bg-gray-600 text-white text-xs font-medium px-3 py-1 text-center">
                    SOS
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {report.incidentType}
                  </h3>
                  <p className="text-gray-600 text-sm">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-6 text-sm text-gray-500 px-5 mt-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 ${getAvatarColor(
                      report.user
                    )} rounded-full flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {getAvatarInitial(report.user)}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Reported By</div>
                    <div className="font-medium">{report.user}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Date Reported</div>
                  <div className="font-medium">
                    {extractDate(report.datePublished)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Time</div>
                  <div className="font-medium">
                    {extractTime(report.datePublished)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Incident Type</div>
                  <div className="font-medium">{report.incidentType}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">SLA Status</div>
                  <div className="font-medium">{report.slaStatus}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Channel</div>
                  <div className="font-medium">{report.channel}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Priority</div>
                  <div className="font-medium">{report.priority}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const DropdownMenu = ({ isOpen, options, onSelect, selectedValue }) => {
    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
        {options.map((option) => (
          <button
            key={option}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
              selectedValue === option
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700"
            }`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  const DatePicker = () => {
    if (!showDatePicker) return null;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const days = generateCalendarDays();

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCalendarDate(
                new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth() - 1
                )
              )
            }
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="font-medium">
            {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
          </h3>
          <button
            onClick={() =>
              setCalendarDate(
                new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth() + 1
                )
              )
            }
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day)}
              className={`text-center text-sm py-2 rounded hover:bg-gray-100 ${
                day.isCurrentMonth ? "text-gray-900" : "text-gray-300"
              } ${
                day.isToday ? "bg-blue-500 text-white hover:bg-blue-600" : ""
              } ${
                selectedCalendarDate &&
                selectedCalendarDate.includes(day.day.toString()) &&
                day.isCurrentMonth
                  ? "bg-blue-100 text-blue-600"
                  : ""
              }`}
            >
              {day.day}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setShowDatePicker(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={applyDateFilter}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

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
              {paginationData?.total} Total
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

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex items-center space-x-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {filter.label}
              <button
                onClick={() => removeFilter(filter.type)}
                className="ml-2 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear All
          </button>
        </div>
      )}

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

            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                onClick={() =>
                  setShowReportStatusDropdown(!showReportStatusDropdown)
                }
              >
                <span>Report Status</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <DropdownMenu
                isOpen={showReportStatusDropdown}
                options={reportStatusOptions}
                onSelect={(value) => handleFilterSelect("reportStatus", value)}
                selectedValue={selectedReportStatus}
              />
            </div>

            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                onClick={() =>
                  setShowPoliceStationDropdown(!showPoliceStationDropdown)
                }
              >
                <span>Police Station</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <DropdownMenu
                isOpen={showPoliceStationDropdown}
                options={policeStationOptions}
                onSelect={(value) => handleFilterSelect("policeStation", value)}
                selectedValue={selectedPoliceStation}
              />
            </div>

            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <span>Date</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <DatePicker />
            </div>

            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                onClick={() =>
                  setShowOriginChannelDropdown(!showOriginChannelDropdown)
                }
              >
                <span>Origin Channel</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <DropdownMenu
                isOpen={showOriginChannelDropdown}
                options={originChannelOptions}
                onSelect={(value) => handleFilterSelect("originChannel", value)}
                selectedValue={selectedOriginChannel}
              />
            </div>

            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                onClick={() =>
                  setShowReportTypeDropdown(!showReportTypeDropdown)
                }
              >
                <span>Report Type</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <DropdownMenu
                isOpen={showReportTypeDropdown}
                options={reportTypeOptions}
                onSelect={(value) => handleFilterSelect("reportType", value)}
                selectedValue={selectedReportType}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {incidents.map((report, index) => (
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

export default General;
