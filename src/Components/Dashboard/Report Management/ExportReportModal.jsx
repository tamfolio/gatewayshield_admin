import React, { useState } from "react";
import { X } from "lucide-react";

const ExportTicketModal = ({ handleExportModal }) => {
  const [selectedFormat, setSelectedFormat] = useState('PDF');

  const handleExport = () => {
    // Handle export logic here
    console.log(`Exporting as ${selectedFormat}`);
    // You can add your export logic here
    handleExportModal(); // Close modal after export
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101828B2] bg-opacity-50 transition-opacity"
        onClick={handleExportModal}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto z-10">
          {/* Close button */}
          <button
            onClick={handleExportModal}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal content */}
          <div className="px-6 pt-8 pb-6 sm:px-8">
            {/* Title */}
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
              Export Ticket
            </h3>

            {/* Export Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export As
              </label>
              
              <div className="space-y-2">
                {/* PDF Option */}
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="PDF"
                    checked={selectedFormat === 'PDF'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">PDF</span>
                </label>

                {/* CSV Option */}
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="CSV"
                    checked={selectedFormat === 'CSV'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">CSV</span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Export
              </button>

              <button
                onClick={handleExportModal}
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

export default ExportTicketModal;