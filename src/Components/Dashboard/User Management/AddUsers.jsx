import React, { useEffect, useState } from "react";
import AddMultipleUsers from "./AddMultipleUsers";
import AddSingleUser from "./AddSingleUser";
import { ChevronDown } from "lucide-react";
import UploadSuccessModal from "./UploadSuccessModal";
import UploadFailureModal from "./UploadFailureModal";
import { userRequest } from "../../../requestMethod";
import useAccessToken from "../../../Utils/useAccessToken";

function AddUsers() {
  const [activeTab, setActiveTab] = useState("Single User");
  const [successModal, setSuccessModal] = useState(false);
  const [failureModal, setFailureModal] = useState(false);
  const token = useAccessToken();
  // Single user form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    coordinate: "",
    badgeNumber: "",
    role: "",
    formation: "",
    rank: "",
  });

  useEffect(() => {
    const fetchAdminRoles = async () => {
      try {
        const res = await userRequest(token).get(
          "/options/adminRoles/all"
        );
        
        setAdminRoles(res.data?.data?.adminRoles || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin roles:", err);
      } 
    };

    const fetchAdminFormation = async () => {
      try {
        const res = await userRequest(token).get(
          "/options/adminFormations/all"
        );
        
        setAdminFormation(res.data?.data?.adminFormations || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin Formation:", err);
      } 
    };

    const fetchAdminRanks = async () => {
      try {
        const res = await userRequest(token).get(
          "/options/adminRanks/all"
        );
        
        setAdminRanks(res.data?.data?.adminRanks || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin ranks:", err);
      } 
    };

    if (token) {
      fetchAdminRoles();
      fetchAdminFormation();
      fetchAdminRanks();
    }
  }, [token]);


  const handleSuccessModal = () => {
    setSuccessModal(!successModal)
  }

  
  const handleFailureModal = () => {
    setFailureModal(!failureModal)
  }
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Single user form submitted:", formData);
    // Call your API or submit logic here
  };

  const handleCancel = () => {
    console.log("Single user form cancelled");
  };

  // Bulk user upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'error'
  const [dragActive, setDragActive] = useState(false);

  const handleDownloadTemplate = () => {
    // Trigger CSV/XLSX template download logic here
    console.log("Download template");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (file && allowedTypes.includes(file.type)) {
      setUploadedFile(file);
      setUploadStatus("success");
    } else {
      setUploadedFile(null);
      setUploadStatus("error");
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus("idle");
  };

  const handleBulkSubmit = () => {
    console.log("Bulk upload submitted:", uploadedFile);
    // Handle actual upload logic (API call, etc.)
  };

  const handleBulkCancel = () => {
    console.log("Bulk upload cancelled");
    handleRemoveFile();
  };

  return (
    <>
      <div className="flex-1 bg-white p-6">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
            <span>User Management</span>
            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
            <span className="text-gray-900">Add Users</span>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === "Single User"
                  ? "bg-gray-100 text-gray-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("Single User")}
            >
              Single User
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === "Multiple User"
                  ? "bg-gray-100 text-gray-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("Multiple User")}
            >
              Multiple User
            </button>
          </div>
        </div>

        {/* Render Form Based on Active Tab */}
        <div className="">
          {activeTab === "Single User" && (
            <AddSingleUser
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "Multiple User" && (
            <AddMultipleUsers
              handleDownloadTemplate={handleDownloadTemplate}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              handleBulkSubmit={handleBulkSubmit}
              handleBulkCancel={handleBulkCancel}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              uploadedFile={uploadedFile}
              uploadStatus={uploadStatus}
              activeTab
              setActiveTab
            />
          )}
        </div>
      </div>
      {successModal && <UploadSuccessModal  successModal={successModal} handleSuccessModal={handleSuccessModal}/>}
      {failureModal && <UploadFailureModal  failureModal={failureModal} handleFailureModal={handleFailureModal}/>}
    </>
  );
}

export default AddUsers;
