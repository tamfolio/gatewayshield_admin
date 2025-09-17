// src/Utils/apiClient.js - PRODUCTION VERSION (Debug removed)
import axios from "axios";
import { useMemo } from "react";
import useAccessToken from "./useAccessToken";

// Hard-coded API base URL
const BASE_URL = "https://admin-api.thegatewayshield.com/api/v1";

// Axios Client Generator
const createApiClient = (accessToken) => {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  client.interceptors.request.use(
    (config) => {
      console.log("[Request]", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data,
      });
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => {
      console.log("[Response]", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    (error) => {
      if (!error.response) {
        console.error("[API] Network error:", error.message);
      } else {
        const { status, data } = error.response;
        console.error(`[API] Error ${status}:`, {
          url: error.config?.url,
          fullURL: `${error.config?.baseURL}${error.config?.url}`,
          message: data?.message || error.message,
          data: data,
        });
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// React hook version
export const useApiClient = () => {
  const accessToken = useAccessToken();
  return useMemo(() => createApiClient(accessToken), [accessToken]);
};

// ========== SLA API  ==========
// UPDATED API Methods

export const slaApi = {
  // Ticket SLAs (already working)
  getTicketSlas: async (client) => {
    try {
      const response = await client.get("/settings/ticketSlas/all");
      return response.data;
    } catch (error) {
      console.error("❌ [SLA API] Failed to fetch ticket SLAs:", error);
      throw error;
    }
  },

  updateTicketSla: async (client, data) => {
    try {
      console.log("🚀 [SLA API] Updating ticket SLA with PATCH");
      console.log("📤 Request data:", data);

      // Expected: {"id": "01K13RGQ3Y70H7RBE2DHHFM89C", "sla": 6}
      const response = await client.patch(
        "/settings/incident/update-ticket-sla",
        data
      );

      console.log(
        "✅ [SLA API] Ticket SLA updated successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("❌ [SLA API] Failed to update ticket SLA:", error);
      throw error;
    }
  },

  // Incident SLAs
  getIncidentSlas: async (client) => {
    try {
      const response = await client.get("/settings/incidentSlas/all");
      return response.data;
    } catch (error) {
      console.error("❌ [SLA API] Failed to fetch incident SLAs:", error);
      throw error;
    }
  },

  // Main method - matches the working API screenshot
  manageResolutionSla: async (apiClient, data) => {
    console.log("🚀 [SLA API] Managing resolution SLA");
    console.log("📤 Request data:", data);

    try {
      const response = await apiClient.post(
        "/settings/incident/manage-resolution-sla",
        data
      );
      console.log("✅ [SLA API] Success:", response.data);
      return response;
    } catch (error) {
      console.error("❌ [SLA API] Failed to manage resolution SLA:", error);
      console.error("❌ [SLA API] Request data that failed:", data);
      console.error("❌ [SLA API] Response data:", error.response?.data);
      throw error;
    }
  },

  // Create new incident
  createIncident: async (client, data) => {
    try {
      console.log("🚀 [INCIDENT API] Creating incident with CORRECT endpoint");

      const requestData = {
        incidentName: data.name,
        resolutionSla: parseInt(data.time),
      };

      console.log("📤 Request data:", requestData);
      const response = await client.post("/settings/incident/new", requestData);

      console.log("✅ [INCIDENT API] SUCCESS:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [INCIDENT API] Failed to create incident:", error);
      throw error;
    }
  },
};

// Closure Reasons API (already correct)
export const closureReasonsApi = {
  getClosureReasons: async (client) => {
    try {
      const response = await client.get("/incident/closureReasons/all");
      return response.data;
    } catch (error) {
      console.error("❌ [CLOSURE API] Failed to fetch closure reasons:", error);
      throw error;
    }
  },

  createClosureReason: async (client, data) => {
    try {
      console.log(
        "🚀 [CLOSURE API] Creating closure reason with CORRECT endpoint"
      );

      // EXACT format from backend: {"newClosureReason": "Sigh"}
      const requestData = {
        newClosureReason: data.reason,
      };

      console.log("📤 Request data:", requestData);

      // EXACT endpoint from backend: /settings/closureReason/new
      const response = await client.post(
        "/settings/closureReason/new",
        requestData
      );

      console.log("✅ [CLOSURE API] SUCCESS:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [CLOSURE API] Failed to create closure reason:", error);
      console.error("❌ Error details:", error.response?.data);
      throw error;
    }
  },
};

// Reusable FormData Builder for News
const buildNewsFormData = (data, mediaFiles = [], coverFile = null) => {
  const apiData = {
    title: data.title,
    subtitle: data.subtitle,
    bodyText: data.bodyText,
    tags: data.tags || [],
    isDraft: Boolean(data.isDraft),
    isActive: Boolean(data.isActive),
    coverImageFileName: data.coverImageFileName || "",
  };

  if (data.caption) {
    apiData.caption = data.caption;
  }

  console.log(
    "[API FORMAT] Sending data with correct validation format:",
    JSON.stringify(apiData, null, 2)
  );

  const formData = new FormData();
  formData.append("data", JSON.stringify(apiData));

  mediaFiles.forEach((file) => {
    if (file instanceof File) formData.append("media", file);
  });

  if (coverFile instanceof File) {
    formData.append("cover", coverFile);
  }

  return formData;
};

// ==========  RESOURCES/HELP HUB API ==========

export const resourcesApi = {
  getAll: async (client, page = 1, size = 10, filters = {}) => {
    try {
      console.log("🚀 [RESOURCES API] Fetching all resources");
      console.log("📋 Parameters:", { page, size, filters });

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await client.get(`/help/all?${params.toString()}`);

      console.log("✅ [RESOURCES API] Resources fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [RESOURCES API] Failed to fetch resources:", error);
      throw error;
    }
  },

  getCategories: async (client) => {
    try {
      console.log("📁 [RESOURCES API] Fetching categories");
      const response = await client.get("/help/get-categories");
      console.log("✅ [RESOURCES API] Categories fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [RESOURCES API] Failed to fetch categories:", error);
      throw error;
    }
  },

  getTags: async (client) => {
    try {
      console.log("🏷️ [RESOURCES API] Fetching tags");
      const response = await client.get("/help/get-tags");
      console.log("✅ [RESOURCES API] Tags fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [RESOURCES API] Failed to fetch tags:", error);
      throw error;
    }
  },

  create: async (client, resourceData, mediaFile = null) => {
    try {
      console.log("🚀 [RESOURCES API] Creating resource");
      console.log("📤 Resource data:", JSON.stringify(resourceData, null, 2));

      const requiredFields = [
        "title",
        "description",
        "categoryId",
        "subCategoryId",
      ];
      const missingFields = requiredFields.filter(
        (field) =>
          !resourceData.hasOwnProperty(field) ||
          !resourceData[field]?.toString().trim()
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const formData = new FormData();

      const apiData = {
        title: resourceData.title,
        description: resourceData.description,
        caption: resourceData.caption || null,
        isPublished: Boolean(resourceData.isPublished),
        tags: resourceData.tags || [],
        categoryId: resourceData.categoryId,
        subCategoryId: resourceData.subCategoryId,
      };

      console.log(
        "📋 [RESOURCES API] Prepared API data:",
        JSON.stringify(apiData, null, 2)
      );

      formData.append("data", JSON.stringify(apiData));

      if (mediaFile instanceof File) {
        formData.append("file", mediaFile);
      }

      const response = await client.post("/help/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ [RESOURCES API] Resource created successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [RESOURCES API] Failed to create resource:", error);
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      const enhancedError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create resource"
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;

      throw enhancedError;
    }
  },

  update: async (apiClient, resourceId, data, file = null) => {
    try {
      console.log(
        "🔄 [RESOURCES API] Updating resource with PATCH (FormData format)"
      );
      console.log("🆔 Resource ID:", resourceId);
      console.log("📤 Update data:", data);
      console.log("📎 File:", file);

      const endpoint = `/help/edit/${resourceId}`;
      console.log("🔗 Using endpoint:", endpoint);

      // ALWAYS use FormData (like your curl command)
      const formData = new FormData();

      // Add the data as a JSON string in the 'data' field
      formData.append("data", JSON.stringify(data));
      console.log("📝 Added data field as JSON string:", JSON.stringify(data));

      // Add file if provided
      if (file) {
        formData.append("file", file);
        console.log("📎 Added file:", file.name);
      }

      console.log("🔄 Making PATCH request with FormData...");
      const response = await apiClient.patch(endpoint, formData);

      console.log("✅ [RESOURCES API] Resource updated successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [RESOURCES API] Failed to update resource:", error);
      console.error("❌ Error response:", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update resource"
      );
    }
  },

  delete: async (client, resourceId) => {
    try {
      console.log("🗑️ [RESOURCES API] Deleting resource");
      console.log("🆔 Resource ID:", resourceId);

      if (!resourceId || resourceId.toString().trim() === "") {
        throw new Error("Resource ID is required for delete operation");
      }

      const response = await client.delete(`/help/delete/${resourceId}`);

      console.log("✅ [RESOURCES API] Resource deleted successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [RESOURCES API] Failed to delete resource:", error);
      throw error;
    }
  },

  getById: async (client, resourceId) => {
    try {
      console.log("🎯 [RESOURCES API] Fetching resource by ID");
      console.log("🆔 Resource ID:", resourceId);

      if (!resourceId || resourceId.toString().trim() === "") {
        throw new Error("Resource ID is required");
      }

      const response = await client.get(`/help/${resourceId}`);

      console.log("✅ [RESOURCES API] Resource fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [RESOURCES API] Failed to fetch resource:", error);
      throw error;
    }
  },

  togglePublish: async (client, resourceId) => {
    try {
      console.log("🔄 [RESOURCES API] Toggling publish status");
      console.log("🆔 Resource ID:", resourceId);

      if (!resourceId || resourceId.toString().trim() === "") {
        throw new Error("Resource ID is required for toggle publish operation");
      }

      const response = await client.patch(`/help/toggle-publish/${resourceId}`);

      console.log("✅ [RESOURCES API] Publish status toggled successfully");
      return response.data;
    } catch (error) {
      console.error(
        "❌ [RESOURCES API] Failed to toggle publish status:",
        error
      );
      throw error;
    }
  },
};

export const resourcesUtils = {
  transformResourcesData: (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((item) => {
      const categoryName =
        item.category?.name || item.categoryName || "Unknown Category";
      const subCategoryName =
        item.subCategory?.name ||
        item.subCategoryName ||
        "Unknown Sub-Category";

      return {
        id: item.id || `res_${Math.random().toString(36).substr(2, 9)}`,
        title: item.title || "Untitled",
        category: categoryName,
        subCategory: subCategoryName,
        description: item.description || "",
        caption: item.caption || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        submissionDate: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
        status:
          item.isPublished === 1 || item.isPublished === true
            ? "Published"
            : "Draft",
        isPublished: Boolean(
          item.isPublished === 1 || item.isPublished === true
        ),
        isToday: item.createdAt
          ? new Date(item.createdAt).toDateString() ===
            new Date().toDateString()
          : false,
        categoryId: item.categoryId || item.category?.id,
        subCategoryId: item.subCategoryId || item.subCategory?.id,
        fileUrl: item.mediaUrl?.[0] || null,
        mediaUrls: Array.isArray(item.mediaUrl) ? item.mediaUrl : [],
        originalData: item,
      };
    });
  },

  transformCategoriesData: (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((category) => ({
      id: category.id,
      name: category.name || "Unknown Category",
      description: category.description || "",
      subCategories: category.subCategories
        ? category.subCategories.map((sub) => ({
            id: sub.id,
            name: sub.name || "Unknown Sub-Category",
            description: sub.description || "",
          }))
        : [],
      ...category,
    }));
  },

  transformTagsData: (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((tag) => ({
      id: tag.id || tag,
      name: tag.name || tag,
      value: tag.value || tag.name || tag,
      ...tag,
    }));
  },

  validateResourceData: (resourceData, isUpdate = false) => {
    const errors = [];

    if (!resourceData.title || !resourceData.title.trim()) {
      errors.push("Title is required");
    } else if (resourceData.title.length > 200) {
      errors.push("Title must be 200 characters or less");
    }

    if (!resourceData.description || !resourceData.description.trim()) {
      errors.push("Description is required");
    } else if (resourceData.description.length > 1000) {
      errors.push("Description must be 1000 characters or less");
    }

    if (!resourceData.categoryId || !resourceData.categoryId.trim()) {
      errors.push("Category is required");
    }

    if (!resourceData.subCategoryId || !resourceData.subCategoryId.trim()) {
      errors.push("Sub-category is required");
    }

    if (resourceData.tags && !Array.isArray(resourceData.tags)) {
      errors.push("Tags must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  },

  formatResourceData: (formData, isUpdate = false) => {
    return {
      title: formData.title?.trim() || "",
      description: formData.description?.trim() || "",
      caption: formData.caption?.trim() || null,
      categoryId: formData.categoryId || "",
      subCategoryId: formData.subCategoryId || "",
      tags: formData.tags || [],
      isPublished: Boolean(formData.isPublished),
    };
  },

  extractApiResponseData: (response) => {
    let data = [];
    let pagination = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    };

    if (response && response.data) {
      const responseData = response.data;

      if (responseData.data && Array.isArray(responseData.data)) {
        data = responseData.data;

        if (responseData.pagination) {
          pagination = { ...pagination, ...responseData.pagination };
        }
      } else if (Array.isArray(responseData)) {
        data = responseData;
        pagination.total = responseData.length;
      }
    } else if (Array.isArray(response)) {
      data = response;
      pagination.total = response.length;
    }

    return { data, pagination };
  },
};

// ========== NEWS API ==========

export const newsApi = {
  create: async (client, newsData, mediaFiles, coverFile) => {
    const formData = buildNewsFormData(newsData, mediaFiles, coverFile);
    const response = await client.post("/adminTools/news/new", formData);
    return response.data;
  },

  update: async (client, newsId, newsData, mediaFiles, coverFile) => {
    console.log("[NEWS UPDATE] Using correct API format...");
    console.log(
      "[NEWS UPDATE] Original newsData:",
      JSON.stringify(newsData, null, 2)
    );

    try {
      const formData = buildNewsFormData(newsData, mediaFiles, coverFile);
      const response = await client.patch(
        `/adminTools/news/${newsId}`,
        formData
      );
      console.log("[NEWS UPDATE] SUCCESS with correct API format!");
      return response.data;
    } catch (error) {
      console.error("[NEWS UPDATE] Failed with error:", error.response?.data);
      throw error;
    }
  },

  delete: async (client, newsId) => {
    const response = await client.delete(`/adminTools/news/${newsId}`);
    return response.data;
  },

  getAll: async (client, page = 1, size = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.author) {
      params.append("author", filters.author);
    }

    const response = await client.get(
      `/adminTools/news/all?${params.toString()}`
    );
    return response.data;
  },

  getOne: async (client, newsId) => {
    const response = await client.get(`/adminTools/news/${newsId}`);
    return response.data;
  },
};

// ========== FEEDBACK APIS ==========

export const caseReviewFeedbackApi = {
  getAllFeedbacks: async (client, page = 1, size = 10, filters = {}) => {
    try {
      console.log("🚀 [CASE REVIEW API] Fetching all feedbacks");
      console.log("📋 Parameters:", { page, size, filters });

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await client.get(
        `/feedback/caseReview/all-feedbacks?${params.toString()}`
      );

      console.log("✅ [CASE REVIEW API] Feedbacks fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [CASE REVIEW API] Failed to fetch feedbacks:", error);
      throw error;
    }
  },

  getDashboardStats: async (client, filters = {}) => {
    try {
      console.log("📊 [CASE REVIEW API] Fetching dashboard stats");

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = `/feedback/caseReview/dashboard-stats${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await client.get(url);

      console.log("✅ [CASE REVIEW API] Dashboard stats fetched successfully");
      return response.data;
    } catch (error) {
      console.error(
        "❌ [CASE REVIEW API] Failed to fetch dashboard stats:",
        error
      );
      throw error;
    }
  },

  getStations: async (client) => {
    try {
      console.log("🏢 [CASE REVIEW API] Fetching stations");
      const response = await client.get("/feedback/caseReview/stations");
      console.log("✅ [CASE REVIEW API] Stations fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [CASE REVIEW API] Failed to fetch stations:", error);
      throw error;
    }
  },

  getCrimeTypes: async (client) => {
    try {
      console.log("🚨 [CASE REVIEW API] Fetching crime types");
      const response = await client.get("/feedback/caseReview/crime-types");
      console.log("✅ [CASE REVIEW API] Crime types fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [CASE REVIEW API] Failed to fetch crime types:", error);
      throw error;
    }
  },

  getSourceChannels: async (client) => {
    try {
      console.log("📡 [CASE REVIEW API] Fetching source channels");
      const response = await client.get("/feedback/caseReview/source-channel");
      console.log("✅ [CASE REVIEW API] Source channels fetched successfully");
      return response.data;
    } catch (error) {
      console.error(
        "❌ [CASE REVIEW API] Failed to fetch source channels:",
        error
      );
      throw error;
    }
  },
};

export const generalFeedbackApi = {
  getDashboardStats: async (client, page = 1, size = 10) => {
    try {
      console.log("📊 [GENERAL FEEDBACK API] Fetching dashboard stats");
      console.log("📋 Parameters:", { page, size });

      const response = await client.get(
        "/feedback/generalFeedback/dashboard-stats"
      );

      console.log(
        "✅ [GENERAL FEEDBACK API] Dashboard stats fetched successfully"
      );
      console.log("📊 Response keys:", Object.keys(response.data || {}));
      console.log(
        "📋 Response structure:",
        JSON.stringify(response.data, null, 2)
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ [GENERAL FEEDBACK API] Failed to fetch dashboard stats:",
        error
      );
      throw error;
    }
  },

  getAllFeedbacks: async (client, page = 1, size = 10) => {
    try {
      console.log("🚀 [GENERAL FEEDBACK API] Fetching all feedbacks");
      console.log("📋 Parameters:", { page, size });

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());

      const response = await client.get(
        `/feedback/generalFeedback/all-feedbacks?${params.toString()}`
      );

      console.log("✅ [GENERAL FEEDBACK API] Feedbacks fetched successfully");
      console.log("📊 Response keys:", Object.keys(response.data || {}));
      console.log(
        "📋 Response structure:",
        JSON.stringify(response.data, null, 2)
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ [GENERAL FEEDBACK API] Failed to fetch feedbacks:",
        error
      );
      throw error;
    }
  },

  deleteFeedback: async (client, feedbackId) => {
    try {
      console.log("🗑️ [GENERAL FEEDBACK API] Deleting feedback");
      console.log("🎯 Feedback ID:", feedbackId);

      if (!feedbackId || feedbackId.toString().trim() === "") {
        throw new Error("Feedback ID is required for delete operation");
      }

      const deletePayload = { feedbackId };
      console.log("📤 Delete payload:", JSON.stringify(deletePayload, null, 2));

      const response = await client.delete(
        "/feedback/generalFeedback/delete-feedback",
        {
          data: deletePayload,
        }
      );

      console.log("✅ [GENERAL FEEDBACK API] Feedback deleted successfully");
      console.log("📥 Response:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "❌ [GENERAL FEEDBACK API] Failed to delete feedback:",
        error
      );
      throw error;
    }
  },

  publishFeedback: async (client, feedbackId) => {
    try {
      console.log("📢 [GENERAL FEEDBACK API] Publishing feedback");
      console.log("🎯 Feedback ID:", feedbackId);

      if (!feedbackId || feedbackId.toString().trim() === "") {
        throw new Error("Feedback ID is required for publish operation");
      }

      const publishPayload = { feedbackId };
      console.log(
        "📤 Publish payload:",
        JSON.stringify(publishPayload, null, 2)
      );

      const response = await client.post(
        "/feedback/generalFeedback/publish-feedback",
        publishPayload
      );

      console.log("✅ [GENERAL FEEDBACK API] Feedback published successfully");
      console.log("📥 Response:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "❌ [GENERAL FEEDBACK API] Failed to publish feedback:",
        error
      );
      throw error;
    }
  },
};

export const feedbackUtils = {
  transformGeneralFeedbackData: (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((item) => ({
      id: item.id || `fb_${Math.random().toString(36).substr(2, 9)}`,
      feedbackId: item.id || `fb_${Math.random().toString(36).substr(2, 9)}`,
      type: item.feedbackType || "Unknown",
      officer: item.officerName || "N/A",
      station: item.stationName || "Unknown Station",
      comment: item.comment || "-",
      date: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
      status: item.status || "pending",
      ...item,
    }));
  },

  transformCaseReviewFeedbackData: (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((item) => ({
      id:
        item.reportID ||
        item.id ||
        `cr_${Math.random().toString(36).substr(2, 9)}`,
      reportId:
        item.reportID ||
        item.id ||
        `cr_${Math.random().toString(36).substr(2, 9)}`,
      station: item.stationName || item.station || "Unknown Station",
      feedback:
        item.comments ||
        item.feedback ||
        item.feedbackText ||
        item.comment ||
        "-",
      rating: item.rating || 0,
      date:
        item.dateclosed ||
        item.date ||
        item.createdAt ||
        item.dateClosed ||
        "N/A",
      ...item,
    }));
  },

  transformGeneralFeedbackDashboard: (apiData) => {
    if (!apiData) return null;

    return {
      averageOfficerRating: apiData.averageOfficerRating || 0,
      averageStationRating: apiData.averageStationRating || 0,

      topPerformingOfficers: (apiData.topOfficers || []).map((officer) => ({
        name: officer.officerName || "Unknown Officer",
        value: parseFloat(officer.avgRating || 0),
      })),

      bottomPerformingOfficers: (apiData.bottomOfficers || []).map(
        (officer) => ({
          name: officer.officerName || "Unknown Officer",
          value: parseFloat(officer.avgRating || 0),
        })
      ),

      topPerformingStations: (apiData.topStations || []).map((station) => ({
        name: station.stationName || "Unknown Station",
        value: parseFloat(station.avgRating || 0),
      })),

      bottomPerformingStations: (apiData.bottomStations || []).map(
        (station) => ({
          name: station.stationName || "Unknown Station",
          value: parseFloat(station.avgRating || 0),
        })
      ),
    };
  },

  extractApiResponseData: (response) => {
    let data = [];
    let pagination = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    };

    if (response && response.data) {
      const responseData = response.data;

      if (responseData.data && Array.isArray(responseData.data)) {
        data = responseData.data;

        if (responseData.pagination) {
          pagination = { ...pagination, ...responseData.pagination };
        }
      } else if (Array.isArray(responseData)) {
        data = responseData;
        pagination.total = responseData.length;
      }
    }

    return { data, pagination };
  },
};

// ========== BROADCAST API ==========

export const broadcastApi = {
  create: async (apiClient, broadcastData) => {
    try {
      console.log("🔍 BROADCAST API - Received data:", JSON.stringify(broadcastData, null, 2));
      
      // FIX: Convert "ALL" string to null before validation
      if (broadcastData.lgaId === "ALL") {
        broadcastData.lgaId = null;
        console.log("🔧 FIXED: Converted lgaId from 'ALL' to null");
      }
      
      console.log("🚀 [BROADCAST API] Creating broadcast");
      console.log("📤 Payload:", JSON.stringify(broadcastData, null, 2));


      const requiredFields = ["title", "body", "alertType"];
      const missingFields = requiredFields.filter(
        (field) =>
          !broadcastData.hasOwnProperty(field) ||
          !broadcastData[field]?.toString().trim()
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Missing required fields for create: ${missingFields.join(", ")}`
        );
      }

      const response = await apiClient.post(
        "/adminTools/broadcast/create-broadcast",
        broadcastData
      );

      console.log("✅ [BROADCAST API] Broadcast created successfully");
      console.log("📥 Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to create broadcast");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      const enhancedError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create broadcast"
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;

      throw enhancedError;
    }
  },

  edit: async (apiClient, editData) => {
    try {
      console.log("🔄 [BROADCAST API] Editing broadcast");
      console.log("📤 Edit payload:", JSON.stringify(editData, null, 2));

      const requiredFields = [
        "title",
        "body",
        "alertType",
        "lgaId",
        "broadcastId",
      ];
      const missingFields = requiredFields.filter((field) => {
        if (field === "lgaId") {
          return !editData.hasOwnProperty(field);
        }
        return (
          !editData.hasOwnProperty(field) || !editData[field]?.toString().trim()
        );
      });

      if (missingFields.length > 0) {
        throw new Error(
          `Missing required fields for edit: ${missingFields.join(", ")}`
        );
      }

      if (
        !editData.broadcastId ||
        editData.broadcastId.toString().trim() === ""
      ) {
        throw new Error("Broadcast ID is required for edit operation");
      }

      const response = await apiClient.patch(
        "/adminTools/broadcast/edit-broadcast",
        editData
      );

      console.log("✅ [BROADCAST API] Broadcast edited successfully");
      console.log("📥 Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to edit broadcast");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        editData: editData,
      });

      const enhancedError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to edit broadcast"
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;

      throw enhancedError;
    }
  },

  getAll: async (apiClient, page = 1, limit = 10, filters = {}) => {
    try {
      console.log("📋 [BROADCAST API] Fetching broadcasts");
      console.log("🔍 Parameters:", { page, limit, filters });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const endpoint = `/adminTools/broadcast/all${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("🌐 Request URL:", endpoint);

      const response = await apiClient.get(endpoint);

      console.log("✅ [BROADCAST API] Broadcasts fetched successfully");
      console.log("📊 Response structure:", {
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : "No data",
      });

      return response.data;
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to fetch broadcasts");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      const enhancedError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch broadcasts"
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;

      throw enhancedError;
    }
  },

  delete: async (apiClient, broadcastId) => {
    try {
      console.log("🗑️ [BROADCAST API] Deleting broadcast");
      console.log("🎯 Broadcast ID:", broadcastId);

      if (!broadcastId || broadcastId.toString().trim() === "") {
        throw new Error("Broadcast ID is required for delete operation");
      }

      const deletePayload = {
        broadcastId: broadcastId,
      };

      console.log("📤 Delete payload:", JSON.stringify(deletePayload, null, 2));

      const response = await apiClient.delete(
        "/adminTools/broadcast/delete-broadcast",
        {
          data: deletePayload,
        }
      );

      console.log("✅ [BROADCAST API] Broadcast deleted successfully");
      console.log("📥 Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to delete broadcast");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        broadcastId: broadcastId,
      });

      const enhancedError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete broadcast"
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;

      throw enhancedError;
    }
  },

  getAlertTypes: async (apiClient) => {
    try {
      console.log("🏷️ [BROADCAST API] Fetching alert types");

      const response = await apiClient.get("/adminTools/broadcast/alert-types");

      console.log("✅ [BROADCAST API] Alert types fetched successfully");
      console.log("📝 Alert types response:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to fetch alert types");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      console.log("🔄 Using fallback alert types");
      return [
        "Red Alert",
        "Yellow Alert",
        "Green Alert",
        "Blue Alert",
        "Weather",
      ];
    }
  },

  getStatistics: async (apiClient, filters = {}) => {
    try {
      console.log("📊 [BROADCAST API] Fetching broadcast statistics");
      console.log("🔍 Filters:", filters);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const endpoint = `/adminTools/broadcast/statistics${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiClient.get(endpoint);

      console.log("✅ [BROADCAST API] Statistics fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to fetch statistics");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        message: error.message,
      });

      return {
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0,
      };
    }
  },

  getById: async (apiClient, broadcastId) => {
    try {
      console.log("🎯 [BROADCAST API] Fetching broadcast by ID");
      console.log("🆔 Broadcast ID:", broadcastId);

      if (!broadcastId || broadcastId.toString().trim() === "") {
        throw new Error("Broadcast ID is required");
      }

      const response = await apiClient.get(
        `/adminTools/broadcast/${broadcastId}`
      );

      console.log("✅ [BROADCAST API] Broadcast fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ [BROADCAST API] Failed to fetch broadcast");
      console.error("🔍 Error details:", {
        status: error.response?.status,
        message: error.message,
        broadcastId: broadcastId,
      });

      const enhancedError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch broadcast"
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response;

      throw enhancedError;
    }
  },
};

export const broadcastUtils = {
  validateBroadcastData: (broadcastData, isEdit = false) => {
    const errors = [];

    if (!broadcastData.title || !broadcastData.title.trim()) {
      errors.push("Title is required");
    } else if (broadcastData.title.length > 100) {
      errors.push("Title must be 100 characters or less");
    }

    if (!broadcastData.body || !broadcastData.body.trim()) {
      errors.push("Message body is required");
    } else if (broadcastData.body.length > 500) {
      errors.push("Message body must be 500 characters or less");
    }

    if (!broadcastData.alertType || !broadcastData.alertType.trim()) {
      errors.push("Alert type is required");
    }

    if (
      isEdit &&
      (!broadcastData.broadcastId || !broadcastData.broadcastId.trim())
    ) {
      errors.push("Broadcast ID is required for edit operations");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  },

  formatBroadcastData: (formData, isEdit = false) => {
    const baseData = {
      title: formData.title?.trim() || "",
      body: formData.body?.trim() || "",
      alertType: formData.alertType || "",
      lgaId: formData.lgaId || null,
    };

    if (isEdit) {
      baseData.broadcastId = formData.broadcastId;
    }

    return baseData;
  },

  parseGetAllResponse: (response) => {
    let broadcasts = [];
    let pagination = {
      totalPages: 1,
      total: 0,
      currentPage: 1,
      hasNext: false,
      hasPrev: false,
    };

    if (response) {
      if (Array.isArray(response)) {
        broadcasts = response;
        pagination.total = response.length;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          broadcasts = response.data;
          pagination.total = response.data.length;
        } else if (response.data.broadcasts) {
          if (Array.isArray(response.data.broadcasts)) {
            broadcasts = response.data.broadcasts;
          } else if (
            response.data.broadcasts.data &&
            Array.isArray(response.data.broadcasts.data)
          ) {
            broadcasts = response.data.broadcasts.data;
            if (response.data.broadcasts.pagination) {
              pagination = {
                ...pagination,
                ...response.data.broadcasts.pagination,
              };
            }
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          broadcasts = response.data.data;
          if (response.data.pagination) {
            pagination = { ...pagination, ...response.data.pagination };
          }
        }

        if (response.totalPages) pagination.totalPages = response.totalPages;
        if (response.total) pagination.total = response.total;
        if (response.totalCount) pagination.total = response.totalCount;
      } else if (response.broadcasts && Array.isArray(response.broadcasts)) {
        broadcasts = response.broadcasts;
        if (response.totalPages) pagination.totalPages = response.totalPages;
        if (response.totalCount) pagination.total = response.totalCount;
      }
    }

    return { broadcasts, pagination };
  },
};

// ========== INCIDENT API ==========

export const incidentApi = {
  create: async (client, incidentData) => {
    const response = await client.post(
      "/adminTools/incident/create",
      incidentData
    );
    return response.data;
  },

  getAll: async (client, page = 1, size = 10) => {
    const response = await client.get(
      `/adminTools/incident/all?page=${page}&size=${size}`
    );
    return response.data;
  },

  getOne: async (client, incidentId) => {
    const response = await client.get(`/adminTools/incident/${incidentId}`);
    return response.data;
  },

  update: async (client, incidentId, incidentData) => {
    const response = await client.put(
      `/adminTools/incident/${incidentId}`,
      incidentData
    );
    return response.data;
  },

  delete: async (client, incidentId) => {
    const response = await client.delete(`/adminTools/incident/${incidentId}`);
    return response.data;
  },
};

// ========== AUDIT LOGS API ==========

export const auditLogsApi = {
  getAll: async (client, page = 1, size = 10, filters = {}) => {
    try {
      console.log("📋 [AUDIT LOGS API] Fetching audit logs");
      console.log("📊 Parameters:", { page, size, filters });

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());

      // Add filters - match your API's expected format
      if (filters.userRole && Array.isArray(filters.userRole) && filters.userRole.length > 0) {
        filters.userRole.forEach((role) => params.append("userRole", role));
      }

      if (filters.date) {
        params.append("date", filters.date);
      }

      if (filters.action) {
        params.append("action", filters.action);
      }

      const url = `/auditLogs/all?${params.toString()}`;
      console.log("🔗 API URL:", url);

      const response = await client.get(url);

      console.log("✅ [AUDIT LOGS API] Response received");
      console.log("📊 Response structure:", {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasDataDataData: !!response.data?.data?.data,
        hasPagination: !!response.data?.data?.pagination,
      });

      return response.data;
    } catch (error) {
      console.error("❌ [AUDIT LOGS API] Error:", error);
      console.error("🔍 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch audit logs"
      );
    }
  },

  // Extract roles dynamically from logs data
  extractRoles: (logsData) => {
    try {
      console.log("👥 [AUDIT LOGS API] Extracting roles from audit logs data");

      const rolesSet = new Set();

      if (Array.isArray(logsData)) {
        logsData.forEach((log) => {
          // Extract admin role
          if (log.admin?.role && log.admin.role.trim()) {
            rolesSet.add(log.admin.role.trim());
          }

          // Extract user role
          if (log.user?.role && log.user.role.trim()) {
            rolesSet.add(log.user.role.trim());
          }
        });
      }

      const roles = Array.from(rolesSet).sort();
      console.log("✅ [AUDIT LOGS API] Extracted roles from logs:", roles);

      return roles;
    } catch (error) {
      console.error("❌ [AUDIT LOGS API] Failed to extract roles:", error);
      return [];
    }
  },

  // Map audit log data according to API response structure
  mapLogData: (log) => {
    try {
      const timestamp = new Date(log.timestamp);
      
      return {
        logId: log.id,
        userRole: log.admin?.role || log.user?.role || "Unknown",
        userName: log.admin?.fullname || "Unknown User", 
        action: log.action,
        timestamp: log.timestamp,
        date: timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
        }),
        time: timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        originalLog: log,
      };
    } catch (error) {
      console.error("❌ [AUDIT LOGS API] Failed to map log data:", error);
      return {
        logId: log.id || 'unknown',
        userRole: "Unknown",
        userName: "Unknown User",
        action: log.action || "Unknown Action", 
        timestamp: log.timestamp,
        date: "Invalid Date",
        time: "Invalid Time",
        originalLog: log,
      };
    }
  },
};

export const auditLogsUtils = {
  // Transform log data using the new mapping
  transformLogData: (log) => {
    return auditLogsApi.mapLogData(log);
  },

  parseGetAllResponse: (response) => {
    console.log("🔄 [UTILS] Parsing API response");
    console.log("📊 Response type:", typeof response);
    console.log("📊 Response keys:", response ? Object.keys(response) : "null");

    let logs = [];
    let pagination = {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
      hasNext: false,
      hasPrev: false,
    };

    // Handle your API structure: { data: { data: [...], pagination: {...} } }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      logs = response.data.data;

      // Extract pagination info
      if (response.data.pagination) {
        pagination = {
          total: response.data.pagination.total || 0,
          totalPages: response.data.pagination.totalPages || 1,
          currentPage: response.data.pagination.currentPage || 1,
          pageSize: response.data.pagination.pageSize || 10,
          hasNext: !!response.data.pagination.nextPage,
          hasPrev: !!response.data.pagination.previousPage,
        };
      }
    }
    // Fallback for direct array response
    else if (Array.isArray(response)) {
      logs = response;
      pagination.total = response.length;
    }

    console.log("✅ [UTILS] Parsed response:", {
      logsCount: logs.length,
      pagination: pagination,
    });

    return { logs, pagination };
  },

  validateFilters: (filters) => {
    const validFilters = {};

    console.log("🔍 [UTILS] Validating filters:", filters);

    // Validate userRole filter
    if (filters.userRole && Array.isArray(filters.userRole) && filters.userRole.length > 0) {
      validFilters.userRole = filters.userRole.filter(role => role && role.trim());
      console.log("👤 [UTILS] Valid user roles:", validFilters.userRole);
    }

    // Validate date filter - convert to proper date format for API
    if (filters.timeStamp && filters.timeStamp.trim()) {
      try {
        const date = new Date(filters.timeStamp);
        if (!isNaN(date.getTime())) {
          // Send date in YYYY-MM-DD format to API
          validFilters.date = date.toISOString().split("T")[0];
          console.log("📅 [UTILS] Valid date filter:", validFilters.date);
        }
      } catch (error) {
        console.error("❌ [UTILS] Invalid date format:", filters.timeStamp);
      }
    }

    // Action filter
    if (filters.action && filters.action.trim()) {
      validFilters.action = filters.action.trim();
    }

    console.log("✅ [UTILS] Final validated filters:", validFilters);
    return validFilters;
  },

  formatDateForDisplay: (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("❌ [UTILS] Invalid date format:", dateString);
      return "Invalid Date";
    }
  },

  // Build URL search params for filters
  buildFilterParams: (filters) => {
    const params = new URLSearchParams();
    
    if (filters.userRole && filters.userRole.length > 0) {
      params.set('role', filters.userRole.join(','));
    }
    if (filters.timeStamp) {
      params.set('date', filters.timeStamp);
    }
    
    return params;
  },

  // Parse URL search params to filters
  parseFilterParams: (searchParams) => {
    const roleParam = searchParams.get('role');
    const dateParam = searchParams.get('date');
    
    return {
      userRole: roleParam ? roleParam.split(',') : [],
      timeStamp: dateParam || null,
    };
  },

  // Apply client-side filtering when API doesn't support full filtering
  applyClientSideFilters: (logs, filters) => {
    let filtered = [...logs];

    console.log("🔍 [UTILS] Applying client-side filters:", filters);
    console.log("📊 Starting with logs:", filtered.length);

    // Apply role filter
    if (filters.userRole && filters.userRole.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((log) => {
        const logRole = log.userRole || "";
        return filters.userRole.some(selectedRole =>
          logRole.toLowerCase().trim() === selectedRole.toLowerCase().trim()
        );
      });
      console.log(`👤 Role filter applied: ${beforeCount} → ${filtered.length} logs`);
    }

    // Apply date filter
    if (filters.timeStamp) {
      const beforeCount = filtered.length;
      const selectedDate = new Date(filters.timeStamp).toISOString().split('T')[0];

      filtered = filtered.filter((log) => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return selectedDate === logDate;
      });
      console.log(`📅 Date filter applied: ${beforeCount} → ${filtered.length} logs`);
    }

    console.log("✅ Final filtered count:", filtered.length);
    return filtered;
  },
};