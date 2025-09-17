import React from "react";
import {
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

export default function BroadcastForm({
  headerTitle,
  setHeaderTitle,
  bodyText,
  setBodyText,
  alertType,
  setAlertType,
  region,
  setRegion,
  alertTypes,
  regions,
  isAlertDropdownOpen,
  setIsAlertDropdownOpen,
  isRegionDropdownOpen,
  setIsRegionDropdownOpen,
  loadingAlertTypes,
  editingBroadcast,
  message,
  isLoading,
  handleSubmit,
  handleCancel,
  closeAllDropdowns,
  config,
}) {
  const characterCount = bodyText.length;
  const { maxCharacters, titleMaxLength } = config;

  const handleAlertTypeSelect = (type) => {
    try {
      setAlertType(type);
      setIsAlertDropdownOpen(false);
    } catch (error) {
      console.error("Error in handleAlertTypeSelect:", error);
    }
  };

  const handleRegionSelect = (regionName) => {
    try {
      console.log("Selecting region:", regionName);
      setRegion(regionName);
      setIsRegionDropdownOpen(false);
    } catch (error) {
      console.error("Error in handleRegionSelect:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingBroadcast ? "Edit Broadcast" : "Create New Broadcast"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {editingBroadcast
            ? "Update the emergency broadcast details below."
            : "Send emergency broadcasts to users in selected regions."}
        </p>
        {editingBroadcast && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Editing:</strong> {editingBroadcast.title}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ID: {editingBroadcast.id || editingBroadcast._id}
            </p>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Error Message */}
        {message && message.includes("Error") && (
          <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
            {message}
          </div>
        )}

        {/* Header/Title Field */}
        <div className="grid grid-cols-4 gap-6 items-center mb-6">
          <label className="text-sm font-medium text-gray-700">
            Header / Title *
          </label>
          <div className="col-span-3">
            <input
              type="text"
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="Enter broadcast title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={titleMaxLength}
            />
            <p className="text-xs text-gray-500 mt-1">
              {headerTitle.length}/{titleMaxLength} characters
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Body Text Field */}
        <div className="grid grid-cols-4 gap-6 items-start mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Body Text *
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Write your emergency message.
            </p>
          </div>
          <div className="col-span-3">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              {/* Rich Text Toolbar */}
              <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  title="Underline"
                >
                  <Underline size={14} />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  title="List"
                >
                  <List size={14} />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  title="Align Left"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  title="Align Center"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                  title="Align Right"
                >
                  <AlignRight size={14} />
                </button>
              </div>

              {/* Text Area */}
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full px-3 py-3 focus:outline-none resize-none text-sm"
                rows="4"
                placeholder="Write your emergency broadcast message here..."
                maxLength={maxCharacters}
              />

              {/* Character Count */}
              <div
                className={`bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-right ${
                  characterCount > maxCharacters * 0.9
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {maxCharacters - characterCount} characters left
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Alert Type Field */}
        <div className="grid grid-cols-4 gap-6 items-start mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Alert Type
            </label>
            <p className="text-xs text-gray-500 mt-1">Select Alert type.</p>
          </div>
          <div className="col-span-3">
            <div className="relative">
              <button
                onClick={() => {
                  setIsAlertDropdownOpen(!isAlertDropdownOpen);
                  setIsRegionDropdownOpen(false);
                }}
                disabled={loadingAlertTypes}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-red-600">
                  {loadingAlertTypes ? "Loading alert types..." : alertType}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isAlertDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isAlertDropdownOpen && !loadingAlertTypes && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {alertTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAlertTypeSelect(type)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                    >
                      <span className="text-red-600">{type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Region Field */}
        <div className="grid grid-cols-4 gap-6 items-start mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Region</label>
            <p className="text-xs text-gray-500 mt-1">Select target region.</p>
          </div>
          <div className="col-span-3">
            <div className="relative">
              <button
                onClick={() => {
                  setIsRegionDropdownOpen(!isRegionDropdownOpen);
                  setIsAlertDropdownOpen(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span>{region}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isRegionDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isRegionDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {regions && regions.length > 0 ? regions.map((regionOption) => (
                    <button
                      key={`${regionOption.name}-${regionOption.lgaId}`}
                      onClick={() => handleRegionSelect(regionOption.name)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>{regionOption.name}</span>
                        {regionOption.lgaId !== null && regionOption.lgaId !== "ALL" && (
                          <span className="text-xs text-gray-500">
                            ({regionOption.lgaId.slice(-6)})
                          </span>
                        )}
                      </div>
                    </button>
                  )) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      Loading regions...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !headerTitle.trim() || !bodyText.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading
              ? editingBroadcast
                ? "Updating..."
                : "Sending..."
              : editingBroadcast
              ? "Update Broadcast"
              : "Send Emergency Broadcast"}
          </button>
        </div>
      </div>

      {/* Click outside handler */}
      {(isAlertDropdownOpen || isRegionDropdownOpen) && (
        <div className="fixed inset-0 z-5" onClick={closeAllDropdowns} />
      )}
    </div>
  );
}