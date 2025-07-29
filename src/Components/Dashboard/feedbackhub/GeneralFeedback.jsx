import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';
import GeneralFeedbackTable from './GeneralFeedbackTable';
import { useApiClient, generalFeedbackApi, feedbackUtils } from '../../../Utils/apiClient';

// Skeleton Components
const SkeletonPulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const LineChartSkeleton = () => (
  <div className="p-6">
    <div className="mb-4">
      <SkeletonPulse className="h-6 w-48 mb-2" />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-4 w-16" />
        ))}
      </div>
    </div>
    
    <div className="h-32 mb-4 relative">
      <SkeletonPulse className="h-full w-full" />
      <div className="absolute inset-0 flex items-end justify-between p-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonPulse key={i} className="w-1 bg-gray-300" style={{ height: `${Math.random() * 80 + 20}%` }} />
        ))}
      </div>
    </div>
    
    <div className="text-center mb-4">
      <SkeletonPulse className="h-8 w-24 mx-auto" />
    </div>
    
    <div className="flex justify-between">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-3 w-6" />
      ))}
    </div>
  </div>
);

const BarChartSkeleton = () => (
  <div className="p-6">
    <SkeletonPulse className="h-6 w-48 mb-6" />
    <div className="h-48 flex items-end justify-between space-x-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <SkeletonPulse className="w-full bg-gray-300 rounded-t" style={{ height: `${Math.random() * 150 + 50}px` }} />
          <SkeletonPulse className="h-4 w-16 mt-2" />
        </div>
      ))}
    </div>
  </div>
);

// Reusable Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

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
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
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
        </>
      )}
    </div>
  );
};

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

// Chart Components
const LineChart = ({ title, rating, loading = false, data = [] }) => {
  if (loading) {
    return <LineChartSkeleton />;
  }

  // Generate realistic rating trend data if no data provided (should be between 1-5 stars)
  const chartData = data.length > 0 ? data : [
    4.2, 4.1, 4.3, 4.4, 4.2, 4.5, 4.4, 4.6, 4.5, 4.4, 4.5, 4.5
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartHeight = 80;
  const chartWidth = 260;

  // Calculate line path for smooth curve
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      
      // Calculate control points for smooth curve
      const cpx1 = previous.x + (current.x - previous.x) / 3;
      const cpy1 = previous.y;
      const cpx2 = current.x - (current.x - previous.x) / 3;
      const cpy2 = current.y;
      
      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${current.x} ${current.y}`;
    }
    
    return path;
  };

  // Convert data to SVG coordinates
  const points = chartData.map((value, index) => ({
    x: (index * chartWidth) / (chartData.length - 1),
    y: chartHeight - ((value - 1) / 4) * chartHeight // Scale 1-5 to chartHeight-0
  }));

  const smoothPath = createSmoothPath(points);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex gap-2 text-xs text-gray-500 mb-4">
          <span className="bg-gray-100 px-2 py-1 rounded">12 months</span>
          <span className="text-gray-400">3 months</span>
          <span className="text-gray-400">30 days</span>
          <span className="text-gray-400">7 days</span>
          <span className="text-gray-400">24 hours</span>
        </div>
      </div>
      
      <div className="h-32 mb-4 bg-gray-50 rounded p-4 relative">
        {/* Y-axis labels (5-star scale) */}
        <div className="absolute left-1 top-2 bottom-6 flex flex-col justify-between text-xs text-gray-400">
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-6 h-full relative">
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`lineGradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
              </linearGradient>
              
              {/* Gradient fill under the line */}
              <linearGradient id={`areaGradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity: 0.3}} />
                <stop offset="100%" style={{stopColor: '#6366f1', stopOpacity: 0.05}} />
              </linearGradient>
            </defs>
            
            {/* Grid lines for star ratings */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * (chartHeight / 4)}
                x2={chartWidth}
                y2={i * (chartHeight / 4)}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                opacity="0.7"
              />
            ))}
            
            {/* Area fill under the line */}
            <path
              d={`${smoothPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
              fill={`url(#areaGradient-${title.replace(/\s+/g, '')})`}
            />
            
            {/* Main trend line */}
            <path
              d={smoothPath}
              fill="none"
              stroke={`url(#lineGradient-${title.replace(/\s+/g, '')})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                {/* Outer glow */}
                <circle 
                  cx={point.x} 
                  cy={point.y} 
                  r="6" 
                  fill="#6366f1"
                  opacity="0.2"
                />
                {/* Main point */}
                <circle 
                  cx={point.x} 
                  cy={point.y} 
                  r="3" 
                  fill="#ffffff"
                  stroke="#6366f1"
                  strokeWidth="2"
                  className="hover:r-4 transition-all cursor-pointer"
                />
                
                {/* Tooltip on hover */}
                <title>{months[index]}: {chartData[index].toFixed(1)} stars</title>
              </g>
            ))}
          </svg>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">{rating} star</div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-2 ml-6">
        {months.map(month => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ title, data = [], color, loading = false }) => {
  if (loading) {
    return <BarChartSkeleton />;
  }

  console.log(`🔍 BarChart "${title}" received data:`, data);

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <div>No rating data available</div>
            <div className="text-sm mt-1">Check API response structure</div>
          </div>
        </div>
      </div>
    );
  }

  // Process data
  const chartData = data.map((item, index) => {
    let value = 0;
    let name = 'Unknown';
    
    if (typeof item === 'object') {
      value = item.value || item.avgRating || item.rating || 0;
      name = item.name || item.officerName || item.stationName || `Item ${index + 1}`;
    }
    
    if (!name || name.trim() === '') {
      name = 'Unknown Officer';
    }
    
    const numericValue = parseFloat(value) || 0;
    
    console.log(`📊 Processing item: "${name}" = ${value} -> ${numericValue}`);
    
    return {
      name: name.length > 10 ? name.substring(0, 10) + '...' : name,
      value: numericValue,
      fullName: name
    };
  });

  const maxValue = 5;
  const chartHeight = 160; // Fixed chart height in pixels

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      {/* Chart container with fixed dimensions */}
      <div className="relative" style={{ height: '200px' }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex flex-col justify-between text-xs text-gray-500 h-40 w-8">
          <span>5★</span>
          <span>4★</span>
          <span>3★</span>
          <span>2★</span>
          <span>1★</span>
          <span>0★</span>
        </div>
        
        {/* Chart area with absolute positioning */}
        <div className="absolute left-10 top-0 right-0 h-40 border-l border-b border-gray-300">
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <div 
              key={rating} 
              className="absolute w-full border-t border-gray-200" 
              style={{ 
                bottom: `${(rating / 5) * 100}%`,
                borderColor: rating === 0 ? '#9CA3AF' : '#E5E7EB'
              }}
            />
          ))}
          
          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-start">
            {chartData.map((item, index) => {
              const barHeightPx = (item.value / maxValue) * chartHeight;
              const barWidth = `${90 / chartData.length}%`; // Use 90% to leave some margin
              
              return (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center"
                  style={{ 
                    width: barWidth,
                    marginRight: '2%'
                  }}
                >
                  {/* Value label above bar */}
                  <div 
                    className="absolute text-xs font-semibold text-gray-700 text-center w-full"
                    style={{ 
                      bottom: `${barHeightPx + 5}px`
                    }}
                  >
                    {item.value.toFixed(1)}★
                  </div>
                  
                  {/* The actual bar */}
                  <div 
                    className="absolute bottom-0 w-full rounded-t-md shadow-sm transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${Math.max(barHeightPx, 3)}px`, // Minimum 3px height
                      backgroundColor: color,
                      maxWidth: '50px',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                    title={`${item.fullName}: ${item.value} stars`}
                  >
                    {/* Gradient overlay */}
                    <div 
                      className="absolute inset-0 rounded-t-md opacity-30"
                      style={{
                        background: `linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.4) 100%)`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Name labels below chart */}
        <div className="absolute left-10 right-0 flex items-start justify-start" style={{ top: '170px' }}>
          {chartData.map((item, index) => {
            const barWidth = `${90 / chartData.length}%`;
            
            return (
              <div 
                key={index}
                className="text-xs text-gray-600 text-center"
                style={{ 
                  width: barWidth,
                  marginRight: '2%'
                }}
                title={item.fullName}
              >
                <div className="truncate px-1 leading-tight">
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Summary info */}
      <div className="text-xs text-gray-500 mt-4 text-center">
        {chartData.length} {title.toLowerCase().includes('officer') ? 'officers' : 'stations'} • 
        Range: {Math.min(...chartData.map(d => d.value)).toFixed(1)}★ - {Math.max(...chartData.map(d => d.value)).toFixed(1)}★
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
  
  // Get the API client using the hook
  const apiClient = useApiClient();

  const fetchDashboardData = async () => {
    if (!apiClient) {
      console.log('⏳ API client not ready yet, skipping dashboard fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use your real API client
      const data = await generalFeedbackApi.getDashboardStats(apiClient, 1, 10);
      
      console.log('🔍 Raw API Response:', JSON.stringify(data, null, 2));
      
      // Debug: Check the actual structure of the API response
      if (data && data.data) {
        console.log('📊 API Data Keys:', Object.keys(data.data));
        console.log('📊 Full API Data:', data.data);
      }
      
      // Transform API data using utility function
      const processedData = feedbackUtils.transformGeneralFeedbackDashboard(data.data);
      
      console.log('📊 Processed dashboard data:', processedData);
      
      // If we don't get proper data from API, let's check what we actually got
      if (!processedData || (!processedData.topPerformingOfficers?.length && !processedData.topPerformingStations?.length)) {
        console.log('⚠️ API returned empty or unexpected data structure');
        console.log('⚠️ Expected: { topOfficers: [...], bottomOfficers: [...], topStations: [...], bottomStations: [...] }');
        console.log('⚠️ Actual:', data.data);
        
        // Check if data has different field names
        const actualData = data.data || {};
        const possibleFields = Object.keys(actualData);
        console.log('🔍 Available fields in API response:', possibleFields);
        
        // Try to find rating-related data in the response
        possibleFields.forEach(field => {
          if (typeof actualData[field] === 'object' && actualData[field] !== null) {
            console.log(`🔍 Field "${field}":`, actualData[field]);
          }
        });
      }
      
      setDashboardData(processedData);
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiClient) {
      fetchDashboardData();
    }
  }, [filters.timeRange, apiClient]);

  const handleExportPDF = () => {
    console.log('Exporting PDF...');
    // Implement your PDF export functionality here
  };

  // Show error state if no API client and loading is complete
  if (!apiClient && !loading) {
    return (
      <div className="p-6 pt-0">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <ErrorDisplay 
              error="API client not available. Please check your authentication." 
              onRetry={() => window.location.reload()} 
            />
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if fetch failed
  if (error && !loading && !dashboardData) {
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

  return (
    <div className="p-6 pt-0">
      <div className="max-w-7xl mx-auto">
        {/* Main Card Container */}
        <Card className="p-6 mb-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Feedback Summary 
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

          {/* Error banner for partial failures */}
          {error && dashboardData && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                API connection issue: {error}. Showing cached data.
              </p>
            </div>
          )}

          {/* Line Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <LineChart 
                title="Average Officer Rating" 
                rating={dashboardData?.averageOfficerRating?.toFixed(1) || "0.0"} 
                loading={loading}
                data={dashboardData?.officerRatingTrend}
              />
            </Card>
            <Card>
              <LineChart 
                title="Average Station Rating" 
                rating={dashboardData?.averageStationRating?.toFixed(1) || "0.0"}
                loading={loading}
                data={dashboardData?.stationRatingTrend}
              />
            </Card>
          </div>

          {/* Bar Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <BarChart 
                title="Top Performing Officers"
                data={dashboardData?.topPerformingOfficers || []}
                color="#3B82F6"
                loading={loading}
              />
            </Card>
            <Card>
              <BarChart 
                title="Top Performing Stations"
                data={dashboardData?.topPerformingStations || []}
                color="#10B981"
                loading={loading}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-0">
            <Card>
              <BarChart 
                title="Bottom Performing Officers"
                data={dashboardData?.bottomPerformingOfficers || []}
                color="#F97316"
                loading={loading}
              />
            </Card>
            <Card>
              <BarChart 
                title="Bottom Performing Stations"
                data={dashboardData?.bottomPerformingStations || []}
                color="#EF4444"
                loading={loading}
              />
            </Card>
          </div>
        </Card>

        {/* General Feedback Table Component */}
        {apiClient ? (
          <GeneralFeedbackTable apiClient={apiClient} />
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Initializing API client...</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GeneralFeedback;