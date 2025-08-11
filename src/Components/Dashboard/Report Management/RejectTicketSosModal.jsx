import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { userRequest } from '../../../requestMethod';
import { toast } from 'react-toastify';
import useAccessToken from '../../../Utils/useAccessToken';

function RejectTicketSosModal({ handleRejectTicketModal, handleRejectTicketSuccess }) {
    const {id} = useParams();
    const token = useAccessToken();
    const [loading, setLoading] = useState(false);

    const handleReject = async () => {
      if (loading) return; // Prevent double clicks
      
      setLoading(true);
      
      try {
        const payload = {
          statusId: "01JY9RYDSKAQ06JZGDT85EJRFF"
        };
        
        const res = await userRequest(token).patch(`sos/updateStatus/${id}`, payload);
        
        console.log("✅ Ticket rejected successfully", res.data);
        handleCancel();
        // Only show toast here, remove from parent component
        toast.success("Ticket rejected successfully!");
        
        // Call success callback if provided (but don't show another toast there)
        if (handleRejectTicketSuccess) {
          handleRejectTicketSuccess();
        }
        
        // Close modal
        handleRejectTicketModal();
        
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
      if (!loading) { // Only allow cancel if not loading
        handleRejectTicketModal();
      }
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
              className={`flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors ${
                loading 
                  ? "bg-gray-100 cursor-not-allowed opacity-50" 
                  : "bg-white hover:bg-gray-50"
              }`}
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

export default RejectTicketSosModal;