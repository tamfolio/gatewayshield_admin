import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Check,
} from "lucide-react";
import { userRequest } from "../../../requestMethod";
import { useSelector } from "react-redux";
import {
  extractDate,
  extractTime,
  getAvatarInitial,
  avatarColors,
  getAvatarColor,
  statusColorMap,
} from "../../../Utils/dateUtils";
import { Link } from "react-router-dom";

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const General = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stations, setStations] = useState([]);
  const [incidentStatus, setIncidentStatus] = useState([]);
  const [incidentChannels, setIncidentChannels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);

  // New search and toggle states
  const [showMyReports, setShowMyReports] = useState(false);
  const [searchType, setSearchType] = useState("Report ID");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const token = useSelector(
    (state) => state.user?.currentUser?.tokens?.access?.token
  );

  const adminRolesList = useSelector((state) => state.user?.adminRoles);
  const userRoleId = useSelector(
    (state) => state.user?.currentUser?.admin?.roleId
  );

  // Get the current user's role name by matching roleId with adminRoles
  const getCurrentUserRole = () => {
    if (!adminRolesList || !userRoleId) return null;
    const role = adminRolesList.find((role) => role.id === userRoleId);
    return role ? role.name : null;
  };

  const currentUserRole = getCurrentUserRole();
  const isCommandCentreAgent = currentUserRole === "Command Centre Agent";

  // Filter states
  const [showReportStatusDropdown, setShowReportStatusDropdown] = useState(false);
  const [showPoliceStationDropdown, setShowPoliceStationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOriginChannelDropdown, setShowOriginChannelDropdown] = useState(false);
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

  // Search dropdown options
  const searchOptions = ["Report ID", "Citizen Name", "Phone Number"];

  // Add refs for each dropdown
  const reportStatusRef = useRef(null);
  const policeStationRef = useRef(null);
  const datePickerRef = useRef(null);
  const originChannelRef = useRef(null);
  const reportTypeRef = useRef(null);
  const searchDropdownRef = useRef(null);

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setShowReportStatusDropdown(false);
    setShowPoliceStationDropdown(false);
    setShowDatePicker(false);
    setShowOriginChannelDropdown(false);
    setShowReportTypeDropdown(false);
    setShowSearchDropdown(false);
  };

  // Enhanced dropdown toggle functions that close others first
  const toggleReportStatusDropdown = () => {
    closeAllDropdowns();
    setShowReportStatusDropdown(true);
  };

  const togglePoliceStationDropdown = () => {
    closeAllDropdowns();
    setShowPoliceStationDropdown(true);
  };

  const toggleDatePicker = () => {
    closeAllDropdowns();
    setShowDatePicker(true);
  };

  const toggleOriginChannelDropdown = () => {
    closeAllDropdowns();
    setShowOriginChannelDropdown(true);
  };

  const toggleReportTypeDropdown = () => {
    closeAllDropdowns();
    setShowReportTypeDropdown(true);
  };

  const toggleSearchDropdown = () => {
    closeAllDropdowns();
    setShowSearchDropdown(true);
  };

  // Set up click outside listeners for each dropdown
  useClickOutside(reportStatusRef, () => setShowReportStatusDropdown(false));
  useClickOutside(policeStationRef, () => setShowPoliceStationDropdown(false));
  useClickOutside(datePickerRef, () => setShowDatePicker(false));
  useClickOutside(originChannelRef, () => setShowOriginChannelDropdown(false));
  useClickOutside(reportTypeRef, () => setShowReportTypeDropdown(false));
  useClickOutside(searchDropdownRef, () => setShowSearchDropdown(false));

  // FIRST useEffect - for fetching data when currentPage or filters change
  useEffect(() => {
    const fetchIncidents = async (page = currentPage) => {
      setLoading(true);
      try {
        // Build API URL with proper pagination
        let apiUrl = `/incident/all?page=${page}&size=10`;
        
        // Add search parameters if search term exists
        if (searchTerm.trim()) {
          const searchParam = searchType.toLowerCase().replace(/\s+/g, '_');
          apiUrl += `&${searchParam}=${encodeURIComponent(searchTerm)}`;
        }
        
        // Add my reports filter if enabled
        if (showMyReports) {
          apiUrl += "&my_reports=true";
        }

        // Add status filter if selected
        if (selectedReportStatus) {
          apiUrl += `&statusId=${selectedReportStatus}`;
        }

        // Add date range filter if selected - FIXED VERSION
        if (selectedCalendarDate && selectedCalendarDate.includes(' to ')) {
          // Handle date range "2025-07-31 to 2025-08-03"
          const [startDate, endDate] = selectedCalendarDate.split(' to ');
          apiUrl += `&startDate=${startDate}&endDate=${endDate}`;
        } else if (selectedCalendarDate && selectedCalendarDate.includes(',')) {
          // Handle comma-separated dates "2025-07-31,2025-08-03"
          const [startDate, endDate] = selectedCalendarDate.split(',');
          apiUrl += `&startDate=${startDate}&endDate=${endDate}`;
        } else if (selectedCalendarDate && selectedCalendarDate !== 'Select Date') {
          // Handle single date selection
          apiUrl += `&startDate=${selectedCalendarDate}&endDate=${selectedCalendarDate}`;
        }

        // Add origin channel filter if selected
        if (selectedOriginChannel && selectedOriginChannel !== 'All Channels') {
          apiUrl += `&originChannel=${selectedOriginChannel}`;
        }

        // Add police station filter if selected
        if (selectedPoliceStation) {
          apiUrl += `&stationId=${selectedPoliceStation}`;
        }

        console.log("📡 API URL:", apiUrl);
        const res = await userRequest(token).get(apiUrl);
        console.log("✅ Incidents fetched:", res.data);
        
        setIncidents(res.data?.data?.incidents?.data || []);
        setPaginationData(res.data?.data?.incidents?.pagination || {});
        
        // Clear selected reports when data changes
        setSelectedReports([]);
        setSelectedAll(false);
        
      } catch (err) {
        console.error("❌ Failed to fetch incidents:", err);
        setError("Failed to fetch incidents");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchIncidents(currentPage);
    }
  }, [token, currentPage, searchTerm, searchType, showMyReports, selectedReportStatus, selectedPoliceStation, selectedCalendarDate, selectedOriginChannel, selectedReportType]);

  // SECOND useEffect - for resetting page to 1 when filters change (but NOT when currentPage changes)
  useEffect(() => {
    // Reset to page 1 when filters change (but not when token or currentPage changes)
    if (token && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, searchType, showMyReports, selectedReportStatus, selectedPoliceStation, selectedCalendarDate, selectedOriginChannel, selectedReportType]);

  // THIRD useEffect - for fetching dropdown data
  useEffect(() => {
    const fetchIncidentStatus = async () => {
      try {
        const response = await userRequest(token).get("/incident/statuses");
        console.log("Incident types API response:", response.data.data);
        setIncidentStatus(response.data.data);
      } catch (error) {
        console.error("Error fetching incident types:", error);
      }
    };

    const fetchIncidentChannels = async () => {
      try {
        const response = await userRequest(token).get("/incident/channels");
        console.log("Incident Channels API response:", response.data.data);
        setIncidentChannels(response.data.data);
      } catch (error) {
        console.error("Error fetching incident types:", error);
      }
    };

    const getStations = async () => {
      try {
        const res = await userRequest(token).get(`feedback/caseReview/stations`);
        console.log("stations", res.data.data.stations);
        setStations(res.data.data.stations);
      } catch (error) {
        console.error("❌ Failed to fetch stations:", error);
      }
    };

    if (token) {
      fetchIncidentStatus();
      fetchIncidentChannels();
      getStations();
    }
  }, [token]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= (paginationData.totalPages || 1)) {
      setCurrentPage(page);
      // The useEffect will automatically trigger fetchIncidents when currentPage changes
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const totalPages = paginationData.totalPages || 1;
    const current = currentPage;
    const pages = [];

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (current > 4) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (current < totalPages - 3) {
        pages.push("...");
      }

      // Show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleSelectAll = () => {
    setSelectedAll(!selectedAll);
    if (!selectedAll) {
      setSelectedReports(incidents.map((report) => report.id));
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

  const handleSearchTypeSelect = (type) => {
    setSearchType(type);
    setShowSearchDropdown(false);
    // Clear search term when changing search type
    setSearchTerm("");
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "Report ID":
        return "Search by Report ID...";
      case "Citizen Name":
        return "Search by Citizen Name...";
      case "Phone Number":
        return "Search by Phone Number...";
      default:
        return "Search...";
    }
  };

  const handleFilterSelect = (filterType, value) => {
    let newFilters = [...activeFilters];
  
    // Remove existing filter of the same type
    newFilters = newFilters.filter((filter) => filter.type !== filterType);
  
    // Add new filter if value is not empty
    if (value) {
      let label = value; // Default label is the value itself
      
      // Get the appropriate label based on filter type
      switch (filterType) {
        case "reportStatus":
          const status = incidentStatus.find(s => s.id === value);
          label = status ? (status.name || status.status || status.title) : value;
          break;
        case "policeStation":
          const station = stations.find(s => s.id === value);
          label = station ? (station.name || station.formation || station.stationName) : value;
          break;
        case "originChannel":
          const channel = incidentChannels.find(c => c.id === value);
          label = channel ? (channel.name || channel.channel || channel.title) : value;
          break;
        case "reportType":
          // Handle report type if needed
          label = value;
          break;
        default:
          label = value;
          break;
      }
  
      newFilters.push({ type: filterType, value, label });
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
      case "dateRange":
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
      <Link to={`/dashboard/reports/general/${report.id}`} className="block">
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
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectReport(report.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
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
                    General
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
                    <div className="font-medium">{report.user || 'Anonymous'}</div>
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
                  <div className="font-medium">{report.slaStatus || 'N/A'}</div>
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

  // Enhanced DropdownMenu component with ref forwarding
  const DropdownMenu = React.forwardRef(({ isOpen, options, onSelect, selectedValue }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-[500px] overflow-y-scroll">
        {options.map((option) => {
          // Check if option is an object or string
          const isObject = typeof option === "object";
          const key = isObject ? option.id : option;
          const displayValue = isObject
            ? option.name || option.formation
            : option;
          const selectValue = isObject ? option.id : option;

          return (
            <button
              key={key}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                selectedValue === selectValue
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
              onClick={() => onSelect(selectValue)}
            >
              {displayValue}
            </button>
          );
        })}
      </div>
    );
  });

  const SearchDropdown = () => {
    if (!showSearchDropdown) return null;

    return (
      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
        {searchOptions.map((option) => (
          <button
            key={option}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
              searchType === option
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700"
            }`}
            onClick={() => handleSearchTypeSelect(option)}
          >
            {option}
            {searchType === option && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const DatePicker = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [hoverDate, setHoverDate] = useState(null);

    if (!showDatePicker) return null;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const days = generateCalendarDays();

    const handleDateSelect = (dayObj) => {
      if (!dayObj.isCurrentMonth) return;
      
      const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayObj.day);
      
      if (!startDate || (startDate && endDate)) {
        // First selection or reset selection
        setStartDate(selectedDate);
        setEndDate(null);
      } else if (startDate && !endDate) {
        // Second selection
        if (selectedDate < startDate) {
          // If selected date is before start date, swap them
          setEndDate(startDate);
          setStartDate(selectedDate);
        } else {
          setEndDate(selectedDate);
        }
      }
    };

    const handleDateHover = (dayObj) => {
      if (!dayObj.isCurrentMonth || !startDate || endDate) return;
      const hoverDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayObj.day);
      setHoverDate(hoverDate);
    };

    const isDateInRange = (dayObj) => {
      if (!dayObj.isCurrentMonth || !startDate) return false;
      
      const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayObj.day);
      const rangeEnd = endDate || hoverDate;
      
      if (!rangeEnd) return false;
      
      const actualStart = startDate < rangeEnd ? startDate : rangeEnd;
      const actualEnd = startDate < rangeEnd ? rangeEnd : startDate;
      
      return currentDate >= actualStart && currentDate <= actualEnd;
    };

    const isStartDate = (dayObj) => {
      if (!startDate || !dayObj.isCurrentMonth) return false;
      const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayObj.day);
      return currentDate.getTime() === startDate.getTime();
    };

    const isEndDate = (dayObj) => {
      if (!endDate || !dayObj.isCurrentMonth) return false;
      const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayObj.day);
      return currentDate.getTime() === endDate.getTime();
    };

    const applyDateFilter = () => {
      if (startDate && endDate) {
        // Use local date formatting to avoid timezone issues
        const formattedStartDate = startDate.getFullYear() + '-' + 
          String(startDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(startDate.getDate()).padStart(2, '0');
        const formattedEndDate = endDate.getFullYear() + '-' + 
          String(endDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(endDate.getDate()).padStart(2, '0');
        
        // Store the formatted display string for UI
        const displayString = `${formattedStartDate} to ${formattedEndDate}`;
        setSelectedCalendarDate(displayString);
        
        // Add to active filters with proper display
        let newFilters = [...activeFilters];
        newFilters = newFilters.filter((filter) => filter.type !== "dateRange" && filter.type !== "date");
        newFilters.push({
          type: "dateRange",
          value: displayString,
          label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        });
        setActiveFilters(newFilters);
      } else if (startDate) {
        // If only start date is selected, use it as single date
        const formattedDate = startDate.getFullYear() + '-' + 
          String(startDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(startDate.getDate()).padStart(2, '0');
        setSelectedCalendarDate(formattedDate);
        
        // Add to active filters
        let newFilters = [...activeFilters];
        newFilters = newFilters.filter((filter) => filter.type !== "dateRange" && filter.type !== "date");
        newFilters.push({
          type: "dateRange",
          value: formattedDate,
          label: startDate.toLocaleDateString(),
        });
        setActiveFilters(newFilters);
      }
      
      setShowDatePicker(false);
    };

    const clearSelection = () => {
      setStartDate(null);
      setEndDate(null);
      setHoverDate(null);
    };

    return (
      <div 
        ref={datePickerRef}
        className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4"
      >
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCalendarDate(
                new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1)
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
                new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1)
              )
            }
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Date Range Display */}
        <div className="mb-4 text-sm text-center">
          {startDate && endDate ? (
            <span className="text-blue-600 font-medium">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
          ) : startDate ? (
            <span className="text-gray-600">
              Start: {startDate.toLocaleDateString()} (Select end date)
            </span>
          ) : (
            <span className="text-gray-400">Select start date</span>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day)}
              onMouseEnter={() => handleDateHover(day)}
              onMouseLeave={() => setHoverDate(null)}
              disabled={!day.isCurrentMonth}
              className={`text-center text-sm py-2 rounded transition-colors ${
                day.isCurrentMonth 
                  ? "text-gray-900 hover:bg-gray-100 cursor-pointer" 
                  : "text-gray-300 cursor-not-allowed"
              } ${
                day.isToday ? "ring-2 ring-blue-300" : ""
              } ${
                isStartDate(day) || isEndDate(day)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              } ${
                isDateInRange(day) && !isStartDate(day) && !isEndDate(day)
                  ? "bg-blue-100 text-blue-700"
                  : ""
              }`}
            >
              {day.day}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
          <button
            onClick={applyDateFilter}
            disabled={!startDate}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              startDate
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
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
          <span className="text-gray-900">General</span>
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
              {paginationData?.total || 0} Total
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* My Reports Toggle */}
            {isCommandCentreAgent && (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">My Reports</span>
              <button
                onClick={() => setShowMyReports(!showMyReports)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showMyReports ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showMyReports ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            )}

            {/* Enhanced Search with Dropdown */}
            <div className="flex items-center">
              {/* Search Type Dropdown */}
              <div className="relative" ref={searchDropdownRef}>
                <button
                  onClick={toggleSearchDropdown}
                  className="flex items-center space-x-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-white text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="text-sm">{searchType}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <SearchDropdown />
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-12 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  ⌘K
                </span>
              </div>
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
          <div className="flex items-center justify-between w-full space-x-4 text-sm">
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={selectedAll}
                  onChange={handleSelectAll}
                />
                <span className="text-gray-700">Select All</span>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Filter By:</span>
              </div>
              
              {/* Date Filter */}
              <div className="relative" ref={datePickerRef}>
                <button
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  onClick={toggleDatePicker}
                >
                  <span>Date</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <DatePicker />
              </div>

              {/* Report Status Filter */}
              <div className="relative" ref={reportStatusRef}>
                <button
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  onClick={toggleReportStatusDropdown}
                >
                  <span>Report Status</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <DropdownMenu
                  ref={reportStatusRef}
                  isOpen={showReportStatusDropdown}
                  options={incidentStatus}
                  onSelect={(id) => handleFilterSelect("reportStatus", id)}
                  selectedValue={selectedReportStatus}
                />
              </div>

              {/* Police Station Filter */}
              <div className="relative" ref={policeStationRef}>
                <button
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  onClick={togglePoliceStationDropdown}
                >
                  <span>Police Station</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <DropdownMenu
                  ref={policeStationRef}
                  isOpen={showPoliceStationDropdown}
                  options={stations}
                  onSelect={(value) => handleFilterSelect("policeStation", value)}
                  selectedValue={selectedPoliceStation}
                />
              </div>

              {/* Origin Channel Filter */}
              <div className="relative" ref={originChannelRef}>
                <button
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  onClick={toggleOriginChannelDropdown}
                >
                  <span>Origin Channel</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <DropdownMenu
                  ref={originChannelRef}
                  isOpen={showOriginChannelDropdown}
                  options={incidentChannels}
                  onSelect={(value) => handleFilterSelect("originChannel", value)}
                  selectedValue={selectedOriginChannel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading incidents...</div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {incidents.map((report, index) => (
          <ReportCard key={`${report.id}-${index}`} report={report} />
        ))}
      </div>

      {/* Empty State */}
      {!loading && incidents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">No incidents found</div>
          {(searchTerm || showMyReports || activeFilters.length > 0) && (
            <div className="text-sm text-gray-400 mt-2">
              Try adjusting your search or filters
            </div>
          )}
        </div>
      )}

      {/* Fixed Pagination */}
      {!loading && incidents.length > 0 && paginationData.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-lg border border-gray-200">
          {/* Previous Button */}
          <button
            className={`flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-2">
            {generatePageNumbers().map((page, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : page === "..."
                    ? "text-gray-400 cursor-default"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => typeof page === "number" && handlePageChange(page)}
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            className={`flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentPage === paginationData.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
            disabled={currentPage === paginationData.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {!loading && incidents.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Showing {((currentPage - 1) * (paginationData.pageSize || 10)) + 1} to{' '}
          {Math.min(currentPage * (paginationData.pageSize || 10), paginationData.total || 0)} of{' '}
          {paginationData.total || 0} results
          {paginationData.totalPages > 1 && (
            <span className="ml-2">
              (Page {currentPage} of {paginationData.totalPages})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default General;