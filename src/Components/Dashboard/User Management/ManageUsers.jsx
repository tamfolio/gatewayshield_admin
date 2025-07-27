import React, { useEffect, useState } from "react";
import {
  Search,
  Upload,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { userRequest } from "../../../requestMethod";
import useAccessToken from "../../../Utils/useAccessToken";
import { Link } from "react-router-dom";

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [adminRoles, setAdminRoles] = useState([]);
  const [adminFormation, setAdminFormation] = useState([]);
  const [adminRanks, setAdminRanks] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    SWAT: false,
    Active: false,
    Inactive: false,
    Admin: false,
    "Inspector General": false,
  });
  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const token = useAccessToken();

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await userRequest(token).get("/admin/get/all");
        console.log("✅:", res.data.data.admin);
        const admins = res.data?.data?.admin || [];
        setAdminData(admins);
        setTotalItems(admins.length);
        setFilteredData(admins);
      } catch (err) {
        console.error("❌ Failed to fetch admins:", err);
        setError("Failed to fetch admins");
      } finally {
        setLoading(false);
      }
    };

    const fetchAdminRoles = async () => {
      try {
        const res = await userRequest(token).get("/options/adminRoles/all");
        setAdminRoles(res.data?.data?.adminRoles || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin roles:", err);
      }
    };

    const fetchAdminFormation = async () => {
      try {
        const res = await userRequest(token).get("/options/adminFormations/all");
        setAdminFormation(res.data?.data?.adminFormations || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin Formation:", err);
      }
    };

    const fetchAdminRanks = async () => {
      try {
        const res = await userRequest(token).get("/options/adminRanks/all");
        setAdminRanks(res.data?.data?.adminRanks || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin ranks:", err);
      }
    };

    if (token) {
      fetchAdmins();
      fetchAdminRoles();
      fetchAdminFormation();
      fetchAdminRanks();
    }
  }, [token]);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...adminData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getRankName(user.rankId).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getRoleName(user.roleId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filters
    const activeFilters = Object.entries(selectedFilters)
      .filter(([_, isActive]) => isActive)
      .map(([filter, _]) => filter);

    if (activeFilters.length > 0) {
      filtered = filtered.filter((user) => {
        const userRole = getRoleName(user.roleId);
        const userStatus = user.status;
        return activeFilters.some(filter => 
          userRole.includes(filter) || 
          userStatus === filter ||
          (filter === "Inspector General" && userRole.includes("Inspector"))
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "rank":
          return getRankName(a.rankId).localeCompare(getRankName(b.rankId));
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "role":
          return getRoleName(a.roleId).localeCompare(getRoleName(b.roleId));
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedFilters, sortBy, adminData, adminRoles, adminRanks, adminFormation]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const getStatusColor = (isActive) => {
    switch (isActive) {
      case 1:
        return "bg-green-50 text-green-700 border-green-200";
      case 0:
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getInitials = (firstName = "", lastName = "") =>
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  const getRandomColor = (id) => {
    const colors = [
      "#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F97316",
      "#F59E0B", "#84CC16", "#22C55E", "#10B981", "#06B6D4",
      "#0EA5E9", "#3B82F6"
    ];
    const index = id
      ? id.split("").map((char) => char.charCodeAt(0)).reduce((sum, val) => sum + val, 0) % colors.length
      : 0;
    return colors[index];
  };

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      SWAT: false,
      Active: false,
      Inactive: false,
      Admin: false,
      "Inspector General": false,
    });
    setSearchTerm("");
  };

  const getRankName = (rankId) => {
    const rank = adminRanks.find((rank) => rank.id === rankId);
    return rank ? rank.name : "N/A";
  };

  const getRoleName = (roleId) => {
    const role = adminRoles.find((role) => role.id === roleId);
    return role ? role.name : "N/A";
  };

  const getFormationName = (formationId) => {
    const formation = adminFormation.find((f) => f.id === formationId);
    return formation ? formation.name : "N/A";
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusUpdate = async (adminId, currentStatus) => {
    setUpdatingUserId(adminId);
    try {
      const newStatus = currentStatus === 1 ? false : true;
      
      await userRequest(token).patch("/admin/update/status", {
        adminId: adminId,
        isActive: newStatus
      });

      // Update the local state to reflect the change
      setAdminData(prevData => 
        prevData.map(user => 
          user.id === adminId 
            ? { ...user, isActive: newStatus ? 1 : 0 }
            : user
        )
      );

      // Also update filtered data
      setFilteredData(prevData => 
        prevData.map(user => 
          user.id === adminId 
            ? { ...user, isActive: newStatus ? 1 : 0 }
            : user
        )
      );

    } catch (err) {
      console.error("❌ Failed to update admin status:", err);
      setError("Failed to update admin status");
      // You might want to show a toast notification here
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(Boolean).length;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <span className="hover:text-gray-700 cursor-pointer">Dashboard</span>
        <span>›</span>
        <span className="hover:text-gray-700 cursor-pointer">User Management</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">Manage Users</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-500 mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">Filters:</span>
              
              {["SWAT", "Active", "Inactive", "Admin", "Inspector General"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedFilters[filter]
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
              
              {(activeFiltersCount > 0 || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {totalItems} user{totalItems !== 1 ? 's' : ''}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="rank">Sort by Rank</option>
              <option value="status">Sort by Status</option>
              <option value="role">Sort by Role</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Rank</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Formation</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === currentItems.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm"
                          style={{
                            backgroundColor: user.avatar ? "transparent" : getRandomColor(user.id),
                          }}
                        >
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            getInitials(user.firstName, user.lastName)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {`${user.firstName || ""} ${user.lastName || ""}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">
                        {getRankName(user.rankId)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{getRoleName(user.roleId)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          user.isActive
                        )}`}
                      >
                        {user.isActive === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {getFormationName(user.formationId)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(user.id, user.isActive)}
                          disabled={updatingUserId === user.id}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                            user.isActive === 1 
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                        >
                          {updatingUserId === user.id && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                          )}
                          {user.isActive === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Link to={`/dashboard/users/edit/${user.id}`}>
                            <Edit className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                          </Link>
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                          <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    {searchTerm || activeFiltersCount > 0 ? (
                      <div>
                        <p className="text-lg font-medium mb-2">No users found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">No users available</p>
                        <p className="text-sm">Get started by adding your first user</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePages().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;