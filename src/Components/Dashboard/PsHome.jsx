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
import { Calendar, Download, ChevronDown, AlertCircle, Clock, CheckCircle } from "lucide-react";

const PsHome = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30 days");
  const [selectedRatingTimeframe, setSelectedRatingTimeframe] = useState("30 days");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTab, setSelectedTab] = useState("General");
  const [dashboardData, setDashboardData] = useState({});
  const [dashboardData2, setDashboardData2] = useState({});
  const [loading, setLoading] = useState(false);

  // Mock user data for demo
  const userData = { firstName: "Sienna" };

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

  const citizenRatingData = [
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

  const rawChannelData = dashboardData?.channels || {};
  const channelData = [
    { name: "Web", key: "web", color: "#4E79A7" },
    { name: "Mobile", key: "mobile", color: "#F28E2B" },
    { name: "SMS", key: "sms", color: "#E15759" },
    { name: "Socials", key: "socials", color: "#76B7B2" },
    { name: "Call", key: "call", color: "#59A14F" },
  ].map((channel) => ({
    name: channel.name,
    value: rawChannelData[channel.key] ?? 25,
    color: channel.color,
  }));

  const incidentData = [
    { name: "Rape", value: 45, color: "#4E79A7" },
    { name: "Kidnapping", value: 30, color: "#F28E2B" },
    { name: "Theft", value: 25, color: "#E15759" },
    { name: "Robbery", value: 20, color: "#76B7B2" },
    { name: "Vandalism", value: 15, color: "#59A14F" },
  ];

  // Sample officer performance data
  const bottomOfficersData = [
    { name: "Akpan", rating: 2.5, totalReports: 45 },
    { name: "Akpan", rating: 3.5, totalReports: 32 },
    { name: "Akpan", rating: 2.0, totalReports: 28 },
    { name: "R. Okoro", rating: 3.5, totalReports: 22 },
    { name: "R. Okoro", rating: 2.0, totalReports: 18 },
  ];

  const topOfficersData = [
    { name: "Ikeja", rating: 2.5, totalReports: 45 },
    { name: "Ikoyi", rating: 3.5, totalReports: 38 },
    { name: "Surulere", rating: 2.0, totalReports: 35 },
    { name: "R. Okoro", rating: 3.5, totalReports: 32 },
    { name: "R. Okoro", rating: 2.0, totalReports: 28 },
  ];

  const timeframes = ["12 months", "3 months", "30 days", "7 days", "24 hours"];

  const StatCard = ({ title, value, change, isNegative }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-sm font-medium text-gray-600 mb-3">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className={`flex items-center text-xs px-2 py-1 rounded-full font-medium ${
          isNegative 
            ? "text-red-600" 
            : "text-green-600"
        }`}>
          <span className="mr-1">
            {isNegative ? "↗" : "↗"}
          </span>
          {change}
        </div>
      </div>
    </div>
  );

  const DatePickerComponent = () => (
    <div className="relative">
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <Calendar className="w-4 h-4" />
        <span>Jan 10, 2025 - Jan 16, 2025</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDatePicker && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-80">
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            <div className="p-2 font-medium text-gray-600">Sun</div>
            <div className="p-2 font-medium text-gray-600">Mon</div>
            <div className="p-2 font-medium text-gray-600">Tue</div>
            <div className="p-2 font-medium text-gray-600">Wed</div>
            <div className="p-2 font-medium text-gray-600">Thu</div>
            <div className="p-2 font-medium text-gray-600">Fri</div>
            <div className="p-2 font-medium text-gray-600">Sat</div>

            {Array.from({ length: 31 }, (_, i) => (
              <button
                key={i}
                className="p-2 hover:bg-blue-50 rounded text-gray-700"
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0];
      return (
        <div style={{ background: "#fff", padding: 10, border: "1px solid #ccc" }}>
          <strong style={{ color }}>{name}:</strong> {value}
        </div>
      );
    }
    return null;
  };

  const OfficerTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Rating: <span className="font-medium">{data.rating}</span>
          </p>
          <p className="text-sm text-gray-600">
            Reports: <span className="font-medium">{data.totalReports}</span>
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
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
              Export report
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Invite
            </button>
          </div>
        </div>

        {/* Tabs and Date Picker */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab("General")}
              className={`pb-3 border-b-2 transition-colors ${
                selectedTab === "General"
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setSelectedTab("SOS")}
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
              <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 pr-8">
                <option>Station Name</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Total Reports Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Total Reports (My Station)(2200)
          </h2>
        </div>

        {/* Stats Cards - Fixed Layout: 3 on top, 2 below */}
        <div className="space-y-4 mb-8">
          {/* Top row - 3 cards */}
          <div className="grid grid-cols-3 gap-6">
            <StatCard
              title="In Progress"
              value={dashboardData?.base?.["in-progress"] ?? 912}
              change="2%"
              isNegative={false}
            />
            <StatCard
              title="Unassigned"
              value={dashboardData?.base?.["unassigned"] ?? 14}
              change="12%"
              isNegative={false}
            />
            <StatCard
              title="SLA Breached"
              value={dashboardData?.base?.["sla breached"] ?? 914}
              change="2%"
              isNegative={true}
            />
          </div>
          
          {/* Bottom row - 2 cards */}
          <div className="grid grid-cols-2 gap-6">
            <StatCard
              title="Closed"
              value={dashboardData?.base?.["closed"] ?? 912}
              change="2%"
              isNegative={false}
            />
            <StatCard
              title="Rejected"
              value={dashboardData?.base?.["rejected"] ?? 92}
              change="2%"
              isNegative={true}
            />
          </div>
        </div>

        {/* Charts Grid */}
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
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Citizen Rating Average */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Citizen Rating Average
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
                4.5 star
              </div>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={citizenRatingData}>
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
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Officer Performance */}
        <div className="grid grid-cols-2 gap-6">
          {/* Bottom Performing Police Officers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Bottom Performing Police Officers
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bottomOfficersData}
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
                  <Tooltip content={<OfficerTooltip />} />
                  <Bar
                    dataKey="rating"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performing Police Officers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top Performing Police Officers
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topOfficersData}
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
                  <Tooltip content={<OfficerTooltip />} />
                  <Bar
                    dataKey="rating"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsHome;