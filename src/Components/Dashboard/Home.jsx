import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Calendar,
  Download,
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { userRequest } from "../../requestMethod";
import useAccessToken from "../../Utils/useAccessToken";
import CcsHome from "./CcsHome"; // Import the CCS component
import PsHome from "./PsHome"; // Import the Police Station component

const Home = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30 days");
  const [selectedRatingTimeframe, setSelectedRatingTimeframe] =
    useState("30 days");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTab, setSelectedTab] = useState("General");
  const [dashboardData, setDashboardData] = useState([]);
  const [dashboardData2, setDashboardData2] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataType, setDataType] = useState("General");
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
  const token = useAccessToken();

  const userData = useSelector((state) => state.user?.currentUser?.admin);

  const adminRolesList = useSelector((state) => state.user?.adminRoles);
  const userRoleId = useSelector(
    (state) => state.user?.currentUser?.admin?.roleId
  );
  const userName = useSelector((state) => state.user?.currentUser?.admin);

  // Get the current user's role name by matching roleId with adminRoles
  const getCurrentUserRole = () => {
    if (!adminRolesList || !userRoleId) return null;
    const role = adminRolesList.find((role) => role.id === userRoleId);
    return role ? role.name : null;
  };

  const currentUserRole = getCurrentUserRole();
  console.log("Current User Role:", currentUserRole);

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateForAPI = (date) => {
    if (!date) return "";
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if user is Command Centre Agent or Command Centre Supervisor
  const isCommandCentreAgent = currentUserRole === "Command Centre Agent";
  const isCommandCentreSupervisor =
    currentUserRole === "Command Centre Supervisor";
  const isPoliceStation = currentUserRole === "Police Station";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let url = `/admin/get/dashboard?type=${dataType}`;
        
        // Add date parameters if they exist
        if (startDate) {
          url += `&startDate=${formatDateForAPI(startDate)}`;
        }
        if (endDate) {
          url += `&endDate=${formatDateForAPI(endDate)}`;
        }
        
        const res = await userRequest(token).get(url);
        setDashboardData(res.data.data.dashboard);
      } catch (error) {
        console.error("❌ Failed to fetch Dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDashboardData2 = async () => {
      try {
        const res = await userRequest(token).get(
          `/feedback/generalFeedback/dashboard-stats`
        );
        setDashboardData2(res.data.data);
      } catch (error) {
        console.error("❌ Failed to fetch Dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
      fetchDashboardData2();
    }
  }, [token, dataType, startDate, endDate]);

  console.log("dashboardData", dashboardData);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    if (isSelectingStartDate) {
      setTempStartDate(date);
      setIsSelectingStartDate(false);
    } else {
      setTempEndDate(date);
    }
  };

  const applyDateFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDatePicker(false);
    setIsSelectingStartDate(true);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setShowDatePicker(false);
    setIsSelectingStartDate(true);
  };

  const isDateInRange = (date) => {
    if (!tempStartDate || !tempEndDate) return false;
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);
    const current = new Date(date);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    
    return current >= start && current <= end;
  };

  const isDateSelected = (date) => {
    const current = new Date(date);
    current.setHours(0, 0, 0, 0);
    
    if (tempStartDate) {
      const start = new Date(tempStartDate);
      start.setHours(0, 0, 0, 0);
      if (current.getTime() === start.getTime()) return 'start';
    }
    
    if (tempEndDate) {
      const end = new Date(tempEndDate);
      end.setHours(0, 0, 0, 0);
      if (current.getTime() === end.getTime()) return 'end';
    }
    
    return false;
  };

  // If user is Command Centre Supervisor, render CcsHome component
  if (isCommandCentreSupervisor) {
    return <CcsHome />;
  }

  // If user is Police Station, render PsHome component
  if (isPoliceStation) {
    return <PsHome />;
  }

  // Sample data for charts
  const resolutionTimeData = [
    { month: "Jan", time: 3.2 },
    { month: "Feb", time: 3.1 },
    { month: "Mar", time: 3.3 },
    { month: "Apr", time: 3.5 },
    { month: "May", time: 3.8 },
    { month: "Jun", time: 4.1 },
    { month: "Jul", time: 4.3 },
    { month: "Aug", time: 4.5 },
    { month: "Sep", time: 4.7 },
    { month: "Oct", time: 4.8 },
    { month: "Nov", time: 4.9 },
    { month: "Dec", time: 5.1 },
  ];

  const stationRatingsData = [
    { month: "Jan", rating: 3.8 },
    { month: "Feb", rating: 3.9 },
    { month: "Mar", rating: 4.0 },
    { month: "Apr", rating: 4.1 },
    { month: "May", rating: 4.2 },
    { month: "Jun", rating: 4.3 },
    { month: "Jul", rating: 4.3 },
    { month: "Aug", rating: 4.4 },
    { month: "Sep", rating: 4.4 },
    { month: "Oct", rating: 4.5 },
    { month: "Nov", rating: 4.5 },
    { month: "Dec", rating: 4.5 },
  ];

  // Command Centre Agent specific data
  const recentIncidents = [
    {
      id: "INC-001",
      type: "Security",
      station: "Central Station",
      time: "2 min ago",
      priority: "High",
    },
    {
      id: "INC-002",
      type: "Medical",
      station: "North Terminal",
      time: "5 min ago",
      priority: "Critical",
    },
    {
      id: "INC-003",
      type: "Technical",
      station: "South Plaza",
      time: "8 min ago",
      priority: "Medium",
    },
    {
      id: "INC-004",
      type: "Maintenance",
      station: "East Gate",
      time: "12 min ago",
      priority: "Low",
    },
  ];

  const stationStatuses = [
    { name: "Central Station", status: "Operational", incidents: 2 },
    { name: "North Terminal", status: "Alert", incidents: 5 },
    { name: "South Plaza", status: "Operational", incidents: 1 },
    { name: "East Gate", status: "Maintenance", incidents: 0 },
    { name: "West Hub", status: "Operational", incidents: 3 },
  ];

  const responseTimeData = [
    { hour: "00:00", time: 2.1 },
    { hour: "04:00", time: 1.8 },
    { hour: "08:00", time: 3.2 },
    { hour: "12:00", time: 2.7 },
    { hour: "16:00", time: 3.1 },
    { hour: "20:00", time: 2.4 },
  ];

  const incidentTypesData = [
    { name: "Security", value: 35, color: "#EF4444" },
    { name: "Medical", value: 25, color: "#F59E0B" },
    { name: "Technical", value: 20, color: "#3B82F6" },
    { name: "Maintenance", value: 20, color: "#10B981" },
  ];

  const rawChannelData = dashboardData?.channels || {};

  const channelData = [
    { name: "Web", key: "web", color: "#4E79A7" },
    { name: "Mobile", key: "mobile", color: "#F28E2B" },
    { name: "SMS", key: "sms", color: "#E15759" },
    { name: "Socials", key: "socials", color: "#76B7B2" },
    { name: "Call", key: "call", color: "#59A14F" },
  ].map((channel) => ({
    name: channel.name,
    value: rawChannelData[channel.key] ?? 0,
    color: channel.color,
  }));

  const colorPalette = [
    "#4E79A7",
    "#F28E2B",
    "#E15759",
    "#76B7B2",
    "#59A14F",
    "#E0E0FF",
  ];

  const incidentData = Object.entries(dashboardData?.incidentTypes || {}).map(
    ([name, value], index) => ({
      name,
      value,
      color: colorPalette[index % colorPalette.length],
    })
  );

  const bottomStationsData = (dashboardData2?.bottomStations || []).map(
    (station) => ({
      name: station.stationName?.replace(" DIVISION", "") || "Unknown Station",
      rating: Number(station.avgRating) || 0,
      totalFeedbacks: station.totalFeedbacks,
      stationId: station.stationId,
    })
  );

  const topStationsData = (dashboardData2?.topStations || []).map(
    (station) => ({
      name: station.stationName?.replace(" DIVISION", "") || "Unknown Station",
      rating: Number(station.avgRating) || 0,
      totalFeedbacks: station.totalFeedbacks,
      stationId: station.stationId,
    })
  );

  const timeframes = ["12 months", "3 months", "30 days", "7 days", "24 hours"];

  const StatCard = ({ title, value, change, isNegative }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div
          className={`flex items-center text-sm border border-gray-300 px-1 text-semibold text-[rgba(65, 70, 81, 1)] rounded-md`}
        >
          <span
            className={`mr-1 text-semibold ${
              isNegative ? "text-red-500" : "text-green-500"
            }`}
          >
            {isNegative ? "↗" : "↗"}
          </span>
          {change}
        </div>
      </div>
    </div>
  );

  const AdminStatCard = ({
    title,
    value,
    change,
    isNegative,
    valueColor = "text-gray-900",
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex items-center text-xs">
          <span
            className={`mr-1 ${isNegative ? "text-red-500" : "text-green-500"}`}
          >
            {isNegative ? "↓" : "↑"}
          </span>
          <span className="text-gray-600">{change}</span>
        </div>
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );

  const DatePickerComponent = () => {
    const calendarDays = generateCalendarDays();
    const today = new Date();
    
    return (
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Calendar className="w-4 h-4" />
          <span>
            {startDate && endDate 
              ? `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`
              : "Jan 10, 2025 - Jan 16, 2025"
            }
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDatePicker && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-80">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {isSelectingStartDate ? 'Select Start Date' : 'Select End Date'}
              </h4>
              <div className="text-xs text-gray-500">
                {tempStartDate && (
                  <span>Start: {formatDateForDisplay(tempStartDate)}</span>
                )}
                {tempStartDate && tempEndDate && <span> | </span>}
                {tempEndDate && (
                  <span>End: {formatDateForDisplay(tempEndDate)}</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              <div className="p-2 font-medium text-gray-600">Sun</div>
              <div className="p-2 font-medium text-gray-600">Mon</div>
              <div className="p-2 font-medium text-gray-600">Tue</div>
              <div className="p-2 font-medium text-gray-600">Wed</div>
              <div className="p-2 font-medium text-gray-600">Thu</div>
              <div className="p-2 font-medium text-gray-600">Fri</div>
              <div className="p-2 font-medium text-gray-600">Sat</div>

              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === today.getMonth();
                const isToday = date.toDateString() === today.toDateString();
                const selection = isDateSelected(date);
                const inRange = isDateInRange(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`p-2 hover:bg-blue-50 rounded text-gray-700 ${
                      !isCurrentMonth 
                        ? 'text-gray-300 cursor-not-allowed'
                        : selection === 'start' || selection === 'end'
                        ? 'bg-blue-600 text-white'
                        : inRange
                        ? 'bg-blue-100 text-blue-700'
                        : isToday
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : ''
                    }`}
                    disabled={!isCurrentMonth}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={clearDateFilter}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={applyDateFilter}
                  disabled={!tempStartDate || !tempEndDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0];
      return (
        <div
          style={{ background: "#fff", padding: 10, border: "1px solid #ccc" }}
        >
          <strong style={{ color }}>{name}:</strong> {value}
        </div>
      );
    }
    return null;
  };

  const StationTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Rating: <span className="font-medium">{data.rating}</span>
          </p>
          <p className="text-sm text-gray-600">
            Feedbacks:{" "}
            <span className="font-medium">{data.totalFeedbacks}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {userData?.firstName}
            </h1>
            <p className="text-gray-600">
              Here's an overview of your team's performance
            </p>
          </div>
          {!isCommandCentreAgent && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export report
            </button>
          )}
        </div>

        {/* Tabs and Date Picker */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setDataType("General");
                setSelectedTab("General");
              }}
              className={`pb-3 border-b-2 transition-colors ${
                selectedTab === "General"
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              General
            </button>
            <button
              onClick={() => {
                setDataType("SOS");
                setSelectedTab("SOS");
              }}
              className={`pb-3 border-b-2 transition-colors ${
                selectedTab === "SOS"
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              SOS
            </button>
          </div>
          <div className="flex items-center gap-4">
            <DatePickerComponent />
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 pr-8">
                <option>Channel</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Total Reports Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Total Reports (2200)
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            title="In Progress"
            value={dashboardData?.base?.["in-progress"] ?? 0}
            change="2%"
            isNegative={false}
          />
          <StatCard
            title="Treated"
            value={dashboardData?.base?.["treated"] ?? 0}
            change="2%"
            isNegative={false}
          />
          <StatCard
            title="SLA Breached"
            value={dashboardData?.base?.["sla breached"] ?? 0}
            change="2%"
            isNegative={true}
          />
          <StatCard
            title="Closed"
            value={dashboardData?.base?.closed ?? 0}
            change="2%"
            isNegative={false}
          />
          <StatCard
            title="Unassigned"
            value={dashboardData?.base?.["unassigned"] ?? 0}
            change="2%"
            isNegative={false}
          />
          <StatCard
            title="Rejected"
            value={dashboardData?.base?.["rejected"] ?? 0}
            change="2%"
            isNegative={true}
          />
        </div>

        {/* Charts Grid - Only show for non-Command Centre Agents */}
        {!isCommandCentreAgent && (
          <>
            {/* Original Admin Charts */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Average Resolution Time */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Average Resolution Time
                  </h3>
                  <div className="relative">
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-200 rounded px-3 py-1 text-sm text-gray-700 pr-8"
                    >
                      <option>Station</option>
                      <option>All Stations</option>
                      <option>Top Performing</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        selectedTimeframe === timeframe
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={resolutionTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                      />
                      <YAxis hide />
                      <Line
                        type="monotone"
                        dataKey="time"
                        stroke="#5B5CE6"
                        strokeWidth={3}
                        dot={{ fill: "#5B5CE6", strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: "#5B5CE6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reports by Channel */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Reports by Channel
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-8 space-y-4">
                    {channelData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Average Station Ratings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Average Station Ratings
                  </h3>
                </div>

                <div className="flex gap-2 mb-4">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedRatingTimeframe(timeframe)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        selectedRatingTimeframe === timeframe
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {/* {dashboardData2?.averageStationRating ? 
                      `${dashboardData2.averageStationRating.toFixed(1)} star` : 
                      '4.5 star'
                    } */}
                  </div>
                </div>

                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stationRatingsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                      />
                      <YAxis hide />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#5B5CE6"
                        strokeWidth={3}
                        dot={{ fill: "#5B5CE6", strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: "#5B5CE6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Reported Incident */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Top Reported Incident
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incidentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {incidentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value}`,
                            `${props.payload.name}`,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-8 space-y-4">
                    {incidentData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Station Performance */}
            <div className="grid grid-cols-2 gap-6">
              {/* Bottom Performing Stations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Bottom Performing Stations
                </h3>
                {bottomStationsData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={bottomStationsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#666" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          domain={[0, 5]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                          ticks={[1, 2, 3, 4, 5]}
                        />
                        <Tooltip content={<StationTooltip />} />
                        <Bar
                          dataKey="rating"
                          fill="#EF4444"
                          radius={[4, 4, 0, 0]}
                          barSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    No station data available
                  </div>
                )}
              </div>

              {/* Top Performing Stations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Top Performing Stations
                </h3>
                {topStationsData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topStationsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#666" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          domain={[0, 5]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                          ticks={[1, 2, 3, 4, 5]}
                        />
                        <Tooltip content={<StationTooltip />} />
                        <Bar
                          dataKey="rating"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                          barSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    No station data available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;