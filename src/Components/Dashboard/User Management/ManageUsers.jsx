import React, { useEffect, useState, useRef } from "react";
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
  ChevronDown,
  Check,
} from "lucide-react";
import { userRequest } from "../../../requestMethod";
import useAccessToken from "../../../Utils/useAccessToken";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [adminRoles, setAdminRoles] = useState([]);
  const [adminFormation, setAdminFormation] = useState([]);
  const [adminRanks, setAdminRanks] = useState([]);

  // Updated filters structure for dropdown filters
  const [selectedFilters, setSelectedFilters] = useState({
    status: "",
    roleId: "",
    rankId: "",
    formationId: "",
  });

  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const token = useAccessToken();

  // Updated fetchAdmins to handle API filters
  const fetchAdmins = async (filters = {}) => {
    setLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append("status", filters.status);
      if (filters.roleId) queryParams.append("roleId", filters.roleId);
      if (filters.rankId) queryParams.append("rankId", filters.rankId);
      if (filters.formationId)
        queryParams.append("formationId", filters.formationId);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/admin/get/all?${queryString}`
        : "/admin/get/all";

      const res = await userRequest(token).get(endpoint);
      console.log("✅:", res.data.data.admins);
      const admins = res.data?.data?.admins || [];
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

  useEffect(() => {
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
        const res = await userRequest(token).get(
          "/options/adminFormations/all"
        );
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

  // Refetch when filters change
  useEffect(() => {
    if (token) {
      fetchAdmins(selectedFilters);
    }
  }, [selectedFilters, token]);

  // Apply search and sorting to already filtered data
  useEffect(() => {
    let filtered = [...adminData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.rankName || getRankName(user.rankId))
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.roleName || getRoleName(user.roleId))
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.formationName || getFormationName(user.formationId))
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.badgeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          return nameA.localeCompare(nameB);
        case "rank":
          const rankA = a.rankName || getRankName(a.rankId);
          const rankB = b.rankName || getRankName(b.rankId);
          return rankA.localeCompare(rankB);
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "role":
          const roleA = a.roleName || getRoleName(a.roleId);
          const roleB = b.roleName || getRoleName(b.roleId);
          return roleA.localeCompare(roleB);
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [searchTerm, sortBy, adminData, adminRoles, adminRanks, adminFormation]);

  const adminRolesList = useSelector((state) => state.user?.adminRoles);
  console.log(adminRolesList);
  const userRoleId = useSelector(
    (state) => state.user?.currentUser?.admin?.roleId
  );
  const userName = useSelector((state) => state.user?.currentUser?.admin);

  const getCurrentUserRole = () => {
    if (!adminRolesList || !userRoleId) return null;
    const role = adminRolesList.find((role) => role.id === userRoleId);
    return role ? role.name : null;
  };

  const currentUserRole = getCurrentUserRole();
  console.log("Current User Role:", currentUserRole);

  const isCommandCentreSupervisor =
    currentUserRole === "Command Centre supervisor";

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "deactivated":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getInitials = (firstName = "", lastName = "") =>
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  const getRandomColor = (id) => {
    const colors = [
      "#6366F1",
      "#8B5CF6",
      "#EC4899",
      "#EF4444",
      "#F97316",
      "#F59E0B",
      "#84CC16",
      "#22C55E",
      "#10B981",
      "#06B6D4",
      "#0EA5E9",
      "#3B82F6",
    ];
    const index = id
      ? id
          .split("")
          .map((char) => char.charCodeAt(0))
          .reduce((sum, val) => sum + val, 0) % colors.length
      : 0;
    return colors[index];
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      status: "",
      roleId: "",
      rankId: "",
      formationId: "",
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

  // Get unique values for filters
  const getUniqueFormations = () => {
    const formations = adminData.map(
      (user) => user.formationName || getFormationName(user.formationId)
    );
    return [...new Set(formations)].filter((f) => f !== "N/A").sort();
  };

  const getUniqueRoles = () => {
    const roles = adminData.map(
      (user) => user.roleName || getRoleName(user.roleId)
    );
    return [...new Set(roles)].filter((r) => r !== "N/A").sort();
  };

  const getUniqueRanks = () => {
    const ranks = adminData.map(
      (user) => user.rankName || getRankName(user.rankId)
    );
    return [...new Set(ranks)].filter((r) => r !== "N/A").sort();
  };

  // Filter handlers
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const toggleFilter = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce(
      (count, filters) => count + filters.length,
      0
    );
  };

  // Filter Dropdown Component
  const FilterDropdown = ({ title, filterType, options, isOpen }) => (
    <div
      className="relative"
      ref={(el) => (dropdownRefs.current[filterType] = el)}
    >
      <button
        onClick={() => toggleDropdown(filterType)}
        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          selectedFilters[filterType].length > 0
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "text-gray-700 hover:bg-gray-50 border border-transparent"
        }`}
      >
        {title}
        {selectedFilters[filterType].length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
            {selectedFilters[filterType].length}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters[filterType].includes(option)}
                  onChange={() => toggleFilter(filterType, option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">{option}</span>
                {selectedFilters[filterType].includes(option) && (
                  <Check className="w-3 h-3 text-blue-600 ml-auto" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (adminId, currentStatus) => {
    setUpdatingUserId(adminId);
    try {
      const newStatus = currentStatus === 1 ? false : true;

      await userRequest(token).patch("/admin/update/status", {
        adminId: adminId,
        isActive: newStatus,
      });

      // Refetch data to get updated status
      fetchAdmins(selectedFilters);
    } catch (err) {
      console.error("❌ Failed to update admin status:", err);
      setError("Failed to update admin status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages <= 1) return [1];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (value) => value !== ""
  );

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
        <span className="hover:text-gray-700 cursor-pointer">
          User Management
        </span>
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
            <Link to="/dashboard/users/add?tab=Multiple User">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
            </Link>
            <Link to="/dashboard/users/add">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">
                Filters:
              </span>
            </div>

            {/* Status Filter */}
            <select
              value={selectedFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="deactivated">Deactivated</option>
            </select>

            {/* Role Filter */}
            {!isCommandCentreSupervisor && (
              <select
                value={selectedFilters.roleId}
                onChange={(e) => handleFilterChange("roleId", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {adminRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}

            {/* Rank Filter */}
            <select
              value={selectedFilters.rankId}
              onChange={(e) => handleFilterChange("rankId", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ranks</option>
              {adminRanks.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.name}
                </option>
              ))}
            </select>

            {/* Formation Filter */}
            <select
              value={selectedFilters.formationId}
              onChange={(e) =>
                handleFilterChange("formationId", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Formations</option>
              {adminFormation.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(hasActiveFilters || searchTerm) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {/* Results Count and Sort */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {totalItems} user{totalItems !== 1 ? "s" : ""} found
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 w-80">
                  Name
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 w-32">
                  Rank
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 w-40">
                  Role
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 w-28">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 w-40">
                  Formation
                </th>
                <th className="text-right py-4 px-6 font-semibold text-gray-900 w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === currentItems.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm flex-shrink-0"
                          style={{
                            backgroundColor: user.avatar
                              ? "transparent"
                              : getRandomColor(user.id),
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
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate">
                            {`${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim()}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900 truncate block">
                        {getRankName(user.rankId)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900 truncate block">
                        {getRoleName(user.roleId)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status?.charAt(0).toUpperCase() +
                          user.status?.slice(1) || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900 truncate block">
                        {getFormationName(user.formationId)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {user.status?.toLowerCase() === "active" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(user.id, user.status)
                            }
                            disabled={updatingUserId === user.id}
                            className="px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 whitespace-nowrap"
                          >
                            {updatingUserId === user.id && (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                            )}
                            Deactivate
                          </button>
                        )}
                        {user.status?.toLowerCase() === "deactivated" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(user.id, user.status)
                            }
                            disabled={updatingUserId === user.id}
                            className="px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 whitespace-nowrap"
                          >
                            {updatingUserId === user.id && (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                            )}
                            Activate
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                          <Link to={`/dashboard/users/edit/${user.id}`}>
                            <Edit className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                          </Link>
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group flex-shrink-0">
                          <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    {searchTerm || hasActiveFilters ? (
                      <div>
                        <p className="text-lg font-medium mb-2">
                          No users found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">
                          No users available
                        </p>
                        <p className="text-sm">
                          Get started by adding your first user
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
