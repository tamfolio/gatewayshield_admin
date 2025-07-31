import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Calendar, AlertTriangle, Loader2, Eye, Clock, MapPinIcon } from 'lucide-react';
import { geoData } from '../../../Utils/ogun-state';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { publicRequest, userRequest } from '../../../requestMethod';

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [crimeType, setCrimeType] = useState('');
  const [hoveredArea, setHoveredArea] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [crimeData, setCrimeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for dropdowns
  const [lgas, setLgas] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [loadingLgas, setLoadingLgas] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = useSelector((state) => state.user?.currentUser?.tokens?.access?.token);
  console.log(token)

  // Fetch LGAs from API
  const fetchLgas = async () => {
    try {
      setLoadingLgas(true);
      const response = await publicRequest.get("/options/lgas/all");
      console.log("LGAs API response:", response.data);
      
      // Fix: Access the 'lgas' array inside the data object
      const formattedLgas = response.data?.data?.lgas?.map((item) => ({
        label: item.name,
        value: item.id,
      })) || [];
      
      console.log("Formatted LGAs:", formattedLgas); // Add this for debugging
      setLgas(formattedLgas);
    } catch (error) {
      console.error("Error fetching LGAs:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoadingLgas(false);
    }
  };

  // Fetch incident types from API
  const fetchIncidentTypes = async () => {
    try {
      setLoadingIncidents(true);
      const response = await userRequest(token).get("/feedback/caseReview/crime-types");
      console.log("Incident types API response:", response.data);
      
      const formattedData = response.data?.data?.map((item) => ({
        label: item.name,
        value: item.id,
      })) || [];
      
      setIncidentTypes(formattedData);
    } catch (error) {
      console.error("Error fetching incident types:", error);
      toast.error("Failed to fetch incident types");
    } finally {
      setLoadingIncidents(false);
    }
  };

  // Fetch crime data from API with filters
  const fetchCrimeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedLocation) params.append('lgaId', selectedLocation);
      if (crimeType) params.append('incidentTypeId', crimeType);
      if (dateRange) params.append('dateRange', dateRange);
      
      const queryString = params.toString();
      const endpoint = `/crimeMap/all`;
      
      if (isAuthenticated && token) {
        // Authenticated request - gets detailed data
        response = await userRequest(token).get(endpoint);
      } else {
        // Unauthenticated request - gets count only
        response = await publicRequest.get(endpoint);
      }

      const apiData = response.data.data.crimeMaps;
      const processedData = {};

      if (isAuthenticated) {
        // Process detailed authenticated response
        Object.keys(apiData).forEach(location => {
          const locationData = apiData[location];
          const count = locationData.count || 0;
          
          // Determine crime level based on count
          let level = 'normal';
          if (count >= 8) level = 'high';
          else if (count >= 3) level = 'moderate';
          else if (count > 0) level = 'low';
          
          processedData[location.replace(/\s+/g, '')] = {
            level,
            reports: count,
            crimes: locationData.crimes || []
          };
        });
      } else {
        // Process simple unauthenticated response
        Object.keys(apiData).forEach(location => {
          const count = apiData[location];
          
          // Determine crime level based on count
          let level = 'normal';
          if (count >= 8) level = 'high';
          else if (count >= 3) level = 'moderate';
          else if (count > 0) level = 'low';
          
          processedData[location.replace(/\s+/g, '')] = {
            level,
            reports: count
          };
        });
      }

      setCrimeData(processedData);
    } catch (err) {
      console.error('Failed to fetch crime data:', err);
      setError('Failed to load crime data. Please try again.');
      toast.error('Failed to load crime data');
      
      // Fallback to empty data structure
      setCrimeData({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchLgas();
    fetchIncidentTypes();
  }, []);

  // Fetch crime data when filters change
  useEffect(() => {
    if (!loadingLgas && !loadingIncidents) {
      fetchCrimeData();
    }
  }, [selectedLocation, crimeType, dateRange, isAuthenticated, token, loadingLgas, loadingIncidents]);

  // Calculate bounding box and create projection
  const { bounds, projection } = useMemo(() => {
    if (!geoData?.features?.length) return { bounds: null, projection: null };
    
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    geoData.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => {
          const [lng, lat] = coord;
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      }
    });
    
    const bounds = { minLng, maxLng, minLat, maxLat };
    
    // Create a simple projection function
    const projection = (lng, lat) => {
      const svgWidth = 800;
      const svgHeight = 600;
      const padding = 50;
      
      const x = ((lng - minLng) / (maxLng - minLng)) * (svgWidth - 2 * padding) + padding;
      const y = ((maxLat - lat) / (maxLat - minLat)) * (svgHeight - 2 * padding) + padding;
      
      return [x, y];
    };
    
    return { bounds, projection };
  }, []);

  // Convert GeoJSON coordinates to SVG path
  const coordinatesToPath = (coordinates) => {
    if (!projection) return '';
    
    return coordinates[0].map((coord, index) => {
      const [x, y] = projection(coord[0], coord[1]);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ') + ' Z';
  };

  const getColorClass = (level) => {
    switch (level) {
      case 'high': return 'fill-red-600 hover:fill-red-700';
      case 'moderate': return 'fill-orange-500 hover:fill-orange-600';
      case 'low': return 'fill-yellow-500 hover:fill-yellow-600';
      default: return 'fill-gray-300 hover:fill-gray-400';
    }
  };

  // Normalize LGA names for matching
  const normalizeName = (name) => {
    return name.replace(/[\s\-\/]/g, '').toLowerCase();
  };

  const getCrimeDataForLGA = (lgaName) => {
    const normalizedInput = normalizeName(lgaName);
    const matchingKey = Object.keys(crimeData).find(key => 
      normalizeName(key) === normalizedInput
    );
    return matchingKey ? crimeData[matchingKey] : { level: 'normal', reports: 0 };
  };

  // Handle LGA selection from dropdown
  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    if (value) {
      const selectedLga = lgas.find(lga => lga.value === parseInt(value));
      setSelectedLocationName(selectedLga ? selectedLga.label : '');
    } else {
      setSelectedLocationName('');
    }
  };

  // Handle map area click
  const handleAreaClick = (lgaName) => {
    if (isAuthenticated) {
      const selectedLga = lgas.find(lga => lga.label === lgaName);
      if (selectedLga) {
        setSelectedLocation(selectedLga.value.toString());
        setSelectedLocationName(lgaName);
      }
    }
  };

  // Get detailed crime data for selected LGA
  const getSelectedLGADetails = () => {
    if (!selectedLocationName || !isAuthenticated) return null;
    
    // Find the crime data for the selected LGA
    const lgaData = Object.keys(crimeData).find(key => 
      normalizeName(key) === normalizeName(selectedLocationName)
    );
    
    if (lgaData && crimeData[lgaData].crimes) {
      return {
        name: selectedLocationName,
        count: crimeData[lgaData].reports,
        crimes: crimeData[lgaData].crimes
      };
    }
    
    return null;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get touch distance for pinch zoom
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle mouse move to track cursor position
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // Handle panning
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle touch move for mobile
  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent default scrolling behavior
    
    if (e.touches.length === 1 && isPanning) {
      // Single touch - panning
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPanPoint.x;
      const deltaY = touch.clientY - lastPanPoint.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2) {
      // Two touch - pinch zoom
      const currentDistance = getTouchDistance(e.touches);
      if (touchStartDistance > 0) {
        const scale = currentDistance / touchStartDistance;
        const newZoom = Math.max(0.5, Math.min(5, zoomLevel * scale));
        setZoomLevel(newZoom);
        setTouchStartDistance(currentDistance);
      }
    }
  };

  // Handle zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  // Handle pan start
  const handleMouseDown = (e) => {
    setIsPanning(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single touch - start panning
      setIsPanning(true);
      const touch = e.touches[0];
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2) {
      // Two touches - start pinch zoom
      setIsPanning(false);
      setTouchStartDistance(getTouchDistance(e.touches));
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchStartDistance(0);
  };

  // Reset zoom and pan
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  // Refresh data
  const handleRefresh = () => {
    fetchCrimeData();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedLocation('');
    setSelectedLocationName('');
    setCrimeType('');
    setDateRange('7d');
  };

  const legendItems = [
    { color: 'bg-yellow-500', label: '0-2 reports/km²', description: 'Low crime concentration' },
    { color: 'bg-orange-500', label: '3-7 reports/km²', description: 'Moderate crime activity' },
    { color: 'bg-red-600', label: '8+ reports/km²', description: 'High concentration / Hotspot area' },
    { color: 'bg-gray-300', label: '0 reports/km²', description: 'Normal Zone' }
  ];

  // Get selected LGA details for display
  const selectedLGADetails = getSelectedLGADetails();

  // Show loading state for initial load
  if (loadingLgas || loadingIncidents) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-white">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading map data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-white">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <p className="text-red-600">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Location:</span>
          <select 
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm min-w-32"
            disabled={loadingLgas}
          >
            <option value="">All Locations</option>
            {lgas.map(lga => (
              <option key={lga.value} value={lga.value}>{lga.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Date Range:</span>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value='24h'>Last 24 Hours</option>
            <option value='7d'>Last 7 Days</option>
            <option value='30d'>Last 30 Days</option>
            <option value='3m'>Last 90 Days</option>
            <option value='12m'>Last Year</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Crime Type:</span>
          <select 
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm min-w-32"
            disabled={loadingIncidents}
          >
            <option value="">All Types</option>
            {incidentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 ml-auto">
          <button 
            onClick={handleClearFilters}
            className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Authentication Status */}
      <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
        {isAuthenticated ? 
          '🔒 Authenticated - Viewing detailed crime data' : 
          '🔓 Public view - Limited data available. Sign in for detailed information.'
        }
      </div>

      {/* Active Filters Display */}
      {(selectedLocation || crimeType || dateRange !== '7d') && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-yellow-800">Active Filters:</span>
            {selectedLocation && (
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                Location: {lgas.find(l => l.value === parseInt(selectedLocation))?.label}
              </span>
            )}
            {crimeType && (
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                Type: {incidentTypes.find(t => t.value === parseInt(crimeType))?.label}
              </span>
            )}
            {dateRange !== '7d' && (
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                Period: {dateRange}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative bg-white rounded-lg border shadow-sm p-4 min-h-96 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Updating map...</span>
            </div>
          </div>
        )}
        
        <svg 
          viewBox="0 0 800 600" 
          className="w-full h-full bg-gray-50 cursor-grab active:cursor-grabbing touch-none"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ userSelect: 'none', touchAction: 'none' }}
        >
          <g 
            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
            transformOrigin="400 300"
          >
          {geoData?.features?.map((feature, index) => {
            const lgaName = feature.properties.NAME_2;
            const crimeInfo = getCrimeDataForLGA(lgaName);
            
            if (feature.geometry.type === 'Polygon') {
              const pathData = coordinatesToPath(feature.geometry.coordinates);
              const [centerX, centerY] = projection ? 
                projection(
                  feature.geometry.coordinates[0].reduce((sum, coord) => sum + coord[0], 0) / feature.geometry.coordinates[0].length,
                  feature.geometry.coordinates[0].reduce((sum, coord) => sum + coord[1], 0) / feature.geometry.coordinates[0].length
                ) : [0, 0];
              
              return (
                <g key={index}>
                  <path
                    d={pathData}
                    className={`${getColorClass(crimeInfo.level)} stroke-white stroke-2 cursor-pointer transition-all duration-200 ${
                      selectedLocationName === lgaName ? 'stroke-blue-600 stroke-4' : ''
                    }`}
                    onMouseEnter={() => setHoveredArea(lgaName)}
                    onMouseLeave={() => setHoveredArea(null)}
                    onClick={() => handleAreaClick(lgaName)}
                  />
                  <text
                    x={centerX}
                    y={centerY}
                    className="text-xs font-bold fill-white pointer-events-none drop-shadow-sm"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                  >
                    {lgaName.toUpperCase()}
                  </text>
                </g>
              );
            }
            return null;
          })}
          </g>
        </svg>
        
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 bg-white rounded shadow-md">
          <button 
            onClick={handleZoomIn}
            className="w-10 h-10 md:w-8 md:h-8 bg-white border-b border-gray-200 flex items-center justify-center hover:bg-gray-50 first:rounded-t last:rounded-b transition-colors"
            title="Zoom In"
          >
            <span className="text-lg font-bold text-gray-600">+</span>
          </button>
          <button 
            onClick={handleZoomOut}
            className="w-10 h-10 md:w-8 md:h-8 bg-white border-b border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom Out"
          >
            <span className="text-lg font-bold text-gray-600">−</span>
          </button>
          <button 
            onClick={handleReset}
            className="w-10 h-10 md:w-8 md:h-8 bg-white flex items-center justify-center hover:bg-gray-50 first:rounded-t last:rounded-b transition-colors text-xs"
            title="Reset View"
          >
            <span className="text-gray-600">⌂</span>
          </button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
          {Math.round(zoomLevel * 100)}%
        </div>

        {/* Mobile Instructions */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs md:hidden">
          Pinch to zoom • Drag to pan
        </div>
        
        {/* Mouse-Following Tooltip */}
        {hoveredArea && (
          <div 
            className="absolute bg-black text-white px-3 py-2 rounded shadow-lg text-sm pointer-events-none z-10"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: mousePosition.x > 400 ? 'translateX(-100%)' : 'none'
            }}
          >
            <div className="font-medium">{hoveredArea}</div>
            <div>{getCrimeDataForLGA(hoveredArea).reports} reports</div>
            <div className="text-xs opacity-75 capitalize">{getCrimeDataForLGA(hoveredArea).level} activity</div>
            {isAuthenticated && getCrimeDataForLGA(hoveredArea).crimes && (
              <div className="text-xs opacity-75 mt-1">
                Click for detailed view
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Crime Intensity Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color}`}></div>
              <div>
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-xs text-gray-600">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Crime Information Table - Only for Authenticated Users */}
      {isAuthenticated && selectedLGADetails && (
        <div className="mt-6 p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MapPinIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedLGADetails.name} - Crime Details
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {selectedLGADetails.count} {selectedLGADetails.count === 1 ? 'Report' : 'Reports'}
            </span>
          </div>
          
          {selectedLGADetails.crimes && selectedLGADetails.crimes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Crime Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date Reported</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLGADetails.crimes.map((crime, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            getCrimeDataForLGA(selectedLGADetails.name).level === 'high' ? 'bg-red-500' :
                            getCrimeDataForLGA(selectedLGADetails.name).level === 'moderate' ? 'bg-orange-500' :
                            getCrimeDataForLGA(selectedLGADetails.name).level === 'low' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="font-medium text-gray-900">{selectedLGADetails.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                          {crime.crimetype}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(crime.dateReported)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{formatDate(crime.lastUpdated)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusBadgeColor(crime.status)}`}>
                          {crime.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-700 truncate" title={crime.description}>
                            {crime.description || 'No description provided'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No detailed crime data available</p>
              <p className="text-sm">Try selecting a different location or adjusting your filters.</p>
            </div>
          )}
          
          {/* Clear Selection Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedLocation('');
                setSelectedLocationName('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Instruction for Non-Authenticated Users */}
      {!isAuthenticated && selectedLocationName && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Detailed Information Requires Authentication</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Sign in to view detailed crime information for {selectedLocationName}. 
                Public users can only see crime count and intensity levels.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show message when LGA is selected but no data available */}
      {isAuthenticated && selectedLocationName && !selectedLGADetails && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-800">{selectedLocationName} Selected</h4>
              <p className="text-sm text-gray-600 mt-1">
                No detailed crime reports found for this location in the selected time period. 
                Try adjusting your filters or selecting a different date range.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;