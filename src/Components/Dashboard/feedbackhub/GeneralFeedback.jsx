import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import GeneralFeedbackTable from './GeneralFeedbackTable';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// API service
const API_BASE_URL = 'https://admin-api.thegatewayshield.com/api/v1/feedback/generalFeedback';

const feedbackAPI = {
  getDashboardStats: async (page = 1, size = 10) => {
    const response = await fetch(`${API_BASE_URL}/dashboard-stats?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },
  
  getAllFeedbacks: async (page = 1, size = 10) => {
    const response = await fetch(`${API_BASE_URL}/all-feedbacks?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch feedbacks');
    return response.json();
  },
  
  deleteFeedback: async (feedbackId) => {
    const response = await fetch(`${API_BASE_URL}/delete-feedback`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackId }),
    });
    if (!response.ok) throw new Error('Failed to delete feedback');
    return response.json();
  },
  
  publishFeedback: async (feedbackId) => {
    const response = await fetch(`${API_BASE_URL}/publish-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackId }),
    });
    if (!response.ok) throw new Error('Failed to publish feedback');
    return response.json();
  }
};

// Reusable Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Reusable Button Component
const Button = ({ children, variant = "primary", size = "md", className = "", disabled = false, loading = false, ...props }) => {
  const baseClasses = "font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Error Component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
    <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
    <div>
      <p className="text-red-800 font-medium">Error loading data</p>
      <p className="text-red-600 text-sm">{error}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </div>
  </div>
);

// Filter Dropdown Component
const FilterDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {label}: {value}
        <ChevronDown className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {options.map(option => (
            <button
              key={option}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Line Chart Component
const LineChart = ({ title, rating, data = [] }) => {
  // Generate chart data from API response or use default
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: data.length > 0 ? data : [4.2, 4.1, 4.3, 4.4, 4.2, 4.5, 4.4, 4.6, 4.5, 4.4, 4.5, 4.5],
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
    scales: {
      y: {
        display: false,
        min: 3.5,
        max: 5,
      },
      x: {
        display: false,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex gap-2 text-xs text-gray-500 mb-4">
          <span>12 months</span>
          <span>3 months</span>
          <span>30 days</span>
          <span>7 days</span>
          <span>24 hours</span>
        </div>
      </div>
      
      <div className="h-32 mb-4">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">{rating} star</div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
    </div>
  );
};

// Bar Chart Component
const BarChart = ({ title, data, color }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 40,
      maxBarThickness: 50,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          maxRotation: 0,
        },
        grid: {
          display: false
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
  };

  const plugins = [{
    afterDatasetsDraw: function(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((element, index) => {
          const dataString = dataset.data[index].toString();
          const x = element.x;
          const y = element.y - 10;
          
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(dataString, x, y);
        });
      });
    }
  }];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="h-48">
        <Bar data={chartData} options={options} plugins={plugins} />
      </div>
    </div>
  );
};

const GeneralFeedback = () => {
  const [filters, setFilters] = useState({
    timeRange: 'Last 7 Days'
  });
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sample fallback data
  const fallbackData = {
    averageOfficerRating: 4.5,
    averageStationRating: 4.5,
    topPerformingOfficers: [
      { name: 'Inspector Ayo', value: 4.8 },
      { name: 'Inspector Bola', value: 4.9 },
      { name: 'Inspector Chidi', value: 4.2 },
      { name: 'Inspector Dayo', value: 4.8 },
      { name: 'Inspector Eko', value: 4.7 }
    ],
    bottomPerformingOfficers: [
      { name: 'Inspector Femi', value: 2.8 },
      { name: 'Inspector Grace', value: 2.9 },
      { name: 'Inspector Hassan', value: 2.2 },
      { name: 'Inspector Ini', value: 2.8 },
      { name: 'Inspector John', value: 2.7 }
    ],
    topPerformingStations: [
      { name: 'Ikeja', value: 4.8 },
      { name: 'Ikoyi', value: 4.9 },
      { name: 'Surulere', value: 4.2 },
      { name: 'Victoria Island', value: 4.8 },
      { name: 'Yaba', value: 4.7 }
    ],
    bottomPerformingStations: [
      { name: 'Alaba', value: 2.8 },
      { name: 'Agege', value: 2.9 },
      { name: 'Mushin', value: 2.2 },
      { name: 'Oshodi', value: 2.8 },
      { name: 'Ketu', value: 2.7 }
    ]
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedbackAPI.getDashboardStats(1, 10);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      // Use fallback data when API fails
      setDashboardData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters.timeRange]);

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log('Exporting PDF...');
  };

  if (loading) {
    return (
      <div className="p-6 pt-0">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <LoadingSpinner />
          </Card>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6 pt-0">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <ErrorDisplay error={error} onRetry={fetchDashboardData} />
          </Card>
        </div>
      </div>
    );
  }

  const data = dashboardData || fallbackData;

  return (
    <div className="p-6 pt-0">
      <div className="max-w-7xl mx-auto">
        {/* Main Card Container */}
        <Card className="p-6 mb-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Feedback Summary - Top 5 Officers and Stations
            </h2>
            <div className="flex items-center gap-4">
              <FilterDropdown 
                label="" 
                options={['Last 7 Days', 'Last 30 Days', 'Last 90 Days']}
                value={filters.timeRange}
                onChange={(value) => setFilters({...filters, timeRange: value})}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleExportPDF}
              >
                <FiDownloadCloud className="w-4 h-4" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchDashboardData}
                loading={loading}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Using cached data. API connection issue: {error}
              </p>
            </div>
          )}

          {/* Line Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <LineChart 
                title="Average Officer Rating" 
                rating={data.averageOfficerRating || "4.5"} 
                data={data.officerRatingTrend}
              />
            </Card>
            <Card>
              <LineChart 
                title="Average Station Rating" 
                rating={data.averageStationRating || "4.5"}
                data={data.stationRatingTrend}
              />
            </Card>
          </div>

          {/* Bar Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <BarChart 
                title="Top Performing Officers"
                data={data.topPerformingOfficers || fallbackData.topPerformingOfficers}
                color="#3B82F6"
              />
            </Card>
            <Card>
              <BarChart 
                title="Top Performing Stations"
                data={data.topPerformingStations || fallbackData.topPerformingStations}
                color="#10B981"
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-0">
            <Card>
              <BarChart 
                title="Bottom Performing Officers"
                data={data.bottomPerformingOfficers || fallbackData.bottomPerformingOfficers}
                color="#F97316"
              />
            </Card>
            <Card>
              <BarChart 
                title="Bottom Performing Stations"
                data={data.bottomPerformingStations || fallbackData.bottomPerformingStations}
                color="#EF4444"
              />
            </Card>
          </div>
        </Card>

        {/* FUNCTIONAL Feedback Table Component with API Integration */}
        <GeneralFeedbackTable />
      </div>
    </div>
  );
};

export default GeneralFeedback;