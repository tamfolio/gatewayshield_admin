import React, { useState } from 'react';
import { Search, Upload, Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    SWAT: true,
    Pending: true,
    Admin: true,
    'Inspector General': true
  });

  const users = [
    {
      id: 1,
      name: 'Olivia Rhye',
      email: 'olivia@gmail.com',
      rank: 'Inspr. Gen. of Police',
      role: 'Admin',
      status: 'Pending',
      formation: 'SWAT',
      avatar: '👩‍🦰'
    },
    {
      id: 2,
      name: 'Phoenix Baker',
      email: 'phoenix@gmail.com',
      rank: 'Deputy Inspr. Gen. of Police',
      role: 'Command Centre Staff',
      status: 'Inactive',
      formation: 'COMMAND HQ',
      avatar: '👨‍🦱'
    },
    {
      id: 3,
      name: 'Lana Steiner',
      email: 'lana@gmail.com',
      rank: 'Asst. Inspr. Gen. of Police',
      role: 'Area Command',
      status: 'Active',
      formation: 'TASK FORCE',
      avatar: '👩‍🦳'
    },
    {
      id: 4,
      name: 'Demi Wilkinson',
      email: 'demi@gmail.com',
      rank: 'Commissioner of Police',
      role: 'Police Station Officer',
      status: 'Pending',
      formation: '16 PMF',
      avatar: '👩‍🦱'
    },
    {
      id: 5,
      name: 'Candice Wu',
      email: 'candice@gmail.com',
      rank: 'Deputy Comm. of Police',
      role: 'Guest',
      status: 'Active',
      formation: '71 PMF',
      avatar: '👩‍💼'
    },
    {
      id: 6,
      name: 'Natali Craig',
      email: 'natali@gmail.com',
      rank: 'Assistant Comm. of Police',
      role: 'Command Centre Admin',
      status: 'Inactive',
      formation: 'EOD',
      avatar: '👩‍🦰'
    },
    {
      id: 7,
      name: 'Drew Cano',
      email: 'drew@gmail.com',
      rank: 'Chief Superintendent of Police',
      role: 'Command Centre Staff',
      status: 'Active',
      formation: 'SWAT',
      avatar: '👨‍💼'
    },
    {
      id: 8,
      name: 'Orlando Diggs',
      email: 'orlando@gmail.com',
      rank: 'Superintendent of Police',
      role: 'Police Station',
      status: 'Active',
      formation: 'EOD',
      avatar: '👨‍🦲'
    },
    {
      id: 9,
      name: 'Andi Lane',
      email: 'andi@gmail.com',
      rank: 'Deputy Sup. of Police',
      role: 'Area Command',
      status: 'Active',
      formation: 'TASK FORCE',
      avatar: '👩‍🦱'
    },
    {
      id: 10,
      name: 'Kate Morrison',
      email: 'kate@gmail.com',
      rank: 'Assistant Sup. of Police',
      role: 'Guest',
      status: 'Active',
      formation: '16 PMF',
      avatar: '👩‍🦳'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      SWAT: false,
      Pending: false,
      Admin: false,
      'Inspector General': false
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 bg-white">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <span className="hover:text-gray-700 cursor-pointer">Dashboard</span>
        <span>›</span>
        <span className="hover:text-gray-700 cursor-pointer">User Management</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">Manage Users</span>
      </div>

      {/* Header with Buttons */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Team Members, Search and Sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Team members</h1>
          <span className="text-sm text-gray-500">100 users</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">⌘K</span>
          </div>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>Sort by</option>
            <option>Name</option>
            <option>Rank</option>
            <option>Status</option>
          </select>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <button className="px-3 py-1 rounded-full text-sm border bg-gray-50 border-gray-200 text-gray-700 flex items-center gap-1">
          SWAT
          <span className="text-gray-400">×</span>
        </button>
        <button className="px-3 py-1 rounded-full text-sm border bg-gray-50 border-gray-200 text-gray-700 flex items-center gap-1">
          Pending
          <span className="text-gray-400">×</span>
        </button>
        <button className="px-3 py-1 rounded-full text-sm border bg-gray-50 border-gray-200 text-gray-700 flex items-center gap-1">
          Admin
          <span className="text-gray-400">×</span>
        </button>
        <button className="px-3 py-1 rounded-full text-sm border bg-gray-50 border-gray-200 text-gray-700 flex items-center gap-1">
          Inspector General
          <span className="text-gray-400">×</span>
        </button>
        
        <button
          onClick={clearAllFilters}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Formation</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">{user.rank}</td>
                <td className="py-4 px-4 text-sm text-gray-900">{user.role}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">{user.formation}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Reset Password
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-400" />
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
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          Previous
        </button>
        
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-3 py-2 hover:bg-gray-100 rounded-lg">2</button>
          <button className="px-3 py-2 hover:bg-gray-100 rounded-lg">3</button>
          <span className="px-3 py-2 text-gray-500">...</span>
          <button className="px-3 py-2 hover:bg-gray-100 rounded-lg">8</button>
          <button className="px-3 py-2 hover:bg-gray-100 rounded-lg">9</button>
          <button className="px-3 py-2 hover:bg-gray-100 rounded-lg">10</button>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageUsers;