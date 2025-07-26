import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, type, onRedirectToDashboard }) => {
  // Debug logging
  console.log('🎯 SuccessModal render:', { isOpen, type });
  
  if (!isOpen) return null;

  // Configure messages based on type
  const getConfig = () => {
    switch (type) {
      case 'created':
        return {
          title: 'Resource Created Successfully',
          message: 'Your help resource has been created and is now available.',
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          iconBg: 'bg-green-100',
          stayButtonText: 'Add Another Resource',
          redirectButtonText: 'View All Resources'
        };
      case 'updated':
        return {
          title: 'Resource Updated Successfully',
          message: 'Your help resource has been updated with the latest changes.',
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          iconBg: 'bg-green-100',
          stayButtonText: 'Continue Editing',
          redirectButtonText: 'View All Resources'
        };
      default:
        return {
          title: 'Action Completed Successfully',
          message: 'Your action has been completed successfully.',
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          iconBg: 'bg-green-100',
          stayButtonText: 'Stay on Page',
          redirectButtonText: 'Go to Dashboard'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl pointer-events-auto border border-gray-200">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {config.title}
          </h2>

          {/* Message */}
          {config.message && (
            <p className="text-gray-600 mb-8 leading-relaxed">
              {config.message}
            </p>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              {config.stayButtonText}
            </button>
            <button
              onClick={onRedirectToDashboard}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {config.redirectButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;