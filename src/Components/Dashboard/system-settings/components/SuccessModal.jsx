import React from 'react';
import { Check } from 'lucide-react';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Settings Updated Successfully",
  showRedirectOption = true,
  stayButtonText = "Stay on Page",
  redirectButtonText = "Redirect to Dashboard"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-w-sm w-full mx-4 text-center pointer-events-auto">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
        
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors duration-200"
          >
            {stayButtonText}
          </button>
          
          {showRedirectOption && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              {redirectButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;