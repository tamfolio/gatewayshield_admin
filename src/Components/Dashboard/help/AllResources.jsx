import React, { useState } from 'react';
import { Search, ChevronDown, Download, Eye, Edit2 } from 'lucide-react';

const AllResources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  const resources = [
    {
      id: 1,
      title: 'Police Station',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Published',
      isToday: true,
      actions: ['Download', 'Unpublish']
    },
    {
      id: 2,
      title: 'Comm. Centre Agent',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Draft',
      isToday: true,
      actions: ['Download', 'Publish']
    },
    {
      id: 3,
      title: 'Police Station Officer',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Draft',
      isToday: false,
      actions: ['Download', 'Publish']
    },
    {
      id: 4,
      title: 'Comm. Centre Agent',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Published',
      isToday: false,
      actions: ['Download', 'Unpublish']
    },
    {
      id: 5,
      title: 'Citizen',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Published',
      isToday: true,
      actions: ['Download', 'Unpublish']
    },
    {
      id: 6,
      title: 'Police Station',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Draft',
      isToday: false,
      actions: ['Download', 'Publish']
    },
    {
      id: 7,
      title: 'Comm. Centre Agent',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Published',
      isToday: true,
      actions: ['Download', 'Unpublish']
    },
    {
      id: 8,
      title: 'Police Station Officer',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Draft',
      isToday: false,
      actions: ['Download', 'Publish']
    },
    {
      id: 9,
      title: 'Police Station Officer',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Published',
      isToday: true,
      actions: ['Download', 'Unpublish']
    },
    {
      id: 10,
      title: 'Police Station Officer',
      category: 'Category A',
      subCategory: 'Sub - Category A',
      submissionDate: 'Jan 4, 2025',
      status: 'Draft',
      isToday: false,
      actions: ['Download', 'Publish']
    }
  ];

  // Function to add filter
  const addFilter = (filterType, filterValue) => {
    const newFilter = { type: filterType, value: filterValue };
    if (!activeFilters.some(f => f.type === filterType && f.value === filterValue)) {
      setActiveFilters([...activeFilters, newFilter]);
    }
  };

  // Function to remove filter
  const removeFilter = (filterToRemove) => {
    setActiveFilters(activeFilters.filter(filter => 
      !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
    ));
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  // Filter resources based on active filters
  const filteredResources = resources.filter(resource => {
    // First apply search filter
    if (searchTerm && !resource.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Then apply active filters
    return activeFilters.every(filter => {
      switch (filter.type) {
        case 'date':
          return filter.value === 'today' ? resource.isToday : true;
        case 'status':
          return resource.status.toLowerCase() === filter.value.toLowerCase();
        case 'category':
          return resource.category === filter.value;
        default:
          return true;
      }
    });
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          All Resources
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-normal">
            {filteredResources.length}
          </span>
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
            >
              <option value="">Sort by</option>
              <option value="title">Title</option>
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => addFilter('date', 'today')}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
            >
              Today
            </button>
            <button
              onClick={() => addFilter('status', 'published')}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
            >
              Published
            </button>
            <button
              onClick={() => addFilter('status', 'draft')}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
            >
              Draft
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm text-gray-600">Active filters:</span>
          <div className="flex space-x-2">
            {activeFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => removeFilter(filter)}
                className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 flex items-center"
              >
                {filter.value === 'today' ? 'Today' : 
                 filter.value.charAt(0).toUpperCase() + filter.value.slice(1)}
                <span className="ml-1">×</span>
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 rounded-full text-sm bg-gray-800 text-white hover:bg-gray-900"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sub-Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {resource.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.subCategory}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.submissionDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      resource.status === 'Published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {resource.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      className={`text-xs px-2 py-1 rounded ${
                        resource.status === 'Published'
                          ? 'text-red-600 hover:text-red-800'
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {resource.status === 'Published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
          ← Previous
        </button>
        <div className="flex space-x-2">
          {[1, 2, 3, '...', 8, 9, 10].map((page, index) => (
            <button
              key={index}
              className={`px-3 py-1 text-sm rounded ${
                page === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
          Next →
        </button>
      </div>
    </div>
  );
};

export default AllResources;