import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const DeletedSuccessModal = ({ isOpen, onClose, message = "News deleted successfully" }) => {
  if (!isOpen) return null;

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
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            {message}
          </h2>

          {/* OK Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletedSuccessModal;