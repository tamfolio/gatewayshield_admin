import React from "react";
import { CircleCheckBig, X } from "lucide-react";

const CloseTicketConfirmModal = ({ handleConfirmCloseTicketModal }) => {
  const handleExport = () => {
    // Handle export logic here
    // You can add your export logic here
    handleConfirmCloseTicketModal(); // Close modal after export
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101828B2] bg-opacity-50 transition-opacity"
        onClick={handleConfirmCloseTicketModal}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto z-10">
          {/* Close button */}
          <button
            onClick={handleConfirmCloseTicketModal}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal content */}
          <div className="px-6 pt-8 pb-6 sm:px-8">
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
              Are you sure you want to close ticket
            </h3>

            {/* Export Format Selection */}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleConfirmCloseTicketModal}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                No I don't
              </button>
              <button
                onClick={handleExport}
                className="w-full bg-[#D92D20] text-[#fff] py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Yes I Do
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseTicketConfirmModal;
