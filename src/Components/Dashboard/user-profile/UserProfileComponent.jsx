import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { FiUser } from 'react-icons/fi';
import { PiSignOutThin } from 'react-icons/pi';
import UserProfile from './user-profile/UserProfile';
import SignOut from '../../Auth/SignOut';

const UserProfileComponent = ({ userName, getRoleDisplayName }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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

  const handleMenuClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleViewProfile = () => {
    setShowUserProfile(true);
    setShowDropdown(false);
  };

  const handleSignOut = () => {
    setShowSignOut(true);
    setShowDropdown(false);
  };

  const closeUserProfile = () => {
    setShowUserProfile(false);
  };

  const closeSignOut = () => {
    setShowSignOut(false);
  };

  return (
    <>
      <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0 relative">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName?.firstName} {userName?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {getRoleDisplayName && (typeof getRoleDisplayName === 'function' ? getRoleDisplayName() : getRoleDisplayName)}
            </p>
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

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile 
          onClose={closeUserProfile}
          userName={userName}
        />
      )}

      {/* Sign Out Modal */}
      {showSignOut && (
        <SignOut 
          onClose={closeSignOut}
        />
      )}
    </>
  );
};

export default UserProfileComponent;