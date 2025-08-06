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

// ==================== UTILITY FUNCTIONS ====================

const formatDateForAPI = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const getDateRange = (rangeType) => {
  const endDate = new Date();
  const startDate = new Date(endDate); // 🟢 Make a copy of endDate

  switch (rangeType) {
    case 'Last 7 Days':
      startDate.setDate(startDate.getDate() - 7); // 🟢 Adjust this copy only
      break;
    case 'Last 30 Days':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'Last 90 Days':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate),
  };
};


const transformChartData = (apiData, chartType = 'generic', fallbackData = []) => {
  if (!apiData) return fallbackData;

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
    let name = item.stationName || item.name || `Station ${index + 1}`;
    let value = 0;
    
    switch (chartType) {
      case 'topStations':
        value = parseFloat(item.resolvedCount) || 0;
        break;
      case 'bottomStations':
        value = parseFloat(item.unresolvedCount) || 0;
        break;
      case 'ratings':
        value = parseFloat(item.averageRating || item.avgRating) || 0;
        break;
      default:
        const possibleFields = [
          'resolvedCount', 
          'unresolvedCount', 
          'averageRating', 
          'avgRating', 
          'rating', 
          'value', 
          'count', 
          'ratingCount'
        ];
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

const extractDashboardMetrics = (dashboardStats) => {
  if (!dashboardStats) return {
    averageRating: 0,
    totalRatings: 0,
    resolvedCases: 0,
    slaBreached: '0%',
  };

  return {
    averageRating: dashboardStats.averageRating ?? 0,
    totalRatings: dashboardStats.totalRatings ?? 0,
    resolvedCases: dashboardStats.resolvedCases ?? 0,
    slaBreached: dashboardStats.slaBreached ?? '0%',
  };
};


// ==================== REUSABLE COMPONENTS ====================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false, 
  ...props 
}) => {
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

// ==================== CHART COMPONENT ====================

const DashboardBarChart = ({ 
  data, 
  color = "#10B981", 
  title, 
  loading = false, 
  error = null, 
  onRetry, 
  chartType = 'count' 
}) => {
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
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-gray-500 mb-2">No data available</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      const cleanName = item.name.replace(/Police Station|Station/gi, '').trim();
      return cleanName.length > 8 ? cleanName.substring(0, 8) + '...' : cleanName;
    }),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 0,
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 45,
      maxBarThickness: 55,
    }]
  };

  const maxValue = Math.max(...data.map(item => item.value));
  const isRatingChart = chartType === 'rating' || title.toLowerCase().includes('rating');
  const yAxisMax = isRatingChart ? 5 : Math.ceil(maxValue * 1.2);
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
        grid: { 
          color: '#E5E7EB', 
          drawBorder: false,
          lineWidth: 1
        },
      },
      x: {
        ticks: {
          color: '#6B7280',
          font: { size: 11 },
          maxRotation: 0,
          padding: 8,
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            if (label.length > 12) {
              return label.substring(0, 10) + '...';
            }
            return label;
          }
        },
        grid: { display: false }
      }
    },
    layout: {
      padding: { top: 35, bottom: 15, left: 15, right: 15 }
    },
    animation: {
      duration: 800,
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
          const y = element.y - 10;
          
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 12px Arial';
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
      <div className="h-80">
        <Bar data={chartData} options={options} plugins={plugins} />
      </div>
    </div>
  );
};

// ==================== FILTER COMPONENTS ====================

const SearchableFilterDropdown = ({ 
  label, 
  options, 
  value, 
  onChange, 
  loading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const safeOptions = React.useMemo(() => {
    if (!Array.isArray(options)) return [];

    return options.filter(option => {
      if (!option) return false;
      
      if (typeof option === 'string') {
        return option.toLowerCase() !== 'all';
      }
      
      if (label === "Area Command") {
        return option.formation && 
               typeof option.formation === 'string' && 
               option.formation.toLowerCase() !== 'all';
      }
      
      if (option.name && typeof option.name === 'string') {
        return option.name.toLowerCase() !== 'all';
      }
      
      return false;
    });
  }, [options, label]);
  
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return safeOptions;
    
    return safeOptions.filter(option => {
      if (!option) return false;
      
      let searchText = '';
      if (typeof option === 'string') {
        searchText = option;
      } else if (label === "Area Command") {
        searchText = option.formation || '';
      } else {
        searchText = option.name || '';
      }
      
      return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [safeOptions, searchTerm, label]);

  const displayValue = React.useMemo(() => {
    if (loading) return 'Loading...';
    if (!value || value === 'All' || value === '') return 'Select...';
    
    if (typeof value === 'string') {
      return value.length > 25 ? value.substring(0, 22) + '...' : value;
    }
    
    if (typeof value === 'object' && value) {
      if (label === "Area Command" && value.formation) {
        const formation = value.formation;
        return formation.length > 25 ? formation.substring(0, 22) + '...' : formation;
      }
      if (value.name) {
        const name = value.name;
        return name.length > 25 ? name.substring(0, 22) + '...' : name;
      }
    }
    
    return 'Select...';
  }, [value, loading, label]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  const handleOptionSelect = React.useCallback((option) => {
    try {
      onChange(option);
      handleClose();
    } catch (error) {
      console.error(`Error selecting ${label} option:`, error);
    }
  }, [onChange, handleClose, label]);

  if (!Array.isArray(options) && options !== null && options !== undefined) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          disabled={true}
          className="flex items-center gap-2 min-w-[160px] opacity-50"
        >
          <span className="truncate text-red-500">
            {label}: Error
          </span>
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 min-w-[160px]"
        disabled={loading}
      >
        <span className="truncate" title={displayValue}>
          {label}: {displayValue}
        </span>
        <ChevronDown className="w-4 h-4 flex-shrink-0" />
      </Button>

      {isOpen && !loading && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={handleClose}
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
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  let displayText = 'Unknown';
                  let subtitle = '';
                  let key = `${label}-option-${index}`;
                  
                  try {
                    if (typeof option === 'string') {
                      displayText = option;
                      key = option;
                    } else if (option && typeof option === 'object') {
                      if (label === "Area Command") {
                        displayText = option.formation || 'Unknown Formation';
                        subtitle = option.address || '';
                        key = option.id || `formation-${index}`;
                      } else {
                        displayText = option.name || option.toString() || 'Unknown';
                        key = option.id || `option-${index}`;
                      }
                    }
                  } catch (error) {
                    displayText = `Option ${index + 1}`;
                  }
                  
                  return (
                    <button
                      key={key}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionSelect(option);
                      }}
                    >
                      <div className="font-medium truncate" title={displayText}>
                        {displayText}
                      </div>
                      {subtitle && (
                        <div className="text-xs text-gray-500 mt-1 truncate" title={subtitle}>
                          {subtitle}
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {safeOptions.length === 0 
                    ? `No ${label.toLowerCase()} available`
                    : `No matches found${searchTerm ? ` for "${searchTerm}"` : ''}`
                  }
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FilterDropdown = ({ 
  label, 
  options, 
  value, 
  onChange, 
  loading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const safeOptions = Array.isArray(options) ? options.filter(option => {
    if (!option) return false;
    const optionName = typeof option === 'string' ? option : (option.name || option.toString());
    return optionName.toLowerCase() !== 'all';
  }) : [];
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        disabled={loading}
      >
        {label}: {value || 'Select...'}
        <ChevronDown className="w-4 h-4" />
      </Button>
      
      {isOpen && !loading && (
        <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {safeOptions.map((option, index) => (
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
          {safeOptions.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const CaseReview = () => {
  const apiClient = useApiClient();
  
  // State management
  const [filters, setFilters] = useState({
    dateRange: 'Last 7 Days',
    crimeType: '',
    source: '',
    area: '',
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
  
  // ==================== API FUNCTIONS ====================
  
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

  const loadStations = async () => {
    setLoading(prev => ({ ...prev, stations: true }));
    
    const defaultCoordinates = {
      longitude: 3.4164067,
      latitude: 7.1825953
    };
    
    const result = await safeApiCall(
      () => caseReviewFeedbackApi.getStations(apiClient, defaultCoordinates), 
      'stations'
    );
    
    if (result) {
      let stationsData = [];
      
      if (Array.isArray(result)) {
        stationsData = result;
      } else if (result.data && result.data.stations && Array.isArray(result.data.stations)) {
        stationsData = result.data.stations;
      } else if (result.data && Array.isArray(result.data)) {
        stationsData = result.data;
      } else if (result.stations && Array.isArray(result.stations)) {
        stationsData = result.stations;
      } else if (typeof result === 'object' && result !== null) {
        const checkPaths = ['data.stations', 'data.nearbyStations', 'stations', 'nearbyStations'];
        
        for (const path of checkPaths) {
          const pathParts = path.split('.');
          let current = result;
          let isValid = true;
          
          for (const part of pathParts) {
            if (current && typeof current === 'object' && current[part]) {
              current = current[part];
            } else {
              isValid = false;
              break;
            }
          }
          
          if (isValid && Array.isArray(current) && current.length > 0) {
            stationsData = current;
            break;
          }
        }
        
        if (stationsData.length === 0 && result.data && typeof result.data === 'object') {
          const nestedArrayProperties = Object.keys(result.data).filter(key => Array.isArray(result.data[key]));
          if (nestedArrayProperties.length > 0) {
            stationsData = result.data[nestedArrayProperties[0]];
          }
        }
      }
      
      if (stationsData.length > 0 && !filters.area && !filters.stationId) {
        const firstStation = stationsData[0];
        setFilters(prev => ({
          ...prev,
          area: firstStation.formation || 'Unknown',
          stationId: firstStation.id || ''
        }));
      }
      
      setData(prev => ({ ...prev, stations: stationsData }));
    }
    setLoading(prev => ({ ...prev, stations: false }));
  };

  const loadCrimeTypes = async () => {
    setLoading(prev => ({ ...prev, crimeTypes: true }));
    const result = await safeApiCall(
      () => caseReviewFeedbackApi.getCrimeTypes(apiClient), 
      'crimeTypes'
    );
    
    if (result) {
      let crimeTypesData = [];
      
      if (Array.isArray(result)) {
        crimeTypesData = result;
      } else if (result.data && Array.isArray(result.data)) {
        crimeTypesData = result.data;
      } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
        crimeTypesData = result.data.data;
      } else if (result.crimeTypes && Array.isArray(result.crimeTypes)) {
        crimeTypesData = result.crimeTypes;
      }
      
      if (crimeTypesData.length > 0 && !filters.crimeType && !filters.incidentTypeId) {
        const firstCrimeType = crimeTypesData[0];
        setFilters(prev => ({
          ...prev,
          crimeType: firstCrimeType.name,
          incidentTypeId: firstCrimeType.id
        }));
      }
      
      setData(prev => ({ ...prev, crimeTypes: crimeTypesData }));
    }
    setLoading(prev => ({ ...prev, crimeTypes: false }));
  };

  const loadSourceChannels = async () => {
    setLoading(prev => ({ ...prev, sourceChannels: true }));
    const result = await safeApiCall(
      () => caseReviewFeedbackApi.getSourceChannels(apiClient), 
      'sourceChannels'
    );
    
    if (result) {
      let sourceChannelsData = [];
      
      if (Array.isArray(result)) {
        sourceChannelsData = result;
      } else if (result.data && Array.isArray(result.data)) {
        sourceChannelsData = result.data;
      } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
        sourceChannelsData = result.data.data;
      } else if (result.sourceChannels && Array.isArray(result.sourceChannels)) {
        sourceChannelsData = result.sourceChannels;
      } else if (typeof result === 'object' && result !== null && result.data && typeof result.data === 'object') {
        const nestedArrayProperties = Object.keys(result.data).filter(key => Array.isArray(result.data[key]));
        if (nestedArrayProperties.length > 0) {
          sourceChannelsData = result.data[nestedArrayProperties[0]];
        }
      }
      
      if (sourceChannelsData.length > 0 && !filters.source) {
        const firstSourceChannel = sourceChannelsData[0];
        let defaultValue = '';
        
        if (typeof firstSourceChannel === 'string') {
          defaultValue = firstSourceChannel;
        } else if (firstSourceChannel && typeof firstSourceChannel === 'object') {
          defaultValue = firstSourceChannel.name || firstSourceChannel.channel || firstSourceChannel.value || firstSourceChannel;
        }
        
        setFilters(prev => ({
          ...prev,
          source: defaultValue
        }));
      }
      
      setData(prev => ({ ...prev, sourceChannels: sourceChannelsData }));
    }
    setLoading(prev => ({ ...prev, sourceChannels: false }));
  };

 const loadDashboardData = async () => {
  try {
    setLoading(prev => ({
      ...prev,
      dashboard: true   // Start loading
    }));

    const res = await apiClient.get('/feedback/caseReview/dashboard-stats', {
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate
      }
    });

    console.log('✅ [CASE REVIEW API] Dashboard stats fetched successfully');

    setData(prev => ({
      ...prev,
      dashboardStats: res.data.data
    }));
  } catch (error) {
    console.error('❌ Failed to load dashboard stats:', error);
    setErrors(prev => ({
      ...prev,
      dashboard: 'Failed to load dashboard stats'
    }));
  } finally {
    setLoading(prev => ({
      ...prev,
      dashboard: false   // Stop loading
    }));
  }
};


  // ==================== EVENT HANDLERS ====================

 const handleFilterChange = (key, value) => {
  if (key === 'dateRange') {
    const { startDate, endDate } = getDateRange(value);

    setFilters(prev => ({
      ...prev,
      [key]: value,
      startDate,
      endDate
    }));
  } else {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }
};

  // ==================== DATA PROCESSING ====================
const getChartDataFromDashboard = (dataPath, chartType = 'generic') => {
  const dashboardData = data.dashboardStats;
  if (!dashboardData || !dashboardData[dataPath]) return [];

  return transformChartData(dashboardData[dataPath], chartType, []);
};


  const formatMetricValue = (value, type) => {
    switch (type) {
      case 'rating':
        return value === '0.0' ? '0.0' : value;
      case 'number':
        return value === 0 ? '0' : value.toLocaleString();
      case 'percentage':
        return value || '0%';
      default:
        return value;
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (apiClient) {
      loadStations();
      loadCrimeTypes();
      loadSourceChannels();
    }
  }, [apiClient]);



 useEffect(() => {
  if (apiClient) {
    loadDashboardData();
  }
}, [apiClient, JSON.stringify(filters)]);


  // ==================== DATA EXTRACTION ====================

  const dashboardMetrics = extractDashboardMetrics(data.dashboardStats);
  const topPerformingStations = getChartDataFromDashboard('topStations', 'topStations');
  const bottomPerformingStations = getChartDataFromDashboard('bottomStations', 'bottomStations');
  const ratingsByStation = getChartDataFromDashboard('stationRatings', 'ratings');

  // ==================== RENDER ====================

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
        
        <div className="dashboard-main-content">
          
          <Card className="p-6 mb-8">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Reported Incident</h2>
            </div>

            <div className="mb-6 flex flex-wrap gap-4">
              <FilterDropdown 
                label="Date Range" 
                options={['Last 7 Days', 'Last 30 Days', 'Last 90 Days']}
                value={filters.dateRange}
                onChange={(value) => handleFilterChange('dateRange', value)}
              />
              <SearchableFilterDropdown
                label="Crime Type" 
                options={data.crimeTypes || []}
                value={filters.crimeType}
                onChange={(value) => handleFilterChange('crimeType', value)}
                loading={loading.crimeTypes}
              />
              <SearchableFilterDropdown
                label="Source Channel" 
                options={data.sourceChannels || []}
                value={filters.source}
                onChange={(value) => handleFilterChange('source', value)}
                loading={loading.sourceChannels}
              />
              <SearchableFilterDropdown
                label="Area Command" 
                options={data.stations || []}
                value={filters.area}
                onChange={(value) => handleFilterChange('area', value)}
                loading={loading.stations}
              />
            </div>

            {errors.dashboard && (
              <div className="mb-6">
                <ErrorMessage 
                  message={errors.dashboard}
                  onRetry={loadDashboardData}
                />
              </div>
            )}

            {(errors.stations || errors.crimeTypes || errors.sourceChannels) && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Some filter data may not be available:
                  {errors.stations && <span className="block">• Stations: {errors.stations}</span>}
                  {errors.crimeTypes && <span className="block">• Crime Types: {errors.crimeTypes}</span>}
                  {errors.sourceChannels && <span className="block">• Source Channels: {errors.sourceChannels}</span>}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Average Citizen Rating</div>
                  <div className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
                    {loading.dashboard ? (
                      <div className="animate-pulse">Loading...</div>
                    ) : (
                      <>
                        {formatMetricValue(dashboardMetrics.averageRating, 'rating')}/5
                      </>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <StarRating rating={Math.floor(parseFloat(dashboardMetrics.averageRating))} size="md" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Total Ratings</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {loading.dashboard ? (
                      <div className="animate-pulse">Loading...</div>
                    ) : (
                      formatMetricValue(dashboardMetrics.totalRatings, 'number')
                    )}
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Resolved Cases</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {loading.dashboard ? (
                      <div className="animate-pulse">Loading...</div>
                    ) : (
                      formatMetricValue(dashboardMetrics.resolvedCases, 'number')
                    )}
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">SLA Breached</div>
                  <div className={`text-3xl font-bold ${
                    dashboardMetrics.slaBreached !== '0%' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {loading.dashboard ? (
                      <div className="animate-pulse">Loading...</div>
                    ) : (
                      formatMetricValue(dashboardMetrics.slaBreached, 'percentage')
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <DashboardBarChart 
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
                <DashboardBarChart 
                  data={bottomPerformingStations}
                  color="#EF4444"
                  title="Bottom Performing Stations"
                  loading={loading.dashboard}
                  error={errors.dashboard}
                  onRetry={loadDashboardData}
                  chartType="count"
                />
              </Card>
            </div>

            <Card className="mb-0">
              <DashboardBarChart 
                data={ratingsByStation}
                color="#3B82F6"
                title="Ratings Per Station"
                loading={loading.dashboard}
                error={errors.dashboard}
                onRetry={loadDashboardData}
                chartType="rating"
              />
            </Card>
          </Card>
        </div>

        <div className="case-review-table">
          <CaseReviewTable 
            
          />
        </div>
      </div>
    </div>
  );
};

export default CaseReview;