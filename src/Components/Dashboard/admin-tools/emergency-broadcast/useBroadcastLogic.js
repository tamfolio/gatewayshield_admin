import { useState, useEffect } from "react";
import { useApiClient, broadcastApi } from "../../../../Utils/apiClient";

// Configuration - moved outside hook to prevent re-creation on each render
const DEFAULT_CONFIG = {
  maxCharacters: 1000,
  titleMaxLength: 100,
  defaultAlertType: "Red Alert",
  defaultRegion: "All",
  dashboardUrl: "/dashboard",
};

export function useBroadcastLogic({ onBroadcastUpdate, config = DEFAULT_CONFIG }) {
  // Tab and form state
  const [activeTab, setActiveTab] = useState("new");
  const [headerTitle, setHeaderTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [alertType, setAlertType] = useState(config.defaultAlertType);
  const [region, setRegion] = useState(config.defaultRegion);

  // Dropdown states
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Loading and message states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingAlertTypes, setLoadingAlertTypes] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState("created");

  // Data states
  const [alertTypes, setAlertTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [editingBroadcast, setEditingBroadcast] = useState(null);

  const apiClient = useApiClient();

  useEffect(() => {
    loadAlertTypes();
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      console.log("🌍 [BROADCAST API] Fetching regions");

      // Use the correct endpoint - apiClient likely already has /api/v1 as base URL
      const response = await apiClient.get("/options/lgas/all");

      console.log("✅ [BROADCAST API] Regions fetched successfully");
      console.log("📍 Regions response:", response.data);

      let regionsArray = [];
      if (Array.isArray(response.data)) {
        regionsArray = response.data;
      } else if (response.data?.data?.lgas && Array.isArray(response.data.data.lgas)) {
        regionsArray = response.data.data.lgas;
      } else if (response.data?.lgas && Array.isArray(response.data.lgas)) {
        regionsArray = response.data.lgas;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        regionsArray = response.data.data;
      }

      if (regionsArray.length > 0) {
        // Map LGA data to expected format
        const mappedRegions = regionsArray.map(lga => ({
          name: lga.name,
          lgaId: lga.id || lga.lgaId || lga._id
        }));

        // Add "All" option at the beginning with explicit null value
        const allOption = { name: "All", lgaId: null };
        const regionsWithAll = [allOption, ...mappedRegions];
        
        console.log("Setting regions with All option:", regionsWithAll);
        console.log("All option lgaId:", allOption.lgaId);
        
        setRegions(regionsWithAll);
      } else {
        // Fallback if API fails - at least provide "All" option
        console.warn("🔄 Using fallback region");
        const fallbackRegions = [{ name: "All", lgaId: null }];
        console.log("Setting fallback regions:", fallbackRegions);
        setRegions(fallbackRegions);
      }
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to fetch regions");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      
      // Fallback regions
      console.log("🔄 Using fallback regions");
      setRegions([{ name: config.defaultRegion, lgaId: "ALL" }]);
    }
  };

  const loadAlertTypes = async () => {
    try {
      setLoadingAlertTypes(true);
      const result = await broadcastApi.getAlertTypes(apiClient);

      console.log("🏷️ Alert types API response:", result);

      // Handle different response structures
      let alertTypesArray = [];
      if (Array.isArray(result)) {
        alertTypesArray = result;
      } else if (result?.data && Array.isArray(result.data)) {
        alertTypesArray = result.data;
      } else if (result?.alertTypes && Array.isArray(result.alertTypes)) {
        alertTypesArray = result.alertTypes;
      }

      if (alertTypesArray.length > 0) {
        setAlertTypes(alertTypesArray);
        if (!alertTypesArray.includes(alertType)) {
          setAlertType(alertTypesArray[0]);
        }
      } else {
        // Fallback alert types if API fails
        const fallbackTypes = [config.defaultAlertType];
        setAlertTypes(fallbackTypes);
        setAlertType(config.defaultAlertType);
      }
    } catch (error) {
      setMessage("Error loading alert types. Please try again later.");
    } finally {
      setLoadingAlertTypes(false);
    }
  };

  const handleEdit = (broadcast) => {
    console.log("📝 Editing broadcast:", broadcast);

    setEditingBroadcast(broadcast);
    setHeaderTitle(broadcast.title || "");
    setBodyText(broadcast.body || "");
    setAlertType(broadcast.alertType || alertTypes[0]);

        const regionObj = regions.find((r) => r.lgaId === broadcast.lgaId);
    if (regionObj) {
      setRegion(regionObj.name);
    } else if (broadcast.lgaId === null || broadcast.lgaId === undefined) {
      // Handle case where broadcast was sent to "All" (lgaId is null)
      setRegion(config.defaultRegion);
    } else if (regions.length > 0) {
      // Default to "All" if no match found
      setRegion(config.defaultRegion);
    }

    setActiveTab("new");
    setMessage("");
  };

  const validateForm = () => {
    if (!headerTitle.trim()) {
      setMessage("Error: Please enter a broadcast title");
      return false;
    }

    if (!bodyText.trim()) {
      setMessage("Error: Please enter broadcast content");
      return false;
    }

    if (bodyText.length > config.maxCharacters) {
      setMessage(
        `Error: Body text exceeds maximum length of ${config.maxCharacters} characters`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const selectedRegion = regions.find((r) => r.name === region);
      let response;

      if (editingBroadcast) {
        const editData = {
          title: headerTitle.trim(),
          body: bodyText.trim(),
          alertType: alertType,
          lgaId: selectedRegion?.lgaId || "ALL",
          broadcastId: editingBroadcast.id || editingBroadcast._id,
        };

        if (!editData.broadcastId) {
          throw new Error("Broadcast ID is missing for edit operation");
        }

        response = await broadcastApi.edit(apiClient, editData);
        setSuccessModalType("updated");
        setShowSuccessModal(true);
      } else {
        const broadcastData = {
          title: headerTitle.trim(),
          body: bodyText.trim(),
          alertType: alertType,
          lgaId: selectedRegion?.lgaId || "ALL",
        };
        response = await broadcastApi.create(apiClient, broadcastData);
        setSuccessModalType("created");
        setShowSuccessModal(true);
      }
    } catch (error) {
      handleSubmissionError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    handleCancel();
    setActiveTab("logs");

    if (onBroadcastUpdate) {
      onBroadcastUpdate();
    }
  };

  const handleRedirectToDashboard = () => {
    setShowSuccessModal(false);
    handleCancel();
    window.location.href = config.dashboardUrl;
  };

  const handleSubmissionError = (error) => {
    if (error.message && error.message.includes("Missing required fields")) {
      setMessage(`Error: ${error.message}`);
    } else if (error.response?.status === 401) {
      setMessage("Error: Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      setMessage("Error: You do not have permission to perform this action.");
    } else if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.message || "Invalid request data";
      if (errorMsg.includes("lgaId")) {
        setMessage("Error: Please select a valid region.");
      } else {
        setMessage(`Error: ${errorMsg}`);
      }
    } else if (error.response?.status === 404) {
      setMessage("Error: Broadcast not found. It may have been deleted.");
    } else if (error.response?.status === 500) {
      setMessage("Error: Server error. Please try again later.");
    } else {
      setMessage(
        `Error: ${
          error.response?.data?.message ||
          error.message ||
          "Network error occurred"
        }`
      );
    }
  };

  const handleCancel = () => {
    setHeaderTitle("");
    setBodyText("");
    setAlertType(alertTypes[0] || config.defaultAlertType);
    setRegion(config.defaultRegion);
    setMessage("");
    setEditingBroadcast(null);
    setIsAlertDropdownOpen(false);
    setIsRegionDropdownOpen(false);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "logs") {
      handleCancel();
    }
  };

  const closeAllDropdowns = () => {
    setIsAlertDropdownOpen(false);
    setIsRegionDropdownOpen(false);
  };

  return {
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
  };
}