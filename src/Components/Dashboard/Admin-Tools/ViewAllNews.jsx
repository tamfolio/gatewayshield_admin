import React, { useState } from "react";
import { Search, ChevronDown, Edit, Trash2, X } from "lucide-react";

const ViewAllNews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    author: "John Doe",
    date: "Today",
    status: "Published"
  });

  // Sample news data
  const [newsArticles] = useState([
    {
      id: 1,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Oct 10, 2024",
      author: "John Doe",
      status: "Published",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Aug 2, 2024",
      author: "John Doe",
      status: "Draft",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Jul 28, 2024",
      author: "John Doe",
      status: "Draft",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 4,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Sep 4, 2024",
      author: "John Doe",
      status: "Published",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 5,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Jan 18, 2024",
      author: "John Doe",
      status: "Published",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 6,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Jan 14, 2024",
      author: "John Doe",
      status: "Draft",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 7,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Dec 10, 2024",
      author: "John Doe",
      status: "Published",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 8,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Aug 16, 2024",
      author: "John Doe",
      status: "Draft",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 9,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Feb 16, 2024",
      author: "John Doe",
      status: "Published",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 10,
      title: "Heading Title",
      subtitle: "Subheading goes here...",
      dateCreated: "Dec 16, 2024",
      author: "John Doe",
      status: "Draft",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const removeFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: ""
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      author: "",
      date: "",
      status: ""
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = !filters.author || article.author === filters.author;
    const matchesStatus = !filters.status || article.status === filters.status;
    return matchesSearch && matchesAuthor && matchesStatus;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'dateCreated') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = sortedArticles.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">All News</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {filteredArticles.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex items-center space-x-2 mb-4">
        {filters.author && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            {filters.author}
            <button
              onClick={() => removeFilter('author')}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {filters.date && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            {filters.date}
            <button
              onClick={() => removeFilter('date')}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {filters.status && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            {filters.status}
            <button
              onClick={() => removeFilter('status')}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {(filters.author || filters.date || filters.status) && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-blue-600">{getSortIcon('title')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dateCreated')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date Created</span>
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-blue-600">{getSortIcon('dateCreated')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('author')}
              >
                <div className="flex items-center space-x-1">
                  <span>Author</span>
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-blue-600">{getSortIcon('author')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-blue-600">{getSortIcon('status')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={article.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {article.subtitle}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {article.dateCreated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {article.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    article.status === 'Published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
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
        <button
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
          Previous
        </button>
        
        <div className="flex items-center space-x-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}
          
          {totalPages > 5 && (
            <>
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
              <button
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg"
                onClick={() => setCurrentPage(8)}
              >
                8
              </button>
              <button
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg"
                onClick={() => setCurrentPage(9)}
              >
                9
              </button>
              <button
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg"
                onClick={() => setCurrentPage(10)}
              >
                10
              </button>
            </>
          )}
        </div>
        
        <button
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronDown className="h-4 w-4 ml-1 -rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default ViewAllNews;