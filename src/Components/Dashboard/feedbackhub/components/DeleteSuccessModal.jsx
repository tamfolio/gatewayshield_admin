import React from 'react';
import { CheckCircle } from 'lucide-react';

const Button = ({ children, variant = "primary", size = "md", className = "", disabled = false, ...props }) => {
  const base = "font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  );
};

const DeleteSuccessModal = ({ isOpen, onClose, message = "Feedback has been successfully deleted." }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="success" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSuccessModal;