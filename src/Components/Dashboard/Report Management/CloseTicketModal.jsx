import React, { useState } from "react";
import { X } from "lucide-react";

const CloseTicketModal = ({ handleCloseTicketModal }) => {
  const [closureReason, setClosureReason] = useState('Issue Addressed');
  const [closureNotes, setClosureNotes] = useState('');

  const handleCloseTicket = () => {
    // Handle ticket closing logic here
    console.log('Closing ticket with reason:', closureReason);
    console.log('Closure notes:', closureNotes);
    // Add your ticket closing logic here
    handleCloseTicketModal(); // Close modal after processing
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101828B2] bg-opacity-50 transition-opacity"
        onClick={handleCloseTicketModal}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto z-10">
          {/* Close button */}
          <button
            onClick={handleCloseTicketModal}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal content */}
          <div className="px-6 pt-8 pb-6 sm:px-8">
            {/* Title */}
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
              Close Ticket
            </h3>

            {/* Closure Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Closure Reason
              </label>
              
              <div className="relative">
                <select
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                >
                  <option value="Issue Addressed">Issue Addressed</option>
                  <option value="Issue Resolved">Issue Resolved</option>
                  <option value="Duplicate">Duplicate</option>
                  <option value="Won't Fix">Won't Fix</option>
                  <option value="Not Reproducible">Not Reproducible</option>
                  <option value="Customer Request">Customer Request</option>
                </select>
                
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Closure Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Closure Notes
              </label>
              
              <textarea
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                placeholder="Dolor enim eu tortor urna sed duis nulla. Aliquam vestibulum, nulla odio nisl vitae. In aliquet pellentesque aenean hac vestibulum turpis mi bibendum diam."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCloseTicket}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Close Ticket
              </button>

              <button
                onClick={handleCloseTicketModal}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseTicketModal;