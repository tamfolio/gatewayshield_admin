import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import UserProfile from './UserProfile';
import EditPassword from './EditPassword';
import Notification from './Notification';

const UserHub = ({ onClose, userName }) => {
  const [activeTab, setActiveTab] = useState('Profile');

  const tabs = [
    { id: 'Profile', label: 'Profile', component: UserProfile },
    { id: 'EditPassword', label: 'Edit Password', component: EditPassword },
    { id: 'Notification', label: 'Notification', component: Notification }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <span>Dashboard</span> <span className="mx-2">›</span>
          <span>Profile Management</span> <span className="mx-2">›</span>
          <span>Add Users</span>
        </nav>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="inline-flex bg-white rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-300 text-black shadow-sm'
                    : 'text-black hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {ActiveComponent && (
            <ActiveComponent userName={userName} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHub;