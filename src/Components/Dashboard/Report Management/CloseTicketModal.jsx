import React, { useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { userRequest } from "../../../requestMethod";
import CloseTicketConfirmModal from "./ConfirmCloseTicketModal";

const CloseTicketModal = ({ handleCloseTicketModal, closureReasons,handleConfirmCloseTicketModal }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [closureNotes, setClosureNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { id } = useParams();
  const token = useSelector(
    (state) => state.user?.currentUser?.tokens?.access?.token
  );
  const closureReasonsOptions = closureReasons.map((reason) => ({
    value: reason.id,
    label: reason.name,
  }));

  const handleCloseTicket = async () => {
    if (!selectedReason) {
      toast.error("Please select a closure reason.");
      return;
    }

    const payload = {
      closureReasonId: selectedReason.value,
      closureNote: closureNotes,
      incidentId: id,
    };

    try {
      const res = await userRequest(token).post("/incident/close", payload);

      console.log("✅ Incident closed successfully", res.data);
      handleCloseTicketModal(); // Close modal after successful close
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to close incident. Please try again."
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-[#101828B2] bg-opacity-50 transition-opacity"
          onClick={handleCloseTicketModal}
        />

        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto z-10">
            <button
              onClick={handleCloseTicketModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="px-6 pt-8 pb-6 sm:px-8">
              <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
                Close Ticket
              </h3>

              {/* Closure Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Closure Reason
                </label>

                <Select
                  options={closureReasonsOptions}
                  value={selectedReason}
                  onChange={(option) => setSelectedReason(option)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select closure reason..."
                />
              </div>

              {/* Closure Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Closure Notes
                </label>

                <textarea
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  placeholder="Add any relevant notes about the closure..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!selectedReason) {
                      toast.error("Please select a closure reason.");
                      return;
                    }

                    setShowConfirm(true); 
                  }}
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
      {showConfirm && (
        <CloseTicketConfirmModal
          handleConfirmCloseTicketModal={() => setShowConfirm(false)}
          handleCloseTicket={handleCloseTicket}
          handleCloseTicketModal={handleCloseTicketModal}
        />
      )}
    </>
  );
};

export default CloseTicketModal;
