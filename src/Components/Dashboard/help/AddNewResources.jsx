import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  useApiClient,
  resourcesApi,
  resourcesUtils,
} from "../../../Utils/apiClient";
import SuccessModal from "./components/SuccessModal";

const AddNewResources = ({ onGoBack, onResourceAdded, editingResource }) => {
  const isEditing = !!editingResource;
  const apiClient = useApiClient();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    subCategoryId: "",
    caption: "",
    tags: ["setup"], // Default tag
    isPublished: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [keepExistingFile, setKeepExistingFile] = useState(true);

  // Data state
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Available sub-categories for selected category
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditing && editingResource) {
      console.log("📝 Pre-populating form for editing:", editingResource);

      setFormData({
        title: editingResource.title || "",
        description: editingResource.description || "",
        categoryId: editingResource.categoryId || "",
        subCategoryId: editingResource.subCategoryId || "",
        caption: editingResource.caption || "",
        tags: editingResource.tags || ["setup"],
        isPublished:
          editingResource.status === "Published" ||
          editingResource.isPublished ||
          false,
      });

      // Reset file state when editing
      setUploadedFile(null);
      setKeepExistingFile(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      // Reset form for new resource
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        caption: "",
        tags: ["setup"],
        isPublished: false,
      });
      setUploadedFile(null);
      setKeepExistingFile(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isEditing, editingResource]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);

        // Load categories and tags in parallel
        const [categoriesResponse, tagsResponse] = await Promise.all([
          resourcesApi.getCategories(apiClient),
          resourcesApi.getTags(apiClient),
        ]);

        console.log("📁 Categories response:", categoriesResponse);
        console.log("🏷️ Tags response:", tagsResponse);

        // Transform the data
        const transformedCategories = resourcesUtils.transformCategoriesData(
          categoriesResponse?.data || categoriesResponse || []
        );
        const transformedTags = resourcesUtils.transformTagsData(
          tagsResponse?.data || tagsResponse || []
        );

        setCategories(transformedCategories);
        setTags(transformedTags);

        console.log("✅ Loaded categories:", transformedCategories.length);
        console.log("✅ Loaded tags:", transformedTags.length);
      } catch (err) {
        console.error("❌ Failed to load initial data:", err);
        setError(
          "Failed to load categories and tags. Please refresh the page."
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (apiClient) {
      loadInitialData();
    }
  }, [apiClient]);

  // Update available sub-categories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const selectedCategory = categories.find(
        (cat) => cat.id === formData.categoryId
      );
      setAvailableSubCategories(selectedCategory?.subCategories || []);

      // Reset sub-category selection if current selection is not valid for new category
      if (
        formData.subCategoryId &&
        !selectedCategory?.subCategories?.some(
          (sub) => sub.id === formData.subCategoryId
        )
      ) {
        setFormData((prev) => ({ ...prev, subCategoryId: "" }));
      }
    } else {
      setAvailableSubCategories([]);
      setFormData((prev) => ({ ...prev, subCategoryId: "" }));
    }
  }, [formData.categoryId, categories]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear any existing errors when user starts typing
    if (error) setError("");
  };

  const handleTagToggle = (tagValue) => {
    setFormData((prev) => {
      const currentTags = prev.tags || [];
      const isSelected = currentTags.includes(tagValue);

      return {
        ...prev,
        tags: isSelected
          ? currentTags.filter((tag) => tag !== tagValue)
          : [...currentTags, tagValue],
      };
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "application/pdf",
        "video/mp4",
        "video/avi",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError(
          "File type not supported. Please upload an image, PDF, or video file."
        );
        return;
      }

      setUploadedFile(file);
      setKeepExistingFile(false);
      setError("");
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveNewFile = () => {
    setUploadedFile(null);
    setKeepExistingFile(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const validation = resourcesUtils.validateResourceData(formData);

    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return false;
    }

    return true;
  };

  const validateDraftForm = () => {
    // For draft, we only require title - other fields are optional
    if (!formData.title || formData.title.trim() === "") {
      setError("Title is required to save as draft");
      return false;
    }
    return true;
  };

  // Save as draft function
  const handleSaveAsDraft = async () => {
    if (!validateDraftForm()) return;

    try {
      setSavingDraft(true);
      setError("");
      setSuccess("");

      console.log("💾 Saving as draft...");

      // Create draft payload - force isPublished to false
      const draftApiData = {
        title: formData.title,
        description: formData.description || "",
        caption: formData.caption || null,
        isPublished: false, // Always false for draft
        tags: formData.tags,
        categoryId: formData.categoryId || null,
        subCategoryId: formData.subCategoryId || null,
        imagesUrl: [],
      };

      console.log("📤 Draft data:", draftApiData);

      let response;

      if (isEditing) {
        // Update existing resource as draft
        response = await resourcesApi.update(
          apiClient,
          editingResource.id,
          draftApiData,
          uploadedFile || (keepExistingFile ? null : undefined)
        );
        console.log("✅ Resource updated as draft:", response);
      } else {
        // Create new resource as draft
        response = await resourcesApi.create(apiClient, draftApiData, uploadedFile);
        console.log("✅ Resource created as draft:", response);
      }

      // Call the callback to refresh the data
      if (onResourceAdded) {
        onResourceAdded(response);
      }

      // Show success message
      setSuccess(
        `Resource ${isEditing ? "updated" : "saved"} as draft successfully!`
      );

      // Navigate back after a short delay
      setTimeout(() => {
        if (onGoBack) {
          onGoBack();
        }
      }, 1500);

    } catch (err) {
      console.error("❌ Failed to save as draft:", err);
      
      if (err.response?.status === 404) {
        setError("Resource not found. Please refresh and try again.");
      } else if (err.response?.status === 403) {
        setError("Permission denied. You may not have permission to save this resource.");
      } else if (err.response?.status === 422) {
        setError(
          `Validation error: ${
            err.response?.data?.message || "Invalid data submitted"
          }`
        );
      } else if (err.response?.status >= 500) {
        setError(`Server error. Please try again later.`);
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to save as draft. Please try again."
        );
      }
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // FIXED: Match the exact format that CREATE uses + include imagesUrl
      console.log("🔍 Raw form data before processing:", formData);

      // Create payload that matches the successful CREATE format exactly
      const manualApiData = {
        title: formData.title,
        description: formData.description,
        caption: formData.caption || null, // Always include, use null if empty
        isPublished: formData.isPublished,
        tags: formData.tags,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        imagesUrl: [], // Add empty array for imagesUrl (required by API)
      };

      console.log(
        "🔍 Manual API data created (matching CREATE format):",
        manualApiData
      );

      // Use manual data instead of resourcesUtils
      const apiData = manualApiData;

      console.log(
        `📤 ${isEditing ? "Updating" : "Creating"} resource data:`,
        apiData
      );
      console.log("📎 File:", uploadedFile);
      if (isEditing) {
        console.log("🔄 Keep existing file:", keepExistingFile);
        console.log("🆔 Resource ID:", editingResource.id);
      }

      let response;

      if (isEditing) {
        // DEBUG: Log the actual API call details
        console.log("🔍 Making update API call...");
        console.log("🔍 API Client available:", !!apiClient);
        console.log("🔍 Update method available:", typeof resourcesApi.update);

        // Update existing resource
        response = await resourcesApi.update(
          apiClient,
          editingResource.id,
          apiData,
          uploadedFile || (keepExistingFile ? null : undefined)
        );
        console.log("✅ Resource updated successfully:", response);
      } else {
        // Create new resource
        response = await resourcesApi.create(apiClient, apiData, uploadedFile);
        console.log("✅ Resource created successfully:", response);
      }

      // Call the callback FIRST to refresh the data
      if (onResourceAdded) {
        onResourceAdded(response);
      }

      // Then show the modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error(
        `❌ Failed to ${isEditing ? "update" : "create"} resource:`,
        err
      );
      console.error("❌ Error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config,
      });

      // Better error handling for the 404 error you're seeing
      if (err.response?.status === 404) {
        setError(
          `Resource not found (404). The API endpoint might be incorrect or the resource was deleted. Please check the console for API details.`
        );
      } else if (err.response?.status === 403) {
        setError(
          `Permission denied. You may not have permission to ${
            isEditing ? "update" : "create"
          } this resource.`
        );
      } else if (err.response?.status === 422) {
        setError(
          `Validation error. Please check your data: ${
            err.response?.data?.message || "Invalid data submitted"
          }`
        );
      } else if (err.response?.status >= 500) {
        setError(
          `Server error (${err.response?.status}). Please try again later.`
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            `Failed to ${
              isEditing ? "update" : "create"
            } resource. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Reset form after closing modal (only if not editing)
    if (!isEditing) {
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        caption: "",
        tags: ["setup"],
        isPublished: false,
      });
      setUploadedFile(null);
      setKeepExistingFile(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRedirectToDashboard = () => {
    console.log('🎯 User clicked "View All Resources"');
    setShowSuccessModal(false);

    // Reset form (only if not editing)
    if (!isEditing) {
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        caption: "",
        tags: ["setup"],
        isPublished: false,
      });
      setUploadedFile(null);
      setKeepExistingFile(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    // Navigate to All Resources tab
    if (onGoBack) {
      onGoBack();
    }
  };

  const handleCancel = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log("Going back...");
    }
  };

  // Show loading state while fetching initial data
  if (loadingData) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-2">
        {isEditing ? "Edit Resource" : "Add New Resource"}
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        {isEditing
          ? `Update the help resource "${editingResource?.title}" with new information and media.`
          : "Create a new help resource with documentation and media."}
      </p>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-green-700 text-sm">{success}</div>
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            placeholder="Enter resource title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || savingDraft}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Write a detailed description of the resource.
          </p>

          <div className="relative">
            <textarea
              placeholder="Provide a comprehensive description of this resource..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
              disabled={loading || savingDraft}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {1000 - formData.description.length} characters left
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="relative">
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange("categoryId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              disabled={loading || savingDraft}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Sub Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub Category *
          </label>
          <div className="relative">
            <select
              value={formData.subCategoryId}
              onChange={(e) =>
                handleInputChange("subCategoryId", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              disabled={loading || savingDraft || !formData.categoryId}
            >
              <option value="" disabled>
                {!formData.categoryId
                  ? "Select category first"
                  : "Select sub category"}
              </option>
              {availableSubCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Upload Media - ENHANCED FOR EDITING */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Media
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Images, videos, or documents (PDF, JPG, PNG, GIF, MP4, AVI - Max:
            10MB)
          </p>

          {/* Show existing file info when editing */}
          {isEditing &&
            editingResource?.fileUrl &&
            keepExistingFile &&
            !uploadedFile && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Current file attached
                    </p>
                    <p className="text-xs text-blue-600">
                      Click "Change file" to upload a new file
                    </p>
                  </div>
                  <button
                    onClick={handleUploadClick}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                    disabled={loading || savingDraft}
                  >
                    Change file
                  </button>
                </div>
              </div>
            )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="image/*,video/*,.pdf"
            className="hidden"
            disabled={loading || savingDraft}
          />

          {/* Upload area */}
          <div
            onClick={uploadedFile ? undefined : handleUploadClick}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 transition-colors ${
              !uploadedFile
                ? "hover:border-gray-400 hover:bg-gray-100 cursor-pointer"
                : ""
            }`}
          >
            {uploadedFile ? (
              <div className="space-y-2">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <p className="text-sm text-gray-600 font-medium">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex justify-center space-x-3 mt-3">
                  <button
                    onClick={handleUploadClick}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={loading || savingDraft}
                  >
                    Change file
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNewFile();
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                    disabled={loading || savingDraft}
                  >
                    Remove file
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Images, videos, PDFs (MAX: 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption (Optional)
          </label>
          <input
            type="text"
            placeholder="Add a caption for your media file"
            value={formData.caption}
            onChange={(e) => handleInputChange("caption", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || savingDraft}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex items-center space-x-6">
            {tags.map((tag) => (
              <div key={tag.id || tag.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`tag-${tag.id || tag.value}`}
                  checked={formData.tags.includes(tag.value)}
                  onChange={() => handleTagToggle(tag.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading || savingDraft}
                />
                <label
                  htmlFor={`tag-${tag.id || tag.value}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {tag.name}
                </label>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-gray-500">No tags available</p>
            )}
          </div>
        </div>

        {/* Publish Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publication Status *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Toggle to publish this resource immediately
          </p>
          <div className="flex items-center">
            <button
              onClick={() =>
                handleInputChange("isPublished", !formData.isPublished)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.isPublished ? "bg-blue-600" : "bg-gray-200"
              }`}
              disabled={loading || savingDraft}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPublished ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-700">
              {formData.isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading || savingDraft}
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSaveAsDraft}
              disabled={loading || savingDraft || !formData.title}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {savingDraft ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Draft...
                </>
              ) : (
                "Save as Draft"
              )}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading || savingDraft}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Resource"
              ) : (
                "Add Resource"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        type={isEditing ? "updated" : "created"}
        onRedirectToDashboard={handleRedirectToDashboard}
      />
    </div>
  );
};

export default AddNewResources;