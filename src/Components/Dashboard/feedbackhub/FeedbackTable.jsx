import React, { useState } from 'react';
import { Star, Search, ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { FiDownloadCloud } from 'react-icons/fi';

// Reusable Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Reusable Button Component
const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses = "font-medium rounded-md transition-colors duration-200";
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
      {...props}
    >
      {children}
    </button>
  );
};

// Reusable Input Component
const Input = ({ className = "", ...props }) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

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

// Station Filter Dropdown Component
const StationFilter = ({ onStationSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const allStations = Array.from({ length: 10 }, (_, i) => `Station ${i + 1}`);
  const displayedStations = allStations.slice(0, 3);
  const filteredStations = allStations.filter(station => 
    station.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-20">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {(searchTerm ? filteredStations : displayedStations).map(station => (
                <button
                  key={station}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStationSelect(station);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {station}
                </button>
              ))}
              {searchTerm && filteredStations.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">No stations found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Rating Filter Component
const RatingFilter = ({ onRatingSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onRatingSelect(rating);
                  setIsOpen(false);
                }}
              >
                <StarRating rating={rating} size="sm" />
                <span>{rating} star{rating !== 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Date Filter Component
const DateFilter = ({ onDateSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const handleApply = () => {
    if (fromDate || toDate) {
      onDateSelect({ from: fromDate, to: toDate });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setIsOpen(false);
  };

  return (
    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4">
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 border-b pb-2">
                Filter by Date Range
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    onChange={(e) => setFromDate(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    onChange={(e) => setToDate(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply();
                  }}
                  className="flex-1"
                  disabled={!fromDate && !toDate}
                >
                  Apply Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [...Array(totalPages)].map((_, i) => i + 1);
  
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      
      <div className="flex gap-2">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              page === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Main Feedback Table Component
const FeedbackTable = ({ data = [], filters = {}, onFilterChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilters, setTableFilters] = useState({
    station: null,
    rating: null,
    dateRange: null
  });

  const handleExportCSV = () => {
    // Convert table data to CSV format
    const headers = ['Report ID', 'Station', 'Feedback Text', 'Officer Rating', 'Date Created'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.id,
        row.station,
        `"${row.feedback}"`, // Wrap feedback in quotes to handle commas
        row.rating,
        row.date
      ].join(','))
    ].join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'feedback_table.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClearFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        dateRange: 'All Time',
        crimeType: 'All',
        source: 'All',
        area: 'All'
      });
    }
    setTableFilters({
      station: null,
      rating: null,
      dateRange: null
    });
  };

  const handleStationFilter = (station) => {
    setTableFilters(prev => ({ ...prev, station }));
  };

  const handleRatingFilter = (rating) => {
    setTableFilters(prev => ({ ...prev, rating }));
  };

  const handleDateFilter = (dateRange) => {
    setTableFilters(prev => ({ ...prev, dateRange }));
  };

  // Filter data based on table filters
  const filteredData = data.filter(item => {
    if (tableFilters.station && !item.station.includes(tableFilters.station)) return false;
    if (tableFilters.rating && item.rating !== tableFilters.rating) return false;
    if (searchTerm && !Object.values(item).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search..." 
            className="pl-10 pr-16 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-500 bg-gray-100 border border-gray-300 rounded">
            ⌘K
          </kbd>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2">
            <FiDownloadCloud className="w-3 h-3" /> 
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2 mb-4">
        {filters.dateRange && filters.dateRange !== 'All Time' && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {filters.dateRange}
          </span>
        )}
        {filters.crimeType && filters.crimeType !== 'All' && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {filters.crimeType}
          </span>
        )}
        {filters.source && filters.source !== 'All' && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {filters.source}
          </span>
        )}
        {tableFilters.station && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            {tableFilters.station}
          </span>
        )}
        {tableFilters.rating && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1">
            <StarRating rating={tableFilters.rating} size="sm" />
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Report ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-800 relative">
                  Station
                  <ChevronDown className="w-4 h-4" />
                  <StationFilter onStationSelect={handleStationFilter} />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Feedback Text</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-800 relative">
                  Officer Rating
                  <ChevronDown className="w-4 h-4" />
                  <RatingFilter onRatingSelect={handleRatingFilter} />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-800 relative">
                  Date Created
                  <ChevronDown className="w-4 h-4" />
                  <DateFilter onDateSelect={handleDateFilter} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{item.id}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{item.station}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{item.feedback}</td>
                <td className="py-3 px-4">
                  <StarRating rating={item.rating} />
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination 
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setCurrentPage}
        />
      </div>
    </Card>
  );
};

export default FeedbackTable;