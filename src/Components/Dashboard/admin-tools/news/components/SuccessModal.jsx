import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, type, onRedirectToDashboard, onViewAllNews }) => {
  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'published':
        return {
          title: 'News Published Successfully',
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          iconBg: 'bg-green-100'
        };
      case 'updated':
        return {
          title: 'News Updated Successfully',
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          iconBg: 'bg-green-100'
        };
      case 'draft':
        return {
          title: 'Saved as Draft',
          icon: <CheckCircle className="w-12 h-12 text-blue-500" />,
          iconBg: 'bg-blue-100'
        };
      default:
        return {
          title: 'Action Completed Successfully',
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          iconBg: 'bg-green-100'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full mx-4 relative pointer-events-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
            {config.icon}
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {config.title}
          </h2>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
            >
              Create New Article
            </button>
            <button
              onClick={onViewAllNews || onRedirectToDashboard}
              className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              View All News
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;