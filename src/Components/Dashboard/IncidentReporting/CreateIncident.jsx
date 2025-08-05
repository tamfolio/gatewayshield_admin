import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Upload,
  Mic,
  Square,
  X,
  ChevronRight,
} from "lucide-react";
import { userRequest } from "../../../requestMethod";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import useAccessToken from "../../../Utils/useAccessToken";
import Select from "react-select";

function CreateIncident() {
  const [userDataDetails, setUserDataDetails] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const userData = useSelector((state) => state.user?.currentUser);
  console.log(userData);
  const token = useAccessToken();

  console.log(userDataDetails?.id);

  const [formData, setFormData] = useState({
    userType: "Registered User", // New field
    reportType: "SOS",
    email: "",
    fullName: "",
    address: "",
    phone: "",
    description: "",
    channel: "", // For General reports only
    incidentType: "", // For General reports only
  });

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadedFile, setUploadedFile] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await userRequest(token).get(`/admin/get/`);
        setUserDataDetails(res.data.data.admin);
      } catch (error) {
        console.error("❌ Failed to fetch Dashboard data:", error);
      }
    };

    const fetchIncidentTypes = async () => {
      try {
        const response = await userRequest(token).get("/incident/types");
        console.log("Incident types API response:", response.data);
        
        const formattedData = response.data?.data?.map((item) => ({
          label: item.name,
          value: item.id,
        })) || [];
        
        setIncidentTypes(formattedData);
      } catch (error) {
        console.error("Error fetching incident types:", error);
    };
  }

    if (token) {
      fetchUserDetails();
      fetchIncidentTypes();
    }
  }, [token]);

  console.log(userDataDetails);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleUserTypeChange = (userType) => {
    // Reset form when changing user type but preserve userType and reportType
    setFormData({
      userType,
      reportType: formData.reportType,
      email: "",
      fullName: "",
      address: "",
      phone: "",
      description: "",
      channel: "",
      incidentType: "",
    });
    setErrors({});
    setUploadedFile("");
    setAudioBlob(null);
    setIsRecording(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Stop any ongoing recording
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const handleReportTypeChange = (reportType) => {
    // Reset form when changing report type but preserve userType
    setFormData({
      userType: formData.userType,
      reportType,
      email: "",
      fullName: "",
      address: "",
      phone: "",
      description: "",
      channel: "",
      incidentType: "",
    });
    setErrors({});
    setUploadedFile("");
    setAudioBlob(null);
    setIsRecording(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Stop any ongoing recording
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation based on user type
    if (formData.userType !== "Anonymous") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }
    }

    if (formData.userType !== "Anonymous" || (formData.userType === "Anonymous" && formData.reportType === "General")) {
      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // General report specific validations
    if (formData.reportType === "General") {
      if (!formData.channel) {
        newErrors.channel = "Channel is required for General reports";
      }
      if (!formData.incidentType) {
        newErrors.incidentType =
          "Incident type is required for General reports";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const fileInput = fileInputRef.current;
      const selectedFile = fileInput?.files?.[0];
  
      // Debug file selection
      console.log("File input ref:", fileInput);
      console.log("Selected file:", selectedFile);
      console.log("File size:", selectedFile?.size);
      console.log("File type:", selectedFile?.type);
      console.log("File name:", selectedFile?.name);
  
      if (formData.reportType === "SOS") {
        // Handle SOS incident submission
        const sosData = {
          address: formData.address,
          comment: formData.description,
          isAnonymous: formData.userType === "Anonymous",
          userId: formData.userType !== "Anonymous" ? String(userDataDetails?.id) : null,
        };
  
        console.log("🚀 SOS Submitting form with data:", formData);
        console.log("🚀 SOS Body data:", sosData);
  
        // Create FormData for SOS
        const formPayload = new FormData();
        formPayload.append("data", JSON.stringify(sosData));
  
        // Append audio file if recorded
        if (audioBlob) {
          const audioFile = new File([audioBlob], "recording.wav", {
            type: "audio/wav",
          });
          formPayload.append("audio", audioFile);
          console.log("SOS: Audio file appended successfully");
        }
  
        // Append image file if uploaded
        if (selectedFile && selectedFile instanceof File && selectedFile.size > 0) {
          formPayload.append("image", selectedFile);
          console.log("SOS: Image file appended successfully");
        }
  
        // Log FormData contents for debugging
        console.log("SOS FormData contents:");
        for (let [key, value] of formPayload.entries()) {
          console.log(key, value);
        }
  
        const res = await userRequest(token).post("/sos/new", formPayload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        console.log("✅ SOS incident created successfully", res.data);
        toast.success("SOS report submitted successfully!");
      } else {
        // Handle General incident submission
        const incidentData = {
          incidentTypeId: "01JY9QT23TQDPFDJ678NQSJRGB",
          address: formData.address,
          description: formData.description,
          isAnonymous: formData.userType === "Anonymous",
          userId: formData.userType !== "Anonymous" ? String(userDataDetails?.id) : null,
          phoneNumber: formData.userType !== "Anonymous" ? formData.phone.replace(/\D/g, "") : null,
          channel: formData.channel.toLowerCase(),
        };
  
        console.log("🚀 General Submitting form with data:", formData);
        console.log("🚀 General Body data:", incidentData);
        console.log("Token:", token ? "Present" : "Missing");
  
        // Log each field to check for null values
        Object.entries(incidentData).forEach(([key, value]) => {
          console.log(`   ${key}: ${value} (type: ${typeof value})`);
          if (value === null || value === undefined || value === "") {
            console.warn(`   ⚠️  ${key} is ${value}`);
          }
        });
  
        // Create FormData for General incident
        const formPayload = new FormData();
        formPayload.append("data", JSON.stringify(incidentData));
  
        // Append file if uploaded
        if (selectedFile && selectedFile instanceof File && selectedFile.size > 0) {
          // Determine if it's an image or video based on file type
          if (selectedFile.type.startsWith('image/')) {
            formPayload.append("images", selectedFile);
            console.log("General: Image file appended successfully");
          } else if (selectedFile.type.startsWith('video/')) {
            formPayload.append("video", selectedFile);
            console.log("General: Video file appended successfully");
          } else {
            console.warn("General: Unsupported file type:", selectedFile.type);
          }
        }
  
        // Log FormData contents for debugging
        console.log("General FormData contents:");
        for (let [key, value] of formPayload.entries()) {
          console.log(`   ${key}:`, value);
        }
  
        const res = await userRequest(token).post("/incident/new", formPayload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        console.log("✅ General incident created successfully", res.data);
        toast.success("Incident reported successfully!");
      }
  
      // Reset form after successful submission
      setFormData({
        userType: "Registered User",
        reportType: "SOS",
        email: "",
        fullName: "",
        address: "",
        phone: "",
        description: "",
        channel: "",
        incidentType: "",
      });
      setUploadedFile("");
      setAudioBlob(null);
      setErrors({});
  
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("❌ Error details:", err);
      console.error("❌ Error response:", err.response?.data);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          `Failed to create ${formData.reportType.toLowerCase()} report. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/wav" });
          setAudioBlob(blob);
          // Stop all tracks to release microphone
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast.error("Could not access microphone. Please check permissions.");
      }
    } else {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  const removeFile = () => {
    setUploadedFile("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setIsRecording(false);
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  // Helper function to determine field order and visibility
  const shouldShowField = (fieldName) => {
    const { userType, reportType } = formData;
    
    switch (fieldName) {
      case "email":
      case "fullName":
      case "phone":
        return userType !== "Anonymous";
      case "address":
        // Show address for non-anonymous users, or for anonymous General reports
        return userType !== "Anonymous" || (userType === "Anonymous" && reportType === "General");
      case "channel":
      case "incidentType":
        return reportType === "General";
      default:
        return true;
    }
  };

  // Helper function to get field order based on user type and report type
  const getFieldOrder = () => {
    const { userType, reportType } = formData;
    
    // For Registered User + General: phone first
    if (userType === "Registered User" && reportType === "General") {
      return ["phone", "email", "fullName", "address", "channel", "incidentType"];
    }
    
    // For other combinations: email first (when applicable)
    if (userType !== "Anonymous") {
      if (reportType === "SOS") {
        return ["phone", "email", "fullName", "address"];
      } else {
        return ["email", "fullName", "channel", "incidentType", "address", "phone"];
      }
    }
    
    // For Anonymous
    if (reportType === "General") {
      return ["channel", "incidentType"];
    }
    
    return [];
  };

  const handleIncidentTypeChange = useCallback((selectedOption) => {
    if (!selectedOption || typeof selectedOption !== 'object') {
      setFormData((prev) => ({ ...prev, incidentType: null }));
      return;
    }
    setFormData((prev) => ({ ...prev, incidentType: selectedOption }));
  }, []);

  const renderFormField = (fieldName) => {
    if (!shouldShowField(fieldName)) return null;

    switch (fieldName) {
      case "email":
        return (
          <div key="email">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registered Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        );

      case "fullName":
        return (
          <div key="fullName">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citizen Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>
        );

      case "phone":
        return (
          <div key="phone">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="relative">
                <select className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8">
                  <option value="NG">NG</option>
                  <option value="US">US</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`flex-1 px-3 py-2 border-t border-r border-b rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        );

      case "address":
        return (
          <div key="address">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address {shouldShowField("address") && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Your Address"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              required={shouldShowField("address")}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>
        );

      case "channel":
        return (
          <div key="channel">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.channel}
                onChange={(e) => handleInputChange("channel", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                  errors.channel ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Channel</option>
                <option value="Call">Call</option>
                <option value="X">X</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.channel && (
              <p className="mt-1 text-sm text-red-500">{errors.channel}</p>
            )}
          </div>
        );

      case "incidentType":
        return (
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Type *
                  </label>
                  <Select
                    options={incidentTypes}
                    value={formData.incidentType}
                    onChange={handleIncidentTypeChange}
                    placeholder="Select incident type"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <span className="hover:text-gray-700 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Incident Report</span>
        </nav>

        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Incident Reports
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">     
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <div className="relative">
                <select
                  value={formData.reportType}
                  onChange={(e) => handleReportTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="SOS">SOS</option>
                  <option value="General">General</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Dynamic form fields based on user type and report type */}
            {getFieldOrder().map(fieldName => renderFormField(fieldName))}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.reportType === "SOS" ? "SOS" : "Incident"} Description{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder={
                    formData.reportType === "SOS"
                      ? "Tell us about what happened"
                      : "Tell us about what happened"
                  }
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}

                {/* Voice Recording Section - Only show for SOS */}
                {formData.reportType === "SOS" && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="flex items-center justify-center mb-4">
                      {isRecording ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="flex space-x-1">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-gray-400 rounded-full animate-pulse"
                                style={{
                                  height: `${Math.random() * 20 + 10}px`,
                                  animationDelay: `${i * 50}ms`,
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ) : audioBlob ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Recording saved</span>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-6 bg-gray-300 rounded-full"
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
                          isRecording
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : audioBlob
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Square className="w-4 h-4" />
                            <span>stop recording</span>
                          </>
                        ) : audioBlob ? (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Record Again</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Start Recording</span>
                          </>
                        )}
                      </button>

                      {audioBlob && (
                        <button
                          type="button"
                          onClick={removeAudio}
                          className="flex items-center space-x-2 px-4 py-2 rounded-md font-medium bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >
                          <X className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Media */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Media
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="text-blue-500 hover:text-blue-600">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {formData.reportType === "SOS"
                    ? "PNG, JPG, GIF or MP4 (max size per file: 10MB)"
                    : "PNG, JPG, GIF or MP4 (max size per file: 10MB)"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept={
                    formData.reportType === "SOS"
                      ? ".png,.jpg,.jpeg,.gif,.mp4"
                      : ".png,.jpg,.jpeg,.gif,.mp4"
                  }
                  className="hidden"
                />
              </div>

              {/* Uploaded File Display */}
              {uploadedFile && (
                <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="text-sm text-gray-700">{uploadedFile}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                   "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : `Submit ${formData.reportType} Report`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateIncident;