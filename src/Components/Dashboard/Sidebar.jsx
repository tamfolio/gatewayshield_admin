import React, { useState } from "react";
import {
  Shield,
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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    "User Management": false,
    "Report Management": false,
  });

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    {
      name: "User Management",
      icon: Users,
      path: "/users",
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
      path: "/reports",
      hasSubmenu: true,
      submenu: [
        { name: "SOS", path: "/dashboard/reports/sos" },
        { name: "General", path: "/dashboard/reports/general" },
      ],
    },
    { name: "Crime Map", icon: MapPin, path: "/dashboard/crime-map" },
    {
      name: "Admin Tools",
      icon: Settings,
      path: "/admin",
      hasSubmenu: true,
      submenu: [
        { name: "News", path: "/dashboard/admin/news" },
        { name: "Emergency Broadcast", path: "/dashboard/reports/emergency-broadcast" },
        { name: "Community Hub", path: "/dashboard/reports/Community-Hub" },
      ],
    },
    { name: "Feedback Hub", icon: MessageSquare, path: "/dashboard/feedback" },
    { name: "Audit Logs", icon: FileSearch, path: "/audit" },
  ];

  const bottomItems = [
    { name: "System Settings", icon: Settings, path: "/settings" },
    { name: "Help", icon: HelpCircle, path: "/help" },
  ];

  const isPathActive = (path) => location.pathname === path;
  const isParentActive = (submenu) =>
    submenu.some((item) => isPathActive(item.path));

  return (
    <div className="w-64 bg-white h-screen flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <img src="/assets/Logomark.svg" alt="" />
          <span className="font-semibold text-gray-900 text-lg">
            Gateway Shield
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className="px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
                      className={`w-5 h-5 ${
                        isParentRouteActive ? "text-blue-700" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    } ${
                      isParentRouteActive ? "text-blue-700" : "text-gray-500"
                    }`}
                  />
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-blue-700" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
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
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          isSubActive
                            ? "bg-blue-100 text-blue-700 border-l-2 border-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-medium">{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200">
        <div className="px-4 py-4 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = isPathActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Olivia Rhye
              </p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
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
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
