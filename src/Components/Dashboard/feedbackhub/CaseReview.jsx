// PRODUCTION-READY CaseReview Component - All debug code removed

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, Search } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FiDownloadCloud } from 'react-icons/fi';
import CaseReviewTable from './CaseReviewTable';
import { useApiClient, caseReviewFeedbackApi } from '../../../Utils/apiClient';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Utility functions
const formatDateForAPI = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const getDateRange = (rangeType) => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (rangeType) {
    case 'Last 7 Days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'Last 30 Days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'Last 90 Days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7);
  }
  
  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate)
  };
};

// Chart data transformation
const transformChartData = (apiData, chartType = 'generic', fallbackData = []) => {
  if (!apiData) {
    return fallbackData;
  }

  let dataArray = apiData;
  
  if (!Array.isArray(apiData)) {
    if (apiData.data && Array.isArray(apiData.data)) {
      dataArray = apiData.data;
    } else {
      return fallbackData;
    }
  }

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return fallbackData;
  }
  
  const transformedData = dataArray.map((item, index) => {
    let name = item.stationName || item.name || `Item ${index + 1}`;
    let value = 0;
    
    if (chartType === 'bottomStations' && item.unresolvedCount !== undefined) {
      value = parseFloat(item.unresolvedCount) || 0;
    } else if (chartType === 'topStations' && item.resolvedCount !== undefined) {
      value = parseFloat(item.resolvedCount) || 0;
    } else {
      const possibleFields = ['resolvedCount', 'unresolvedCount', 'rating', 'avgRating', 'value', 'count'];
      for (const field of possibleFields) {
        if (item[field] !== undefined && item[field] !== null) {
          value = parseFloat(item[field]) || 0;
          break;
        }
      }
    }

    return { name, value };
  });

  return transformedData;
};

// Dashboard metrics extraction
const extractDashboardMetrics = (dashboardStats) => {
  const defaultMetrics = {
    averageRating: '0.0',
    totalRatings: 0,
    resolvedCases: 0,
    slaBreached: '0'
  };

  if (!dashboardStats || !dashboardStats.data) {
    return defaultMetrics;
  }

  const data = dashboardStats.data;
  
  const metrics = {
    averageRating: String(parseFloat(data.averageRating || 0).toFixed(1)),
    totalRatings: Number(data.totalRatings || 0),
    resolvedCases: Number(data.resolvedCases || 0),
    slaBreached: String(data.slaBreached || '0')
  };
  
  return metrics;
};

// Reusable Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", size = "md", className = "", disabled = false, ...props }) => {
  const baseClasses = "font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:hover:bg-white"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const StarRating = ({ rating, maxRating = 5, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-600 mb-4">Error: {message}</div>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="sm">
        Retry
      </Button>
    )}
  </div>
);

const EnhancedEmptyState = ({ title, message, suggestion }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
    <div className="h-64 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📊</span>
      </div>
      <div className="text-gray-500 mb-2">{message}</div>
      {suggestion && (
        <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg max-w-sm">
          💡 {suggestion}
        </div>
      )}
    </div>
  </div>
);

// Chart Component
const BarChart = ({ data, color = "#10B981", title, loading = false, error = null, onRetry, chartType = 'rating' }) => {
  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    let emptyMessage = "No data available for this chart";
    let suggestion = null;
    
    if (title.toLowerCase().includes('top performing')) {
      emptyMessage = "No top performing stations found";
      suggestion = "This may indicate similar performance levels across stations, or try adjusting the date range.";
    } else if (title.toLowerCase().includes('bottom') || title.toLowerCase().includes('unresolved')) {
      emptyMessage = "No stations with unresolved cases";
      suggestion = "Great news! This might mean all cases are being resolved efficiently.";
    }
    
    return (
      <EnhancedEmptyState 
        title={title}
        message={emptyMessage}
        suggestion={suggestion}
      />
    );
  }

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

  const maxValue = Math.max(...data.map(item => item.value));
  const isRatingChart = chartType === 'rating' || title.toLowerCase().includes('rating');
  const yAxisMax = isRatingChart ? 5 : Math.ceil(maxValue * 1.1);
  const stepSize = isRatingChart ? 1 : Math.max(1, Math.ceil(maxValue / 5));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            if (isRatingChart) {
              return `Rating: ${value.toFixed(1)}/5`;
            } else {
              return `Count: ${value}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: yAxisMax,
        ticks: {
          stepSize: stepSize,
          color: '#6B7280',
          font: { size: 12 },
          callback: function(value) { 
            return Number.isInteger(value) ? value : ''; 
          }
        },
        grid: { color: '#E5E7EB', drawBorder: false },
        title: {
          display: true,
          text: isRatingChart ? 'Rating' : 'Count',
          color: '#374151',
          font: { size: 14, weight: 'bold' }
        }
      },
      x: {
        ticks: {
          color: '#6B7280',
          font: { size: 12 },
          maxRotation: 0,
          padding: 8
        },
        grid: { display: false }
      }
    },
    layout: {
      padding: { top: 30, bottom: 10, left: 10, right: 10 }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const plugins = [{
    afterDatasetsDraw: function(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((element, index) => {
          const dataValue = dataset.data[index];
          const displayValue = isRatingChart ? dataValue.toFixed(1) : dataValue.toString();
          const x = element.x;
          const y = element.y - 15;
          
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(displayValue, x, y);
        });
      });
    }
  }];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} plugins={plugins} />
      </div>
    </div>
  );
};

// Filter Components
const SearchableFilterDropdown = ({ label, options, value, onChange, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option => {
    const optionName = option.formation || option.name || option;
    return optionName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const displayValue = value?.formation || value?.name || value;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        disabled={loading}
      >
        {label}: {loading ? 'Loading...' : displayValue}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && !loading && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-20">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <button
                  key={option.id || index}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="font-medium">{option.formation || option.name || option}</div>
                  {option.address && (
                    <div className="text-xs text-gray-500 mt-1">{option.address}</div>
                  )}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">No options found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FilterDropdown = ({ label, options, value, onChange, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        disabled={loading}
      >
        {label}: {value}
        <ChevronDown className="w-4 h-4" />
      </Button>
      
      {isOpen && !loading && (
        <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {options.map((option, index) => (
            <button
              key={index}
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

// Main Component
const CaseReview = () => {
  const apiClient = useApiClient();
  
  const [filters, setFilters] = useState({
    dateRange: 'Last 7 Days',
    crimeType: 'All',
    source: 'All',
    area: 'All',
    stationId: '',
    incidentTypeId: ''
  });

  const [data, setData] = useState({
    dashboardStats: null,
    stations: [],
    crimeTypes: [],
    sourceChannels: []
  });

  const [loading, setLoading] = useState({
    dashboard: false,
    stations: false,
    crimeTypes: false,
    sourceChannels: false
  });

  const [errors, setErrors] = useState({});
  
  // API call wrapper
  const safeApiCall = async (apiFunction, errorKey, retryCount = 3) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const result = await apiFunction();
        setErrors(prev => ({ ...prev, [errorKey]: null }));
        return result;
      } catch (error) {
        if (attempt === retryCount) {
          const errorMessage = error.response?.status === 401
            ? 'Authentication failed. Please check your login status.'
            : error.response?.status === 403
            ? 'Access denied. You may not have permission to view this data.'
            : error.message || `Failed to load ${errorKey}. Please try again later.`;
          
          setErrors(prev => ({ ...prev, [errorKey]: errorMessage }));
          return null;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  // Load initial filter data
  useEffect(() => {
    if (apiClient) {
      loadStations();
      loadCrimeTypes();
      loadSourceChannels();
    }
  }, [apiClient]);

  // Load dashboard data when filters change
  useEffect(() => {
    if (apiClient) {
      loadDashboardData();
    }
  }, [filters, apiClient]);

  const loadStations = async () => {
    setLoading(prev => ({ ...prev, stations: true }));
    const result = await safeApiCall(
      () => caseReviewFeedbackApi.getStations(apiClient), 
      'stations'
    );
    if (result?.data) {
      setData(prev => ({ ...prev, stations: result.data }));
    }
    setLoading(prev => ({ ...prev, stations: false }));
  };

  const loadCrimeTypes = async () => {
    setLoading(prev => ({ ...prev, crimeTypes: true }));
    const result = await safeApiCall(
      () => caseReviewFeedbackApi.getCrimeTypes(apiClient), 
      'crimeTypes'
    );
    if (result?.data) {
      setData(prev => ({ ...prev, crimeTypes: result.data }));
    }
    setLoading(prev => ({ ...prev, crimeTypes: false }));
  };

  const loadSourceChannels = async () => {
    setLoading(prev => ({ ...prev, sourceChannels: true }));
    const result = await safeApiCall(
      () => caseReviewFeedbackApi.getSourceChannels(apiClient), 
      'sourceChannels'
    );
    if (result?.data) {
      setData(prev => ({ ...prev, sourceChannels: result.data }));
    }
    setLoading(prev => ({ ...prev, sourceChannels: false }));
  };

  const loadDashboardData = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    const dateRange = getDateRange(filters.dateRange);
    const apiFilters = {
      stationId: filters.stationId,
      incidentTypeId: filters.incidentTypeId,
      source: filters.source !== 'All' ? filters.source : '',
      ...dateRange
    };

    const result = await safeApiCall(
      () => caseReviewFeedbackApi.getDashboardStats(apiClient, apiFilters), 
      'dashboard'
    );
    if (result) {
      setData(prev => ({ ...prev, dashboardStats: result }));
    }
    setLoading(prev => ({ ...prev, dashboard: false }));
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    
    switch (filterType) {
      case 'area':
        newFilters.area = value.formation || value.name || value;
        newFilters.stationId = value.id || '';
        break;
      case 'crimeType':
        newFilters.crimeType = value.name || value;
        newFilters.incidentTypeId = value.id || '';
        break;
      case 'source':
        newFilters.source = value;
        break;
      default:
        newFilters[filterType] = value;
    }
    
    setFilters(newFilters);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    alert('PDF export functionality - integrate with your export API endpoint');
  };

  // Chart data extraction
  const getChartDataFromDashboard = (dataPath, chartType = 'generic') => {
    if (!data.dashboardStats) {
      return [];
    }
    
    let dashboardData = data.dashboardStats;
    if (data.dashboardStats.data) {
      dashboardData = data.dashboardStats.data;
    }
    
    if (!dashboardData || !dashboardData[dataPath]) {
      return [];
    }
    
    const chartData = dashboardData[dataPath];
    const transformed = transformChartData(chartData, chartType, []);
    return transformed;
  };

  // Extract metrics and chart data
  const dashboardMetrics = extractDashboardMetrics(data.dashboardStats);
  const topPerformingStations = getChartDataFromDashboard('topStations', 'topStations');
  const bottomPerformingStations = getChartDataFromDashboard('bottomStations', 'bottomStations');
  
  const ratingsByStation = [
    ...topPerformingStations.map(station => ({ ...station, type: 'top' })),
    ...bottomPerformingStations.map(station => ({ ...station, type: 'bottom' }))
  ].slice(0, 10);

  // Check if API client is available
  if (!apiClient) {
    return (
      <div className="p-6 pt-0">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading...</h2>
            <p className="text-gray-600 mb-4">Initializing API client...</p>
            <LoadingSpinner />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-0">
      <div className="max-w-7xl mx-auto">
        {/* Main Card Container */}
        <Card className="p-6 mb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Reported Incident</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <FiDownloadCloud className="w-4 h-4" />
              Export PDF
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <FilterDropdown 
              label="Date Range" 
              options={['Last 7 Days', 'Last 30 Days', 'Last 90 Days']}
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />
            <SearchableFilterDropdown
              label="Crime Type" 
              options={[{ name: 'All', id: '' }, ...data.crimeTypes]}
              value={filters.crimeType}
              onChange={(value) => handleFilterChange('crimeType', value)}
              loading={loading.crimeTypes}
            />
            <SearchableFilterDropdown
              label="Source Channel" 
              options={['All', ...(data.sourceChannels || [])]}
              value={filters.source}
              onChange={(value) => handleFilterChange('source', value)}
              loading={loading.sourceChannels}
            />
            <SearchableFilterDropdown
              label="Area Command" 
              options={[{ formation: 'All', id: '' }, ...data.stations]}
              value={filters.area}
              onChange={(value) => handleFilterChange('area', value)}
              loading={loading.stations}
            />
          </div>

          {/* Error Display */}
          {errors.dashboard && (
            <div className="mb-6">
              <ErrorMessage 
                message={errors.dashboard}
                onRetry={loadDashboardData}
              />
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Average Citizen Rating</div>
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  {loading.dashboard ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : dashboardMetrics.averageRating === '0.0' ? (
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400">No Ratings</span>
                      <span className="text-sm text-gray-500 mt-1">Yet</span>
                    </div>
                  ) : (
                    <>
                      {dashboardMetrics.averageRating}/5
                      <StarRating rating={Math.floor(parseFloat(dashboardMetrics.averageRating))} size="md" />
                    </>
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Total Ratings</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading.dashboard ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : dashboardMetrics.totalRatings === 0 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400">0</span>
                      <span className="text-sm text-gray-500 mt-1">No ratings yet</span>
                    </div>
                  ) : (
                    dashboardMetrics.totalRatings.toLocaleString()
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Resolved Cases</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading.dashboard ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : dashboardMetrics.resolvedCases === 0 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400">0</span>
                      <span className="text-sm text-gray-500 mt-1">None resolved</span>
                    </div>
                  ) : (
                    dashboardMetrics.resolvedCases.toLocaleString()
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">SLA Breached</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading.dashboard ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className={`${dashboardMetrics.slaBreached !== '0' && dashboardMetrics.slaBreached !== '0%' ? 'text-red-600' : 'text-green-600'}`}>
                        {dashboardMetrics.slaBreached}
                      </span>
                      {dashboardMetrics.slaBreached !== '0' && dashboardMetrics.slaBreached !== '0%' && (
                        <span className="text-xs text-red-500 mt-1">Needs attention</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Charts */}
          {topPerformingStations.length === 0 ? (
            // Show alternative layout when no top stations data
            <>
              <div className="mb-8">
                <Card>
                  <BarChart 
                    data={bottomPerformingStations}
                    color="#EF4444"
                    title="Stations with Unresolved Cases"
                    loading={loading.dashboard}
                    error={errors.dashboard}
                    onRetry={loadDashboardData}
                    chartType="count"
                  />
                </Card>
              </div>
              
              {bottomPerformingStations.length > 0 && (
                <div className="mb-8">
                  <Card className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Current Data Summary
                      </h3>
                      <p className="text-gray-600 mb-4">
                        The system shows {bottomPerformingStations.length} stations with unresolved cases, 
                        but no stations with resolved cases in the current timeframe.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Suggestions:</strong> Try expanding the date range or adjusting filters to see resolved cases and ratings data.
                        </p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-red-50 p-3 rounded">
                          <div className="font-medium text-red-800">Unresolved Cases</div>
                          <div className="text-2xl font-bold text-red-600">
                            {bottomPerformingStations.reduce((sum, station) => sum + station.value, 0)}
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded">
                          <div className="font-medium text-yellow-800">SLA Breach Rate</div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {dashboardMetrics.slaBreached}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          ) : (
            // Original two-column layout when both charts have data
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <BarChart 
                  data={topPerformingStations}
                  color="#10B981"
                  title="Top Performing Stations"
                  loading={loading.dashboard}
                  error={errors.dashboard}
                  onRetry={loadDashboardData}
                  chartType="count"
                />
              </Card>
              
              <Card>
                <BarChart 
                  data={bottomPerformingStations}
                  color="#EF4444"
                  title="Stations with Most Unresolved Cases"
                  loading={loading.dashboard}
                  error={errors.dashboard}
                  onRetry={loadDashboardData}
                  chartType="count"
                />
              </Card>
            </div>
          )}

          {/* Combined Ratings Chart - Only show if there's data */}
          {ratingsByStation.length > 0 && (
            <Card className="mb-0">
              <BarChart 
                data={ratingsByStation}
                color="#3B82F6"
                title="Station Performance Overview"
                loading={loading.dashboard}
                error={errors.dashboard}
                onRetry={loadDashboardData}
                chartType="count"
              />
            </Card>
          )}
        </Card>

        {/* Feedback Table Component */}
        <CaseReviewTable 
          filters={filters}
          onFilterChange={setFilters}
          apiClient={apiClient}
          caseReviewFeedbackApi={caseReviewFeedbackApi}
          loading={loading}
          errors={errors}
        />
      </div>
    </div>
  );
};

export default CaseReview;