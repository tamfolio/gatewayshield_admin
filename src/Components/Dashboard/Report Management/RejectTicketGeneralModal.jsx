import React from 'react';

function RejectTicketSosModal({ handleRejectTicketModal, handleRejectTicketSuccess }) {
  const handleReject = () => {
    // Add your reject logic here
    handleRejectTicketSuccess && handleRejectTicketSuccess();
    handleRejectTicketModal();
  };

  const handleCancel = () => {
    handleRejectTicketModal();
  };

  return (
    <div className="fixed inset-0 bg-[#101828B2] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-center text-lg font-medium text-gray-900 mb-6">
          Are you sure you want to reject ticket
        </h3>
        
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            No I don't
          </button>
          <button
            onClick={handleReject}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Yes I do
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectTicketSosModal;