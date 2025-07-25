import React from 'react';
import { X, Clock, User, AlertTriangle, CheckCircle, Send, Globe, MessageCircle } from 'lucide-react';

const BroadcastDetails = ({ broadcast, isOpen, onClose }) => {
  if (!isOpen || !broadcast) return null;

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return {
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Sent'
        };
      case 'pending':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: <Clock className="w-4 h-4" />,
          text: 'Pending'
        };
      case 'failed':
        return {
          color: 'text-red-600 bg-red-100',
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Failed'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: <Clock className="w-4 h-4" />,
          text: status || 'Unknown'
        };
    }
  };

  // Get alert type color
  const getAlertTypeColor = (alertType) => {
    switch (alertType?.toLowerCase()) {
      case 'red alert':
        return 'bg-red-500 text-white';
      case 'yellow alert':
        return 'bg-yellow-500 text-white';
      case 'green alert':
        return 'bg-green-500 text-white';
      case 'blue alert':
        return 'bg-blue-500 text-white';
      case 'weather':
        return 'bg-sky-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get region name from lgaId
  const getRegionName = (lgaId) => {
    const regions = {
      'ALL': 'All Regions',
      '01JZJPZFSFDFERZQQEYQ39WZP3': 'Lagos',
      '01JZJPZFSFDFERZQQEYQ39WZP4': 'Abuja',
      '01JZJPZFSFDFERZQQEYQ39WZP5': 'Kano',
      '01JZJPZFSFDFERZQQEYQ39WZP6': 'Ogun',
      '01JZJPZFSFDFERZQQEYQ39WZP7': 'Rivers'
    };
    return regions[lgaId] || lgaId || 'All Regions';
  };

  const statusDisplay = getStatusDisplay(broadcast.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Broadcast Details</h2>
              <p className="text-sm text-gray-600">View complete broadcast information</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-80 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {/* Title and Alert Type */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Title</label>
                <h3 className="text-xl font-semibold text-gray-900">
                  {broadcast.title || 'Untitled Broadcast'}
                </h3>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Alert Type</label>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getAlertTypeColor(broadcast.alertType)}`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {broadcast.alertType || 'N/A'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                    {statusDisplay.icon}
                    <span className="ml-2">{statusDisplay.text}</span>
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Target Region</label>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <Globe className="w-4 h-4 mr-2" />
                    {getRegionName(broadcast.lgaId)}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            {broadcast.subtitle && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Subtitle</label>
                <p className="text-gray-700 text-lg">{broadcast.subtitle}</p>
              </div>
            )}

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Message</label>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {broadcast.body || 'No message content available.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Creator Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Created By:</span>
                      <p className="font-medium text-gray-900">{broadcast.createdBy || 'System'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Date Created:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(broadcast.dateCreated || broadcast.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional metadata if available */}
                {(broadcast.updatedAt || broadcast.lastModified) && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Updated
                    </h4>
                    <p className="font-medium text-gray-900">
                      {formatDate(broadcast.updatedAt || broadcast.lastModified)}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Broadcast Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Broadcast ID:</span>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {broadcast.id || broadcast._id || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">LGA ID:</span>
                      <p className="font-mono text-sm text-gray-900">
                        {broadcast.lgaId || 'ALL'}
                      </p>
                    </div>
                    {broadcast.category && (
                      <div>
                        <span className="text-sm text-gray-500">Category:</span>
                        <p className="font-medium text-gray-900">{broadcast.category}</p>
                      </div>
                    )}
                    {broadcast.priority && (
                      <div>
                        <span className="text-sm text-gray-500">Priority:</span>
                        <p className="font-medium text-gray-900">{broadcast.priority}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipients or Target Info */}
                {(broadcast.recipients || broadcast.targetAudience) && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Target Audience</h4>
                    <p className="text-gray-700">
                      {broadcast.recipients || broadcast.targetAudience}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {(broadcast.tags || broadcast.keywords || broadcast.location) && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-medium text-gray-900 mb-3">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {broadcast.tags && (
                    <div>
                      <span className="text-sm text-gray-500">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {broadcast.tags.split(',').map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {broadcast.location && (
                    <div>
                      <span className="text-sm text-gray-500">Location:</span>
                      <p className="font-medium text-gray-900">{broadcast.location}</p>
                    </div>
                  )}
                  {broadcast.keywords && (
                    <div>
                      <span className="text-sm text-gray-500">Keywords:</span>
                      <p className="text-gray-700">{broadcast.keywords}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics (if available) */}
            {(broadcast.deliveredCount || broadcast.readCount || broadcast.failedCount) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {broadcast.deliveredCount !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{broadcast.deliveredCount}</div>
                      <div className="text-sm text-gray-600">Delivered</div>
                    </div>
                  )}
                  {broadcast.readCount !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{broadcast.readCount}</div>
                      <div className="text-sm text-gray-600">Read</div>
                    </div>
                  )}
                  {broadcast.failedCount !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{broadcast.failedCount}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Raw Data (for debugging - can be removed in production) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="bg-gray-50 rounded-lg border">
                <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  Raw Data (Debug)
                </summary>
                <div className="p-4 pt-0">
                  <pre className="text-xs text-gray-600 overflow-auto bg-white p-3 rounded border max-h-60">
                    {JSON.stringify(broadcast, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastDetails;