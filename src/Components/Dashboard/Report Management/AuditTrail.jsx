import React from 'react';

const AuditTrailSection = () => {
  const auditData = [
    {
      id: 1,
      user: "John Doe",
      role: "Police Station",
      action: "Changed status to 'Rejected'",
      timestamp: "23:00\nJan 4, 2025"
    },
    {
      id: 2,
      user: "John Doe",
      role: "Comm. Centre Agent",
      action: "Changed status to 'Assigned to Station'",
      timestamp: "23:00\nJan 4, 2025"
    },
    {
      id: 3,
      user: "John Doe",
      role: "Police Station",
      action: "Changed status to 'In Progress'",
      timestamp: "23:00\nJan 4, 2025"
    },
    {
      id: 4,
      user: "John Doe",
      role: "Comm. Centre Agent",
      action: "Changed status to 'Treated'",
      timestamp: "23:00\nJan 4, 2025"
    },
    {
      id: 5,
      user: "John Doe",
      role: "Citizen",
      action: "Left 5 Star review on 'xxx'",
      timestamp: "23:00\nJan 4, 2025"
    },
    {
      id: 6,
      user: "John Doe",
      role: "Police Station",
      action: "Changed status to 'Treated'",
      timestamp: "23:00\nJan 4, 2025"
    },
    {
      id: 7,
      user: "John Doe",
      role: "Comm. Centre Agent",
      action: "Changed status to 'In Progress'",
      timestamp: "23:00\nJan 4, 2025"
    },
    {
      id: 8,
      user: "John Doe",
      role: "Admin",
      action: "Changed status to 'Rejected'",
      timestamp: "23:00\nJan 4, 2025"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-600">User</div>
        <div className="text-sm font-medium text-gray-600">Role</div>
        <div className="text-sm font-medium text-gray-600">Action</div>
        <div className="text-sm font-medium text-gray-600">Time Stamp</div>
      </div>

      {/* Table Body */}
      <div className="space-y-4">
        {auditData.map((item) => (
          <div key={item.id} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="text-sm text-gray-900 font-medium">{item.user}</div>
            <div className="text-sm text-gray-700">{item.role}</div>
            <div className="text-sm text-gray-700">{item.action}</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{item.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrailSection;