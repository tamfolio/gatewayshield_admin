import React, { useState, useRef } from "react";
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

function CreateIncident() {
  const { currentUser } = useSelector((state) => state.user);
  const token = useAccessToken();

  const [formData, setFormData] = useState({
    reportType: "SOS",
    email: "",
    fullName: "",
    address: "",
    phone: "",
    description: "",
    channel: "", // Start with empty for General reports
  });

  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.reportType === "General" && !formData.channel) {
      newErrors.channel = "Channel is required for General reports";
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

      // Log for debugging
      console.log("File input:", fileInput);
      console.log("Selected file:", selectedFile);
      console.log("File size:", selectedFile?.size);

      // Prepare the data object according to the API structure
      const incidentData = {
        incidentTypeId: "01JY9QT23TQDPFDJ678NQSJRGB",
        address: formData.address,
        description: formData.description,
        isAnonymous: false,
        userId: currentUser?.id || "01JX7KE5HB162HF41SYZ6PWJGV",
        phoneNumber: formData.phone.replace(/\D/g, ""),
        channel:
          formData.reportType === "General"
            ? formData.channel.toLowerCase()
            : "web",
      };

      // Create FormData
      const data = new FormData();
      data.append("data", JSON.stringify(incidentData));

      // Only append file if it exists and has content
      if (selectedFile && selectedFile.size > 0) {
        console.log(
          "✅ Appending file:",
          selectedFile.name,
          "Size:",
          selectedFile.size
        );
        data.append("file", selectedFile);
      } else {
        console.log("❌ No file to append");
      }

      // Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }

      const res = await userRequest(token).post("/incident/new", data, {
        headers: {
          // Don't set Content-Type, let the browser set it with boundary
          // 'Content-Type': 'multipart/form-data' // Remove this if you have it
        },
      });

      console.log("✅ Incident created successfully", res.data);
      toast.success("Incident reported successfully!");

      // Reset form
      setFormData({
        reportType: "SOS",
        email: "",
        fullName: "",
        address: "",
        phone: "",
        description: "",
        channel: "",
      });
      setUploadedFile("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("❌ Error details:", err);
      console.error("❌ Error response:", err.response?.data);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create incident. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
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
                  onChange={(e) =>
                    handleInputChange("reportType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="SOS">SOS</option>
                  <option value="General">General</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Channel - Only show for General reports */}
            {formData.reportType === "General" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.channel}
                    onChange={(e) =>
                      handleInputChange("channel", e.target.value)
                    }
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
            )}

            {/* Registered Email */}
            <div>
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

            {/* Citizen Full Name */}
            <div>
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

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Your Address"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="relative">
                  <select className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8">
                    <option value="NG">NG</option>
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

            {/* SOS Description */}
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
                  placeholder="Tell us about what happened"
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

                {/* Voice Recording Section */}
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

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4" />
                          <span>stop recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>start recording</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
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
                  PNG, JPG, GIF or MP4 (max size per file: 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".png,.jpg,.jpeg,.gif,.mp4"
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
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateIncident;
