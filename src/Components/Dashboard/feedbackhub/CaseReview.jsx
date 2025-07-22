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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Working API Integration
const caseReviewAPI = {
  baseURL: 'https://admin-api.thegatewayshield.com/api',
  
  getAuthToken: () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  async apiCall(endpoint, params = {}) {
    const token = this.getAuthToken();
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      console.log(`🚀 API Call: ${endpoint}`, params);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Success for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      throw error;
    }
  },

  async getDashboardStats(filters = {}) {
    return this.apiCall('/v1/feedback/caseReview/dashboard-stats', filters);
  },

  async getStations() {
    return this.apiCall('/v1/feedback/caseReview/stations');
  },

  async getCrimeTypes() {
    return this.apiCall('/v1/feedback/caseReview/crime-types');
  },

  async getSourceChannels() {
    return this.apiCall('/v1/feedback/caseReview/source-channel');
  },

  async getAllFeedbacks(params = {}) {
    return this.apiCall('/v1/feedback/caseReview/all-feedbacks', params);
  }
};

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

// Transform API data for charts
const transformChartData = (apiData, fallbackData) => {
  if (apiData && Array.isArray(apiData) && apiData.length > 0) {
    return apiData.map(item => ({
      name: item.name || item.station || item.formation || 'Unknown',
      value: parseFloat(item.value || item.rating || Math.random() * 5)
    }));
  }
  return fallbackData;
};

// Reusable Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Reusable Button Component
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

// Star Rating Component
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

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error Message Component
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

// Chart.js Bar Chart Component
const BarChart = ({ data, color = "#10B981", title, loading = false, error = null, onRetry }) => {
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
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
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
        borderColor: color,
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: '#6B7280',
          font: {
            size: 12
          },
          callback: function(value) {
            return value;
          }
        },
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Rating',
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          maxRotation: 0,
          padding: 8
        },
        grid: {
          display: false
        }
      }
    },
    layout: {
      padding: {
        top: 30,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    onHover: (event, activeElements) => {
      if (event.native) {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    }
  };

  const plugins = [{
    afterDatasetsDraw: function(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((element, index) => {
          const dataString = dataset.data[index].toString();
          const x = element.x;
          const y = element.y - 15;
          
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 14px Arial';
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
      <div className="h-64">
        <Bar data={chartData} options={options} plugins={plugins} />
      </div>
    </div>
  );
};

// Searchable Filter Dropdown Component
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

// Filter Dropdown Component
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

// Main Case Review Component
const CaseReview = () => {
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

  // API call wrapper with error handling
  const safeApiCall = async (apiFunction, errorKey) => {
    try {
      const result = await apiFunction();
      setErrors(prev => ({ ...prev, [errorKey]: null }));
      return result;
    } catch (error) {
      console.error(`Error in ${errorKey}:`, error);
      setErrors(prev => ({ ...prev, [errorKey]: error.message }));
      return null;
    }
  };

  // Load initial filter data
  useEffect(() => {
    loadStations();
    loadCrimeTypes();
    loadSourceChannels();
  }, []);

  // Load dashboard data when filters change
  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadStations = async () => {
    setLoading(prev => ({ ...prev, stations: true }));
    const result = await safeApiCall(() => caseReviewAPI.getStations(), 'stations');
    if (result?.data) {
      setData(prev => ({ ...prev, stations: result.data }));
    }
    setLoading(prev => ({ ...prev, stations: false }));
  };

  const loadCrimeTypes = async () => {
    setLoading(prev => ({ ...prev, crimeTypes: true }));
    const result = await safeApiCall(() => caseReviewAPI.getCrimeTypes(), 'crimeTypes');
    if (result?.data) {
      setData(prev => ({ ...prev, crimeTypes: result.data }));
    }
    setLoading(prev => ({ ...prev, crimeTypes: false }));
  };

  const loadSourceChannels = async () => {
    setLoading(prev => ({ ...prev, sourceChannels: true }));
    const result = await safeApiCall(() => caseReviewAPI.getSourceChannels(), 'sourceChannels');
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

    const result = await safeApiCall(() => caseReviewAPI.getDashboardStats(apiFilters), 'dashboard');
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
    // Export functionality
    console.log('Exporting PDF with filters:', filters);
    alert('PDF export functionality - integrate with your export API endpoint');
  };

  // Transform API data to chart format with fallbacks
  const topPerformingStations = transformChartData(
    data.dashboardStats?.topPerformingStations,
    [
      { name: 'Ikeja', value: 4.5 },
      { name: 'Ikoyi', value: 4.2 },
      { name: 'Surulere', value: 4.0 },
      { name: 'R. Okoro', value: 3.8 }
    ]
  );

  const bottomPerformingStations = transformChartData(
    data.dashboardStats?.bottomPerformingStations,
    [
      { name: 'Station A', value: 2.1 },
      { name: 'Station B', value: 2.3 },
      { name: 'Station C', value: 2.5 },
      { name: 'Station D', value: 2.7 }
    ]
  );

  const ratingsByStation = transformChartData(
    data.dashboardStats?.ratingsByStation,
    [
      { name: 'Station3', value: 4.2 },
      { name: 'Station2', value: 4.5 },
      { name: 'Station4', value: 3.8 },
      { name: 'Station6', value: 4.1 },
      { name: 'Station1', value: 3.9 },
      { name: 'Station7', value: 4.3 }
    ]
  );

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
                  ) : (
                    <>
                      {data.dashboardStats?.averageRating || '4.0'}/5
                      <StarRating rating={Math.floor(data.dashboardStats?.averageRating || 4)} size="md" />
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
                  ) : (
                    data.dashboardStats?.totalRatings || '250'
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
                  ) : (
                    data.dashboardStats?.resolvedCases || '1.3K'
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
                    `${data.dashboardStats?.slaBreached || '8'}%`
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <BarChart 
                data={topPerformingStations}
                color="#10B981"
                title="Top Performing Stations"
                loading={loading.dashboard}
                error={errors.dashboard}
                onRetry={loadDashboardData}
              />
            </Card>
            
            <Card>
              <BarChart 
                data={bottomPerformingStations}
                color="#EF4444"
                title="Bottom Performing Stations"
                loading={loading.dashboard}
                error={errors.dashboard}
                onRetry={loadDashboardData}
              />
            </Card>
          </div>

          {/* Ratings Per Station Chart */}
          <Card className="mb-0">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings Per Station</h3>
              {loading.dashboard ? (
                <LoadingSpinner />
              ) : errors.dashboard ? (
                <ErrorMessage message={errors.dashboard} onRetry={loadDashboardData} />
              ) : (
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: ratingsByStation.map(item => item.name),
                      datasets: [{
                        data: ratingsByStation.map(item => item.value),
                        backgroundColor: '#3B82F6',
                        borderColor: '#3B82F6',
                        borderWidth: 0,
                        borderRadius: 4,
                        borderSkipped: false,
                        barThickness: 30,
                        maxBarThickness: 40,
                      }]
                    }}
                    options={{
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
                          borderColor: '#3B82F6',
                          borderWidth: 1,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          min: 0,
                          max: 5,
                          ticks: {
                            stepSize: 1,
                            color: '#6B7280',
                            font: {
                              size: 12
                            },
                            callback: function(value) {
                              return value;
                            }
                          },
                          grid: {
                            color: '#E5E7EB',
                            drawBorder: false
                          },
                          title: {
                            display: true,
                            text: 'Rating',
                            color: '#374151',
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        },
                        x: {
                          ticks: {
                            color: '#6B7280',
                            font: {
                              size: 10
                            },
                            maxRotation: 45,
                            padding: 8
                          },
                          grid: {
                            display: false
                          }
                        }
                      },
                      layout: {
                        padding: {
                          top: 30,
                          bottom: 10,
                          left: 10,
                          right: 10
                        }
                      },
                      animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                      }
                    }}
                    plugins={[{
                      afterDatasetsDraw: function(chart) {
                        const ctx = chart.ctx;
                        chart.data.datasets.forEach((dataset, i) => {
                          const meta = chart.getDatasetMeta(i);
                          meta.data.forEach((element, index) => {
                            const dataString = dataset.data[index].toFixed(1);
                            const x = element.x;
                            const y = element.y - 15;
                            
                            ctx.fillStyle = '#374151';
                            ctx.font = 'bold 12px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(dataString, x, y);
                          });
                        });
                      }
                    }]}
                  />
                </div>
              )}
            </div>
          </Card>
        </Card>

        {/* Feedback Table Component */}
        <CaseReviewTable 
          filters={filters}
          onFilterChange={setFilters}
          caseReviewAPI={caseReviewAPI}
          loading={loading}
          errors={errors}
        />
      </div>
    </div>
  );
};

export default CaseReview;