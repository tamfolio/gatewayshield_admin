import React from 'react';
import { X } from 'lucide-react';

// Filter badge component
const FilterBadge = ({ type, value, onRemove, formatValue = (v) => v }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
    type === 'userRole' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }`}>
    {type === 'userRole' ? value : formatValue(value)}
    <button 
      onClick={() => onRemove(type, value)}
      className={`rounded p-0.5 focus:outline-none focus:ring-1 ${
        type === 'userRole'
          ? 'hover:bg-blue-200 focus:ring-blue-400'
          : 'hover:bg-green-200 focus:ring-green-400'
      }`}
      aria-label={`Remove ${value} filter`}
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

// Main Filters Component 
const AuditFilters = ({ 
  selectedFilters, 
  onFilterChange, 
  hasActiveFilters,
  auditLogsUtils 
}) => {

  const removeFilter = (type, value) => {
    if (type === 'userRole') {
      onFilterChange({
        ...selectedFilters,
        userRole: selectedFilters.userRole.filter(r => r !== value)
      });
    } else if (type === 'timeStamp') {
      onFilterChange({
        ...selectedFilters,
        timeStamp: null
      });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({ userRole: [], timeStamp: null });
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("❌ Invalid date format:", dateString);
      return "Invalid Date";
    }
  };

  // Only show if there are active filters
  if (!hasActiveFilters) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Active filters">
        {selectedFilters.userRole.map((role) => (
          <FilterBadge
            key={role}
            type="userRole"
            value={role}
            onRemove={removeFilter}
          />
        ))}
        
        {selectedFilters.timeStamp && (
          <FilterBadge
            type="timeStamp"
            value={selectedFilters.timeStamp}
            onRemove={removeFilter}
            formatValue={formatDateForDisplay}
          />
        )}
      </div>

      <button
        onClick={clearAllFilters}
        className="text-xs text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-1 focus:ring-gray-400 rounded px-1"
      >
        Clear All
      </button>
    </div>
  );
};

export default AuditFilters;