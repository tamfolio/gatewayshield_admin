import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const DeletedSuccessModal = ({ isOpen, onClose, message = "News deleted successfully" }) => {
  if (!isOpen) return null;

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
          {/* Success Icon */}
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {message}
          </h2>

          {/* OK Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletedSuccessModal;