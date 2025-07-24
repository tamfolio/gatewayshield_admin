import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, type, onRedirectToDashboard }) => {
  if (!isOpen) return null;

  // Configure messages based on type
  const getConfig = () => {
    switch (type) {
      case 'created':
        return {
          title: 'Broadcast created Successfully',
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          iconBg: 'bg-green-100'
        };
      case 'updated':
        return {
          title: 'Broadcast Updated Successfully',
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          iconBg: 'bg-green-100'
        };
     
        
      default:
        return {
          title: 'Action Completed Successfully',
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          iconBg: 'bg-green-100'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-6`}>
            {config.icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            {config.title}
          </h2>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              Stay on Page
            </button>
            <button
              onClick={onRedirectToDashboard}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Redirect to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;