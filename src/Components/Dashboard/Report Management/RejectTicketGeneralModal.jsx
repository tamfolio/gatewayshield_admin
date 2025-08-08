import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { userRequest } from '../../../requestMethod';
import useAccessToken from '../../../Utils/useAccessToken';
import { toast } from 'react-toastify';

function RejectTicketGeneralModal({ 
  handleRejectSosTicketModal, 
  handleRejectTicketSuccess, 
}) {
    const {id} = useParams();
  const token = useAccessToken();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    
    try {
      const res = await userRequest(token).patch(`incident/reject/${id}`);
      
      console.log("✅ Ticket rejected successfully", res.data);
      toast.success("Ticket rejected successfully!");
      
      // Call success callback if provided
      handleRejectTicketSuccess && handleRejectTicketSuccess();
      
      // Close modal
      handleRejectSosTicketModal();
      
    } catch (err) {
      console.error("❌ Error rejecting ticket:", err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Failed to reject ticket. Please try again.";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    handleRejectSosTicketModal();
  };

  return (
    <div className="fixed inset-0 bg-[#101828B2] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-center text-lg font-medium text-gray-900 mb-6">
          Are you sure you want to reject ticket?
        </h3>
        
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No I don't
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className={`flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              loading 
                ? "cursor-not-allowed" 
                : "hover:bg-red-700"
            } flex items-center justify-center space-x-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Rejecting...</span>
              </>
            ) : (
              <span>Yes I do</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectTicketGeneralModal;