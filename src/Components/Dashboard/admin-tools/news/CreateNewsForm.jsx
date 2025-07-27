import React, { useState, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import RichTextEditor from "./components/RichTextEditor";
import FileUploadComponent from "./components/FileUploadComponent";
import TagsManager from "./components/TagsManager";
import SuccessModal from "./components/SuccessModal";
import { useApiClient, newsApi } from "../../../../Utils/apiClient";

const CreateNewsForm = ({
  editingNewsId,
  setEditingNewsId,
  onRedirectToDashboard,
}) => {
  const apiClient = useApiClient();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    bodyText: "",
    tags: [],
    coverImageName: "",
    isDraft: true,
    isActive: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Success modal state
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    type: "published",
  });

  const subtitleRef = useRef(null);
  const bodyTextRef = useRef(null);

  const TITLE_LIMIT = 100,
    SUBTITLE_LIMIT = 150,
    BODYTEXT_LIMIT = 2000,
    TAG_LIMIT = 20;

  // ADDED: Effect to load news data when editing
  useEffect(() => {
    const loadNewsForEditing = async () => {
      if (!editingNewsId || !apiClient) return;

      setIsLoading(true);
      setErrors({});

      try {
        const newsData = await newsApi.getOne(apiClient, editingNewsId);

        console.log("Loaded news for editing:", newsData);

        // Parse the response to get actual news data
        let article = null;
        if (newsData?.data?.news) {
          article = newsData.data.news;
        } else if (newsData?.news) {
          article = newsData.news;
        } else if (newsData?.data) {
          article = newsData.data;
        } else {
          article = newsData;
        }

        if (article) {
          setFormData({
            title: article.title || "",
            subtitle: article.subtitle || "",
            bodyText: article.bodyText || article.body || "",
            tags: article.tags || [],
            coverImageName:
              article.coverImageFileName || article.coverImageName || "",
            isDraft: article.isDraft !== false,
            isActive: article.isActive === true,
          });

          // Set editor content
          if (subtitleRef.current) {
            subtitleRef.current.innerHTML = article.subtitle || "";
          }
          if (bodyTextRef.current) {
            bodyTextRef.current.innerHTML =
              article.bodyText || article.body || "";
          }

          // Handle existing media files if any
          if (article.mediaFiles && Array.isArray(article.mediaFiles)) {
            const existingFiles = article.mediaFiles.map((media, index) => ({
              id: `existing-${index}`,
              name: media.filename || media.name || `media-${index}`,
              size: media.size || 0,
              type: media.type || "image/*",
              progress: 100,
              completed: true,
              isUploading: false,
              makeCoverImage: media.filename === article.coverImageFileName,
              caption: media.caption || "",
              uploadedUrl: media.url || media.path,
              file: null, // Existing files don't have File objects
            }));
            setUploadedFiles(existingFiles);
          }
        }
      } catch (error) {
        console.error("Error loading news for editing:", error);
        setErrors({
          general: "Failed to load news article for editing. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNewsForEditing();
  }, [editingNewsId, apiClient]);

  // ADDED: Effect to clear form when not editing
  useEffect(() => {
    if (!editingNewsId) {
      setFormData({
        title: "",
        subtitle: "",
        bodyText: "",
        tags: [],
        coverImageName: "",
        isDraft: true,
        isActive: false,
      });
      setUploadedFiles([]);
      setErrors({});

      // Clear editors
      if (subtitleRef.current) subtitleRef.current.innerHTML = "";
      if (bodyTextRef.current) bodyTextRef.current.innerHTML = "";
    }
  }, [editingNewsId]);

  const getTextContent = (el) => {
    if (!el) return "";
    return el.textContent || el.innerText || "";
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if API client is available
    if (!apiClient) {
      newErrors.general = "You must be logged in to save news articles.";
      setErrors(newErrors);
      return false;
    }

    // Title validation
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > TITLE_LIMIT) {
      newErrors.title = `Max ${TITLE_LIMIT} chars`;
    }

    // Subtitle validation
    if (!getTextContent(subtitleRef.current)) {
      newErrors.subtitle = "Subtitle required";
    }

    // Body text validation
    if (!getTextContent(bodyTextRef.current)) {
      newErrors.bodyText = "Body text required";
    }

    // Tags validation
    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = "At least one tag required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (isDraft = true) => {
    if (!validateForm()) {
      alert("Please fix validation errors before saving.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Build form data matching API expectations
    const newsData = {
      title: formData.title?.trim() || "",
      subtitle: getTextContent(subtitleRef.current) || "",
      bodyText: getTextContent(bodyTextRef.current) || "",
      tags: formData.tags || [],
      isDraft: isDraft,
      isActive: !isDraft,
    };

    // Handle cover image - map to API field name
    if (formData.coverImageName?.trim()) {
      newsData.coverImageFileName = formData.coverImageName.trim();
    }

    // Prepare files for upload (only new files, not existing ones)
    const newFiles = (uploadedFiles || []).filter(
      (f) => f?.completed && f?.file
    );
    let mediaFiles = [];
    let coverFile = null;

    if (newFiles.length > 0) {
      // Set coverImageFileName to first cover image or first image
      const coverImage = newFiles.find((f) => f.makeCoverImage) || newFiles[0];
      if (coverImage && !formData.coverImageName) {
        newsData.coverImageFileName = coverImage.name;
        coverFile = coverImage.file;
      }

      // Add caption from cover image
      if (coverImage?.caption) {
        newsData.caption = coverImage.caption;
      }

      // Collect all new media files
      mediaFiles = newFiles.map((f) => f.file).filter(Boolean);
    }

    try {
      let result;

      if (editingNewsId) {
        // Update existing news article
        result = await newsApi.update(
          apiClient,
          editingNewsId,
          newsData,
          mediaFiles,
          coverFile
        );

        // Show success modal for update
        setSuccessModal({
          isOpen: true,
          type: "updated",
        });
      } else {
        // Create new news article
        result = await newsApi.create(
          apiClient,
          newsData,
          mediaFiles,
          coverFile
        );

        // Show success modal based on whether it's draft or published
        setSuccessModal({
          isOpen: true,
          type: isDraft ? "draft" : "published",
        });

        // Reset form if published and not editing
        if (!isDraft) {
          setFormData({
            title: "",
            subtitle: "",
            bodyText: "",
            tags: [],
            coverImageName: "",
            isDraft: true,
            isActive: false,
          });
          // Clear the editors
          if (subtitleRef.current) subtitleRef.current.innerHTML = "";
          if (bodyTextRef.current) bodyTextRef.current.innerHTML = "";
          setUploadedFiles([]);
          setErrors({});
        }
      }
    } catch (error) {
      // Handle different types of errors
      let errorMessage = "Failed to save news article. Please try again.";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (status === 403) {
          errorMessage = "You do not have permission to perform this action.";
        } else if (status === 400) {
          // More detailed error for 400 status
          if (data?.message) {
            errorMessage = `Invalid data: ${data.message}`;
          } else if (data?.errors) {
            errorMessage = `Validation errors: ${JSON.stringify(data.errors)}`;
          } else if (data?.error) {
            errorMessage = `Error: ${data.error}`;
          } else {
            errorMessage = `Invalid data provided. Server response: ${JSON.stringify(
              data
            )}`;
          }
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        console.error("API Error Response:", data);
      } else if (error.request) {
        // Network error
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setErrors({ general: errorMessage });
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success modal handlers
  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, type: "published" });
  };

  const handleRedirectToDashboard = () => {
    setSuccessModal({ isOpen: false, type: "published" });
    if (editingNewsId) {
      setEditingNewsId(null); // Exit edit mode
    }
    if (onRedirectToDashboard) {
      onRedirectToDashboard();
    }
  };

  // File upload handlers
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file?.name || "Unknown",
      size: file?.size || 0,
      type: file?.type || "unknown",
      progress: 0,
      completed: false,
      isUploading: true,
      makeCoverImage: false,
      caption: "",
      uploadedUrl: null,
    }));

    setUploadedFiles((prev) => [...(prev || []), ...newFiles]);

    // Simulate upload process
    newFiles.forEach((fileObj) => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          (prev || []).map((f) =>
            f.id === fileObj.id && f.progress < 90
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles((prev) =>
          (prev || []).map((f) =>
            f.id === fileObj.id
              ? { ...f, progress: 100, completed: true, isUploading: false }
              : f
          )
        );
      }, 2000);
    });
  };

  const handleFileRemove = (fileId) => {
    setUploadedFiles((prev) => (prev || []).filter((f) => f.id !== fileId));
  };

  const handleFileUpdate = (fileId, updates) => {
    if (!updates || typeof updates !== "object") return;

    setUploadedFiles((prev) =>
      (prev || []).map((f) => (f.id === fileId ? { ...f, ...updates } : f))
    );
  };

  // Tags handlers
  const handleTagsChange = (newTags) => {
    if (!Array.isArray(newTags)) return;

    setFormData((prev) => ({
      ...prev,
      tags: newTags,
    }));
  };

  // Safe form data update
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show loading state when loading news for editing
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading news article...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingNewsId ? "Edit News Article" : "Create News Article"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload your News information and Images and Media here.
            </p>
          </div>

          <div className="p-6">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={16} />
                  <span className="text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Show authentication warning if no API client */}
            {!apiClient && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle size={16} />
                  <span className="text-sm">
                    Please log in to save news articles.
                  </span>
                </div>
              </div>
            )}

            {/* Title Section */}
            <div className="grid grid-cols-4 gap-6 items-center mb-6">
              <label className="text-sm font-medium text-gray-700">
                Title *
              </label>
              <div className="col-span-3">
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="Enter news title"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mb-6"></div>

            {/* Subtitle Section */}
            <div className="grid grid-cols-4 gap-6 items-start mb-6">
              <label className="text-sm font-medium text-gray-700 pt-3">
                Subtitle *
              </label>
              <div className="col-span-3">
                <RichTextEditor
                  value={formData.subtitle || ""}
                  onChange={(content) =>
                    updateFormData("subtitle", content || "")
                  }
                  placeholder="Write a short subtitle..."
                  textRef={subtitleRef}
                  limit={SUBTITLE_LIMIT}
                  error={errors.subtitle}
                  minHeight="80px"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 mb-6"></div>

            {/* Body Text Section */}
            <div className="grid grid-cols-4 gap-6 items-start mb-6">
              <label className="text-sm font-medium text-gray-700 pt-3">
                Body Text *
              </label>
              <div className="col-span-3">
                <RichTextEditor
                  value={formData.bodyText || ""}
                  onChange={(content) =>
                    updateFormData("bodyText", content || "")
                  }
                  placeholder="Write your article content..."
                  textRef={bodyTextRef}
                  limit={BODYTEXT_LIMIT}
                  error={errors.bodyText}
                  minHeight="120px"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 mb-6"></div>

            {/* File Upload Section */}
            <div className="grid grid-cols-4 gap-6 items-start mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Upload Images
                </label>
                <div className="text-xs text-gray-500 mt-1">
                  Upload images for media and cover image.
                </div>
              </div>
              <div className="col-span-3">
                <FileUploadComponent
                  uploadedFiles={uploadedFiles || []}
                  onFileUpload={handleFileUpload}
                  onFileRemove={handleFileRemove}
                  onFileUpdate={handleFileUpdate}
                />
              </div>
            </div>

            {/* Cover Image Name */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-6 items-center mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Cover Image
                </label>
                <div className="col-span-3">
                  <select
                    value={formData.coverImageName || ""}
                    onChange={(e) =>
                      updateFormData("coverImageName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto-select (first image)</option>
                    {uploadedFiles
                      .filter((f) => f.completed)
                      .map((file) => (
                        <option key={file.id} value={file.name}>
                          {file.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose which image to use as cover, or leave blank to use
                    the first uploaded image.
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 mb-6"></div>

            {/* Tags Section */}
            <div className="grid grid-cols-4 gap-6 items-start mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tags (Maximum 20) *
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Add tags to help categorize your news article.
                </p>
              </div>
              <div className="col-span-3">
                <TagsManager
                  tags={formData.tags || []}
                  onTagsChange={handleTagsChange}
                  error={errors.tags}
                  maxTags={TAG_LIMIT}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              {editingNewsId && (
                <button
                  onClick={() => setEditingNewsId(null)}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={() => handleSave(true)}
                disabled={isSubmitting || !apiClient}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSubmitting || !apiClient}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting
                  ? "Publishing..."
                  : editingNewsId
                  ? "Update & Publish"
                  : "Publish News"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        type={successModal.type}
        onClose={handleCloseModal}
        onRedirectToDashboard={handleRedirectToDashboard}
      />
    </>
  );
};

export default CreateNewsForm;
