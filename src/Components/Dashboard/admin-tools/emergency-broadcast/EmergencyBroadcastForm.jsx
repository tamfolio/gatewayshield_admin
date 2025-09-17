import React from "react";
import { ChevronRight } from "lucide-react";
import BroadcastForm from "./BroadcastForm";
import BroadcastLogs from "./BroadcastLogs";
import SuccessModal from "./components/SuccessModal";
import { useBroadcastLogic } from "./useBroadcastLogic";

export default function EmergencyBroadcastForm({ onBroadcastUpdate }) {
  const {
    // State
    activeTab,
    headerTitle,
    setHeaderTitle,
    bodyText,
    setBodyText,
    alertType,
    setAlertType,
    region,
    setRegion,
    isAlertDropdownOpen,
    setIsAlertDropdownOpen,
    isRegionDropdownOpen,
    setIsRegionDropdownOpen,
    isLoading,
    message,
    loadingAlertTypes,
    showSuccessModal,
    successModalType,
    alertTypes,
    editingBroadcast,
    regions,
    config,
    
    // Actions
    handleEdit,
    handleSubmit,
    handleCancel,
    handleTabSwitch,
    closeAllDropdowns,
    handleSuccessModalClose,
    handleRedirectToDashboard,
  } = useBroadcastLogic({ onBroadcastUpdate });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4" />
        <span>Admin Tools</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">Emergency Broadcast</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabSwitch("new")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "new"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {editingBroadcast ? "Edit Broadcast" : "New Broadcast"}
        </button>
        <button
          onClick={() => handleTabSwitch("logs")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "logs"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Broadcast Logs
        </button>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === "new" ? (
        <BroadcastForm
          headerTitle={headerTitle}
          setHeaderTitle={setHeaderTitle}
          bodyText={bodyText}
          setBodyText={setBodyText}
          alertType={alertType}
          setAlertType={setAlertType}
          region={region}
          setRegion={setRegion}
          alertTypes={alertTypes}
          regions={regions}
          isAlertDropdownOpen={isAlertDropdownOpen}
          setIsAlertDropdownOpen={setIsAlertDropdownOpen}
          isRegionDropdownOpen={isRegionDropdownOpen}
          setIsRegionDropdownOpen={setIsRegionDropdownOpen}
          loadingAlertTypes={loadingAlertTypes}
          editingBroadcast={editingBroadcast}
          message={message}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          closeAllDropdowns={closeAllDropdowns}
          config={config}
        />
      ) : (
        <BroadcastLogs
          onEdit={handleEdit}
          refreshTrigger={onBroadcastUpdate ? Date.now() : 0}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        type={successModalType}
        onRedirectToDashboard={handleRedirectToDashboard}
      />
    </div>
  );
}