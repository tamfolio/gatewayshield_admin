import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  LayoutDashboard,
  Users,
  FileText,
  MapPin,
  Settings,
  MessageSquare,
  FileSearch,
  HelpCircle,
  User,
  ChevronDown,
  UserPlus,
  UserCheck,
  Newspaper,
  Radio,
  Users2,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { FiUser } from 'react-icons/fi';
import { PiSignOutThin } from 'react-icons/pi';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

const Sidebar = () => {
  const adminRolesList = useSelector((state) => state.user?.adminRoles);
  const userRoleId = useSelector((state) => state.user?.currentUser?.admin?.roleId);
  const userName = useSelector((state) => state.user?.currentUser?.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log(userName)
  
  // Get the current user's role name by matching roleId with adminRoles
  const getCurrentUserRole = () => {
    if (!adminRolesList || !userRoleId) return null;
    const role = adminRolesList.find(role => role.id === userRoleId);
    return role ? role.name : null;
  };

  const currentUserRole = getCurrentUserRole();
  console.log('Current User Role:', currentUserRole);

  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    "User Management": false,
    "Report Management": false,
    "Admin Tools": false,
  });

  // User dropdown states
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-expand sections based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedSections = { ...expandedSections };
    
    if (currentPath.includes('/dashboard/users/')) {
      newExpandedSections["User Management"] = true;
    }
    if (currentPath.includes('/dashboard/reports/')) {
      newExpandedSections["Report Management"] = true;
    }
    if (currentPath.includes('/dashboard/admin/')) {
      newExpandedSections["Admin Tools"] = true;
    }
    
    setExpandedSections(newExpandedSections);
  }, [location.pathname]);

  // Define role permissions
  const rolePermissions = {
    "Super Admin": ["dashboard", "users", "reports", "crime-map", "admin", "feedback", "audit", "settings", "help"],
    "Admin": ["dashboard", "users", "reports", "crime-map", "admin", "feedback", "audit", "settings", "help"],
    "Police Station": ["dashboard", "users", "reports", "crime-map", "feedback", "settings", "help"],
    "Command Centre Agent": ["dashboard", "reports", "crime-map"],
    "Command Centre supervisor": ["dashboard", "reports", "crime-map", "feedback", "audit"]
  };

  // Get allowed routes for current user
  const getAllowedRoutes = () => {
    if (!currentUserRole) return [];
    return rolePermissions[currentUserRole] || [];
  };

  const allowedRoutes = getAllowedRoutes();

  // Check if a route is allowed for current user
  const isRouteAllowed = (routeKey) => {
    return allowedRoutes.includes(routeKey);
  };

  const allMenuItems = [
    { 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      path: "/dashboard", 
      routeKey: "dashboard" 
    },
    {
      name: "User Management",
      icon: Users,
      path: "/dashboard/users",
      routeKey: "users",
      hasSubmenu: true,
      submenu: [
        { name: "Add Users", icon: UserPlus, path: "/dashboard/users/add" },
        {
          name: "Manage Users",
          icon: UserCheck,
          path: "/dashboard/users/manage",
        },
      ],
    },
    {
      name: "Report Management",
      icon: FileText,
      path: "/dashboard/reports",
      routeKey: "reports",
      hasSubmenu: true,
      submenu: [
        { name: "SOS", path: "/dashboard/reports/sos" },
        { name: "General", path: "/dashboard/reports/general" },
      ],
    },
    { 
      name: "Crime Map", 
      icon: MapPin, 
      path: "/dashboard/crime-map", 
      routeKey: "crime-map" 
    },
    {
      name: "Admin Tools",
      icon: Settings,
      path: "/dashboard/admin",
      routeKey: "admin",
      hasSubmenu: true,
      submenu: [
        { name: "News", icon: Newspaper, path: "/dashboard/admin/news" },
        { name: "Emergency Broadcast", icon: Radio, path: "/dashboard/admin/emergency-broadcast" },
      ],
    },
    { 
      name: "Feedback Hub", 
      icon: MessageSquare, 
      path: "/dashboard/feedback", 
      routeKey: "feedback" 
    },
    { 
      name: "Audit Logs", 
      icon: FileSearch, 
      path: "/dashboard/audit", 
      routeKey: "audit" 
    },
  ];

  const allBottomItems = [
    { 
      name: "System Settings", 
      icon: Settings, 
      path: "/dashboard/settings", 
      routeKey: "settings" 
    },
    { 
      name: "Help", 
      icon: HelpCircle, 
      path: "/dashboard/help", 
      routeKey: "help" 
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => isRouteAllowed(item.routeKey));
  const bottomItems = allBottomItems.filter(item => isRouteAllowed(item.routeKey));

  const isPathActive = (path) => location.pathname === path;
  const isParentActive = (submenu) =>
    submenu.some((item) => isPathActive(item.path));

  const handleLinkClick = () => {
    // Close mobile menu when link is clicked
    setIsOpen(false);
  };

  // Display role information in user section
  const getRoleDisplayName = () => {
    return currentUserRole || "Unknown Role";
  };

  // User dropdown handlers
  const handleMenuClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleViewProfile = () => {
    navigate('/dashboard/profile');
    setShowDropdown(false);
  };

  const handleSignOut = async () => {
    setShowDropdown(false);
    
    try {
      // Get token from localStorage or Redux store
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      // Make API call to logout endpoint
      const response = await fetch('https://admin-api.thegatewayshield.com/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('persist:root'); // Redux persist
        sessionStorage.clear();
        
        // Clear any cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        toast.success("Signed out successfully!");
        
        // Navigate to login page
        navigate("/");
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }
      
    } catch (err) {
      console.error("Logout Error:", err?.message || err);
      toast.error(err?.message || "Failed to sign out");
      
      // Even if API call fails, clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    }
  };

  const closeUserProfile = () => {
    setShowUserProfile(false);
  };

  const closeSignOut = () => {
    setShowSignOut(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white h-screen flex flex-col border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-gray-900 text-lg">
              Gateway Shield
            </span>
          </div>
        </div>

        {/* Search - Only show if user has access to multiple features */}
        {menuItems.length > 2 && (
          <div className="p-4 flex-shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-16 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 min-h-0 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isPathActive(item.path);
              const isParentRouteActive =
                item.hasSubmenu && isParentActive(item.submenu);
              const isExpanded = expandedSections[item.name];

              return (
                <div key={item.name}>
                  {item.hasSubmenu ? (
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          [item.name]: !prev[item.name],
                        }))
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        isParentRouteActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            isParentRouteActive ? "text-blue-700" : "text-gray-500"
                          }`}
                        />
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        } ${
                          isParentRouteActive ? "text-blue-700" : "text-gray-500"
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${
                          isActive ? "text-blue-700" : "text-gray-500"
                        }`}
                      />
                      <span className="font-medium truncate">{item.name}</span>
                    </Link>
                  )}

                  {item.hasSubmenu && isExpanded && (
                    <div className="pl-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = isPathActive(subItem.path);

                        return (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            onClick={handleLinkClick}
                            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                              isSubActive
                                ? "bg-blue-100 text-blue-700 border-l-2 border-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <span className="font-medium truncate">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom Items */}
        {bottomItems.length > 0 && (
          <div className="border-t border-gray-200 flex-shrink-0">
            <div className="px-4 py-4 space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-blue-700" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* User Profile with Dropdown */}
        <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0 relative">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName?.firstName} {userName?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{getRoleDisplayName()}</p>
            </div>
            <button 
              ref={buttonRef}
              onClick={handleMenuClick}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1 rounded transition-colors relative"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div 
              ref={dropdownRef}
              className="absolute right-4 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-50"
            >
              <button
                onClick={handleViewProfile}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <FiUser className="w-4 h-4" />
                <span>View Profile</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <PiSignOutThin className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;