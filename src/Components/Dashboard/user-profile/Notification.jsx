import React, { useState } from 'react';

const Notification = ({ onClose }) => {
  const [notifications, setNotifications] = useState({
    unassignedTickets: {
      push: true,
      email: false
    },
    assignedTickets: {
      push: true,
      email: false
    },
    closedTickets: {
      push: false,
      email: false
    },
    adminUpdates: {
      push: false,
      email: false
    },
    closedTicketsSecond: {
      push: false,
      email: false
    }
  });

  const handleToggle = (category, type) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }));
  };

  const notificationSettings = [
    {
      id: 'unassignedTickets',
      title: 'Unassigned Tickets',
      description: 'These are notifications for updates on your reported incident.',
      push: notifications.unassignedTickets.push,
      email: notifications.unassignedTickets.email
    },
    {
      id: 'assignedTickets',
      title: 'Assigned Tickets',
      description: 'These are notifications to alert you of incidents happening within your area.',
      push: notifications.assignedTickets.push,
      email: notifications.assignedTickets.email
    },
    {
      id: 'closedTickets',
      title: 'Closed Tickets',
      description: 'These are notifications for posts on your profile, likes and other reactions to your posts, and more.',
      push: notifications.closedTickets.push,
      email: notifications.closedTickets.email
    },
    {
      id: 'adminUpdates',
      title: 'Admin Updates',
      description: 'These are notifications for posts on your profile, likes and other reactions to your posts, and more.',
      push: notifications.adminUpdates.push,
      email: notifications.adminUpdates.email
    },
    {
      id: 'closedTicketsSecond',
      title: 'Closed Tickets',
      description: 'These are notifications for posts on your profile, likes and other reactions to your posts, and more.',
      push: notifications.closedTicketsSecond.push,
      email: notifications.closedTicketsSecond.email
    }
  ];

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="flex gap-12">
      {/* Left Column - Notification Settings Header */}
      <div className="w-48 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Notification settings</h3>
        <p className="text-sm text-gray-500">
          We may still send you important notifications about your account outside of your notification settings.
        </p>
      </div>

      {/* Right Column - Notification Categories */}
      <div className="flex-1 max-w-2xl">
        <div className="space-y-8">
          {notificationSettings.map((setting, index) => (
            <div key={setting.id}>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {setting.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {setting.description}
                </p>
              </div>

              <div className="space-y-3">
                {/* Push Notifications */}
                <div className="flex items-center space-x-3">
                  <ToggleSwitch
                    enabled={setting.push}
                    onChange={() => handleToggle(setting.id, 'push')}
                  />
                  <span className="text-sm text-gray-700">Push</span>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center space-x-3">
                  <ToggleSwitch
                    enabled={setting.email}
                    onChange={() => handleToggle(setting.id, 'email')}
                  />
                  <span className="text-sm text-gray-700">Email</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-8">
          <button
            onClick={() => {
              console.log('Notification settings saved:', notifications);
              onClose && onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;