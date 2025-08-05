import React, { useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { userRequest } from "../../../requestMethod";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AssignTicketModal = ({
  handleAssignTicketModal,
  stations,
  handleAssignSosTicketSuccessModal,
  assignedStation,
}) => {
  const [selectedStation, setSelectedStation] = useState(null);
  const { id } = useParams();
  const stationOptions = stations.map((station) => ({
    value: station.id,
    label: station.formation,
  }));

  const token = useSelector(
    (state) => state.user?.currentUser?.tokens?.access?.token
  );

  const handleAssign = async () => {
    if (!id || !selectedStation?.value) {
      alert("Incident ID and Station ID are required.");
      return;
    }

    try {
      const payload = {
        incidentId: id,
        stationId: selectedStation.value,
      };

      const res = await userRequest(token).patch("/incident/assign", payload);

      console.log("✅ Incident assigned successfully", res.data);
      handleAssignTicketModal();
      handleAssignSosTicketSuccessModal();
    } catch (err) {
      console.error(
        "❌ Error assigning incident",
        err.response?.data || err.message
      );
      toast(
        err.response?.data?.error ||
          "Failed to assign incident. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#101828B2] bg-opacity-50 transition-opacity"
        onClick={handleAssignTicketModal}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto z-10">
          <button
            onClick={handleAssignTicketModal}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="px-6 pt-8 pb-6 sm:px-8">
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
              {assignedStation ? "Reassign Ticket" : "Assign Ticket"}
            </h3>

            {/* Assign to Station */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Station
              </label>
              <Select
                options={stationOptions}
                value={selectedStation}
                onChange={(option) => setSelectedStation(option)}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select a police station..."
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAssign}
                disabled={!selectedStation}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Assign
              </button>

              <button
                onClick={handleAssignTicketModal}
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

export default AssignTicketModal;
