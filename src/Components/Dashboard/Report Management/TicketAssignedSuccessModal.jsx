import React from "react";
import { CircleCheckBig, X } from "lucide-react";
import { Link } from "react-router-dom";

const TicketAssignedSuccessModal = ({ handleAssignSosTicketSuccessModal }) => {
  const handleExport = () => {
    // Handle export logic here
    // You can add your export logic here
    handleAssignSosTicketSuccessModal(); // Close modal after export
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101828B2] bg-opacity-50 transition-opacity"
        onClick={handleAssignSosTicketSuccessModal}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto z-10">
          {/* Close button */}
          <button
            onClick={handleAssignSosTicketSuccessModal}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal content */}
          <div className="px-6 pt-8 pb-6 sm:px-8">
            {/* Title */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <CircleCheckBig className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
              Ticket Assigned successfully
            </h3>

            {/* Export Format Selection */}

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAssignSosTicketSuccessModal}
                className="w-full bg-[#EEF4FF] text-[#3538CD] py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Stay On Page
              </button>
              <Link
                to="/dashboard"
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors inline-block text-center"
              >
                Redirect to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketAssignedSuccessModal;
