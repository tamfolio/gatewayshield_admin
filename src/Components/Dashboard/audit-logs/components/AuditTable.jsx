import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Calendar, X } from 'lucide-react';


const useOutsideClick = (refs, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      const isOutside = refs.every(ref => 
        ref.current && !ref.current.contains(event.target)
      );
      
      if (isOutside) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [refs, callback]);
};

// Role badge component
const RoleBadge = ({ role, userName }) => {
  const getRoleStyle = (role) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    
    const normalizedRole = role.toLowerCase().replace(/\s+/g, '');
    
    if (normalizedRole.includes('superadmin')) return 'bg-purple-100 text-purple-800';
    if (normalizedRole.includes('manager')) return 'bg-indigo-100 text-indigo-800';
    if (normalizedRole.includes('supervisor')) return 'bg-blue-100 text-blue-800';
    if (normalizedRole.includes('agent')) return 'bg-cyan-100 text-cyan-800';
    if (normalizedRole.includes('police') && normalizedRole.includes('station')) return 'bg-orange-100 text-orange-800';
    if (normalizedRole.includes('officer')) return 'bg-yellow-100 text-yellow-800';
    if (normalizedRole.includes('citizen')) return 'bg-green-100 text-green-800';
    if (normalizedRole.includes('command') && normalizedRole.includes('centre')) return 'bg-blue-100 text-blue-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium max-w-fit ${getRoleStyle(role)}`}>
        {role || 'Unknown'}
      </span>
      {userName && userName !== 'System' && userName !== 'Unknown User' && (
        <span className="text-xs text-gray-500 truncate max-w-32" title={userName}>
          {userName}
        </span>
      )}
    </div>
  );
};

// Filter dropdown component - Fixed positioning and overflow
const FilterDropdown = ({ 
  isOpen, 
  onToggle, 
  dropdownRef, 
  title, 
  selectedCount, 
  children,
  icon: Icon,
  ariaLabel 
}) => (
  <div className="relative">
    <button 
      className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2 transition-colors"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label={ariaLabel}
    >
      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      <span className="font-medium">{title}</span>
      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      {selectedCount > 0 && (
        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
          {selectedCount}
        </span>
      )}
    </button>
    
    {isOpen && (
      <>
        {/* Backdrop for mobile */}
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden" onClick={onToggle} />
        
        {/* Dropdown */}
        <div 
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-64 max-w-80"
          style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}
          role="listbox"
          aria-label={`${title} filters`}
        >
          {children}
        </div>
      </>
    )}
  </div>
);

// Date picker component 
const DatePicker = ({ 
  selectedDate, 
  onDateChange, 
  onApply, 
  onClear,
  isOpen,
  onToggle,
  dropdownRef 
}) => (
  <FilterDropdown
    isOpen={isOpen}
    onToggle={onToggle}
    dropdownRef={dropdownRef}
    title="Time Stamp"
    selectedCount={selectedDate ? 1 : 0}
    icon={Calendar}
    ariaLabel="Filter by date"
  >
    <div className="p-4 w-64 bg-white">
      <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-3">
        Select Date
      </label>
      <input
        id="date-filter"
        type="date"
        value={selectedDate}
        onChange={onDateChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
        max={new Date().toISOString().split('T')[0]}
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={onApply}
          disabled={!selectedDate}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          Apply
        </button>
        <button
          onClick={onClear}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  </FilterDropdown>
);

// Role filter component
const RoleFilter = ({ 
  userRoles, 
  selectedRoles, 
  onRoleToggle, 
  onClearSelection,
  isOpen,
  onToggle,
  dropdownRef 
}) => (
  <FilterDropdown
    isOpen={isOpen}
    onToggle={onToggle}
    dropdownRef={dropdownRef}
    title="User Role"
    selectedCount={selectedRoles.length}
    ariaLabel="Filter by user role"
  >
    <div className="max-h-80 overflow-y-auto bg-white">
      <div className="p-3 border-b border-gray-100 bg-gray-50 sticky top-0">
        <button
          onClick={onClearSelection}
          className="w-full text-left text-sm text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          Clear selection ({selectedRoles.length} selected)
        </button>
      </div>
      
      {userRoles.length === 0 ? (
        <div className="p-4 text-sm text-gray-500 text-center">
          No roles available
        </div>
      ) : (
        <div className="p-2">
          {userRoles.map((role) => (
            <label 
              key={role} 
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => onRoleToggle(role)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                aria-describedby={`role-${role.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <span 
                id={`role-${role.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-sm text-gray-700 flex-1 font-medium"
                title={role}
              >
                {role}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  </FilterDropdown>
);

// Pagination component 
const Pagination = ({ pagination, paginationInfo, onPageChange }) => {
  const { currentPage } = pagination;
  const { totalPages } = paginationInfo;
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        aria-label="Go to previous page"
      >
        <span>←</span>
        Previous
      </button>
      
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-400">
                {page}
              </span>
            );
          }
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-sm font-medium' 
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300'
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </nav>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        aria-label="Go to next page"
      >
        Next
        <span>→</span>
      </button>
    </div>
  );
};

// Empty state component
const EmptyState = ({ hasActiveFilters, onClearFilters }) => (
  <tr>
    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
      <div className="flex flex-col items-center gap-3">
        <Search className="w-8 h-8 text-gray-300" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">No audit logs found</p>
          <p className="text-sm">
            {hasActiveFilters 
              ? 'Try adjusting your filters to see more results.'
              : 'There are no audit logs to display at this time.'
            }
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-blue-600 hover:text-blue-700 text-sm underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </td>
  </tr>
);

// Table row component - Fixed to match table-fixed layout
const TableRow = ({ log, index }) => (
  <tr key={log.id || index} className="hover:bg-gray-50 focus-within:bg-gray-50 transition-colors group">
    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
      <div className="truncate" title={log.logId || log.id}>
        {log.logId || log.id}
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-700">
      <RoleBadge role={log.userRole} userName={log.userName} />
    </td>
    <td className="px-6 py-4 text-sm text-gray-700">
      <div className="break-words pr-2" title={log.action}>
        {log.action}
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">
      <div className="flex flex-col">
        <time className="font-medium text-gray-900" dateTime={log.timestamp}>
          {log.time}
        </time>
        <time className="text-xs text-gray-400" dateTime={log.timestamp}>
          {log.date}
        </time>
      </div>
    </td>
  </tr>
);

// Main AuditTable Component
const AuditTable = ({ 
  filteredLogs = [], 
  pagination = { currentPage: 1 }, 
  paginationInfo = { totalLogs: 0, totalPages: 1, startIndex: 0, endIndex: 0 }, 
  onPageChange = () => {}, 
  hasActiveFilters = false, 
  onClearFilters = () => {},
  selectedFilters = { userRole: [], timeStamp: null },
  onFilterChange = () => {},
  userRoles = []
}) => {
  // Refs for dropdown management
  const userRoleDropdownRef = useRef(null);
  const datePickerRef = useRef(null);
  
  // Local state for dropdowns
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(selectedFilters.timeStamp || '');

  // Update selectedDate when filters change externally
  useEffect(() => {
    setSelectedDate(selectedFilters.timeStamp || '');
  }, [selectedFilters.timeStamp]);

  // Close dropdowns when clicking outside
  useOutsideClick([userRoleDropdownRef, datePickerRef], () => {
    setShowUserRoleDropdown(false);
    setShowDatePicker(false);
  });

  // Event handlers
  const handleUserRoleToggle = (role) => {
    console.log('🔄 Toggling role filter:', role);
    
    const isCurrentlySelected = selectedFilters.userRole.includes(role);
    const newUserRoles = isCurrentlySelected
      ? selectedFilters.userRole.filter(r => r !== role)
      : [...selectedFilters.userRole, role];
    
    console.log('✅ New role selection:', newUserRoles);
    
    onFilterChange({
      ...selectedFilters,
      userRole: newUserRoles
    });
  };

  const handleClearRoleSelection = () => {
    console.log('🧹 Clearing all role selections');
    onFilterChange({ 
      ...selectedFilters, 
      userRole: [] 
    });
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    console.log('📅 Date input changed:', date);
    setSelectedDate(date);
  };

  const handleApplyDateFilter = () => {
    console.log('✅ Applying date filter:', selectedDate);
    onFilterChange({
      ...selectedFilters,
      timeStamp: selectedDate || null
    });
    setShowDatePicker(false);
  };

  const handleClearDateFilter = () => {
    console.log('🧹 Clearing date filter');
    setSelectedDate('');
    onFilterChange({
      ...selectedFilters,
      timeStamp: null
    });
    setShowDatePicker(false);
  };

  const toggleUserRoleDropdown = () => {
    setShowUserRoleDropdown(!showUserRoleDropdown);
    setShowDatePicker(false);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    setShowUserRoleDropdown(false);
  };

  // Memoize sorted user roles
  const sortedUserRoles = useMemo(() => {
    return [...userRoles].sort();
  }, [userRoles]);

  return (
    <>
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Audit logs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Log ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <RoleFilter
                  userRoles={sortedUserRoles}
                  selectedRoles={selectedFilters.userRole}
                  onRoleToggle={handleUserRoleToggle}
                  onClearSelection={handleClearRoleSelection}
                  isOpen={showUserRoleDropdown}
                  onToggle={toggleUserRoleDropdown}
                  dropdownRef={userRoleDropdownRef}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  onApply={handleApplyDateFilter}
                  onClear={handleClearDateFilter}
                  isOpen={showDatePicker}
                  onToggle={toggleDatePicker}
                  dropdownRef={datePickerRef}
                />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <EmptyState 
                hasActiveFilters={hasActiveFilters}
                onClearFilters={onClearFilters}
              />
            ) : (
              filteredLogs.map((log, index) => (
                <TableRow key={log.id || index} log={log} index={index} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        paginationInfo={paginationInfo}
        onPageChange={onPageChange}
      />

      {/* Pagination Info */}
      {paginationInfo.totalLogs > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between" role="status" aria-live="polite">
          <span>
            Showing {paginationInfo.startIndex} to {paginationInfo.endIndex} of {paginationInfo.totalLogs} results
          </span>
          {paginationInfo.totalPages > 1 && (
            <span className="hidden sm:inline">
              Page {pagination.currentPage} of {paginationInfo.totalPages}
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default AuditTable;