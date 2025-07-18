import React, { useState } from 'react';
import { Search, X, Edit2, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export default function BroadcastLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    joinDate: false,
    today: false,
    pending: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // mock data
  const broadcastData = [
    {
      id: 1,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Oct 10, 2024',
      createdBy: 'John Doe',
      status: 'Sent',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 2,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Aug 2, 2024',
      createdBy: 'John Doe',
      status: 'Pending',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 3,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Jul 26, 2024',
      createdBy: 'John Doe',
      status: 'Pending',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 4,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Sep 4, 2024',
      createdBy: 'John Doe',
      status: 'Failed',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 5,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Jan 10, 2024',
      createdBy: 'John Doe',
      status: 'Sent',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 6,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Jan 14, 2024',
      createdBy: 'John Doe',
      status: 'Sent',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 7,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Dec 10, 2024',
      createdBy: 'John Doe',
      status: 'Sent',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 8,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Aug 19, 2024',
      createdBy: 'John Doe',
      status: 'Sent',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 9,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Feb 16, 2024',
      createdBy: 'John Doe',
      status: 'Sent',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 10,
      title: 'Heading Title',
      subtitle: 'Subheading goes here...',
      alertType: 'John Doe',
      dateCreated: 'Dec 16, 2024',
      createdBy: 'John Doe',
      status: 'Sent',
      avatar: '/api/placeholder/32/32'
    }
  ];

  const handleFilterToggle = (filterName) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      joinDate: false,
      today: false,
      pending: false
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Broadcast Logs</h2>
            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              100
            </span>
          </div>
         
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
           
            {/* More options */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleFilterToggle('joinDate')}
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
              selectedFilters.joinDate
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Join Date
            {selectedFilters.joinDate && (
              <X className="w-3 h-3 ml-1" onClick={(e) => {
                e.stopPropagation();
                handleFilterToggle('joinDate');
              }} />
            )}
          </button>
         
          <button
            onClick={() => handleFilterToggle('today')}
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
              selectedFilters.today
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
            {selectedFilters.today && (
              <X className="w-3 h-3 ml-1" onClick={(e) => {
                e.stopPropagation();
                handleFilterToggle('today');
              }} />
            )}
          </button>
         
          <button
            onClick={() => handleFilterToggle('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
              selectedFilters.pending
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
            {selectedFilters.pending && (
              <X className="w-3 h-3 ml-1" onClick={(e) => {
                e.stopPropagation();
                handleFilterToggle('pending');
              }} />
            )}
          </button>
         
          {(selectedFilters.joinDate || selectedFilters.today || selectedFilters.pending) && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alert Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {broadcastData.map((broadcast) => (
              <tr key={broadcast.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {broadcast.title.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {broadcast.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {broadcast.subtitle}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {broadcast.alertType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {broadcast.dateCreated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {broadcast.createdBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(broadcast.status)}`}>
                    {broadcast.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
         
          <div className="flex items-center gap-1">
            {pageNumbers.slice(0, 5).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
         
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}