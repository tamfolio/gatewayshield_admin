import React, { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import RichTextEditor from './components/RichTextEditor';
import FileUploadComponent from './components/FileUploadComponent';
import TagsManager from './components/TagsManager';
import { useApiClient, newsApi } from '../../../../Utils/apiClient'; // Updated import

const CreateNewsForm = ({ editingNewsId, setEditingNewsId }) => {
  const apiClient = useApiClient(); // Use the API client hook
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',      
    bodyText: '',      
    tags: [],
    coverImageName: '', 
    isDraft: true,     
    isActive: false   
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subtitleRef = useRef(null);
  const bodyTextRef = useRef(null);

  const TITLE_LIMIT = 100, SUBTITLE_LIMIT = 150, BODYTEXT_LIMIT = 2000, TAG_LIMIT = 20;

  const getTextContent = (el) => {
    if (!el) return '';
    return el.textContent || el.innerText || '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if API client is available (implies user is authenticated)
    if (!apiClient) {
      newErrors.general = 'You must be logged in to save news articles.';
      setErrors(newErrors);
      return false;
    }
    
    // Title validation
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > TITLE_LIMIT) {
      newErrors.title = `Max ${TITLE_LIMIT} chars`;
    }
    
    // Subtitle validation  
    if (!getTextContent(subtitleRef.current)) {
      newErrors.subtitle = 'Subtitle required';
    }
    
    // Body text validation
    if (!getTextContent(bodyTextRef.current)) {
      newErrors.bodyText = 'Body text required';
    }
    
    // Tags validation
    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = 'At least one tag required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (isDraft = true) => {
    if (!validateForm()) {
      alert('Please fix validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Build form data matching API expectations
    const newsData = {
      title: formData.title?.trim() || '',
      subtitle: getTextContent(subtitleRef.current) || '',
      bodyText: getTextContent(bodyTextRef.current) || '',
      tags: formData.tags || [],
      isDraft: isDraft,
      isActive: !isDraft
    };

    // Handle cover image - map to API field name
    if (formData.coverImageName?.trim()) {
      newsData.coverImageFileName = formData.coverImageName.trim();
    }

    // Add cover image from uploaded files if not manually set
    const completedFiles = (uploadedFiles || []).filter(f => f?.completed);
    if (completedFiles.length > 0) {
      // Set coverImageFileName to first cover image or first image
      const coverImage = completedFiles.find(f => f.makeCoverImage) || completedFiles[0];
      if (coverImage && !formData.coverImageName) {
        newsData.coverImageFileName = coverImage.name;
      }
      
      // Add caption from cover image
      if (coverImage?.caption) {
        newsData.caption = coverImage.caption;
      }
    }

    // Enhanced debugging
    console.log('=== DEBUG: Form Data Before API Call ===');
    console.log('Raw formData:', formData);
    console.log('Subtitle ref content:', getTextContent(subtitleRef.current));
    console.log('Body text ref content:', getTextContent(bodyTextRef.current));
    console.log('Uploaded files:', uploadedFiles);
    console.log('Final newsData being sent:', JSON.stringify(newsData, null, 2));
    console.log('Data types:', {
      title: typeof newsData.title,
      subtitle: typeof newsData.subtitle, 
      bodyText: typeof newsData.bodyText,
      tags: Array.isArray(newsData.tags) ? 'array' : typeof newsData.tags,
      isDraft: typeof newsData.isDraft,
      isActive: typeof newsData.isActive,
      coverImageFileName: typeof newsData.coverImageFileName,
      caption: typeof newsData.caption
    });

    try {
      let result;
      
      // The API might expect data wrapped in an object
      // Based on the error "Expected object, received null", we'll try different structures
      const wrappedNewsData = {
        news: newsData  // Try wrapping in 'news' object first
      };
      
      console.log('Trying wrapped data structure:', JSON.stringify(wrappedNewsData, null, 2));
      
      if (editingNewsId) {
        // Update existing news article
        result = await newsApi.update(apiClient, editingNewsId, wrappedNewsData);
        alert('News article updated successfully!');
      } else {
        // Create new news article - try direct data first, then wrapped if it fails
        try {
          result = await newsApi.create(apiClient, newsData);
        } catch (directError) {
          console.log('Direct data failed, trying wrapped structure...');
          result = await newsApi.create(apiClient, wrappedNewsData);
        }
        alert(isDraft ? 'Draft saved successfully!' : 'News article published successfully!');
      }

      console.log('API Response:', result);

      // Reset form if published and not editing
      if (!isDraft && !editingNewsId) {
        setFormData({ 
          title: '', 
          subtitle: '', 
          bodyText: '', 
          tags: [], 
          coverImageName: '',
          isDraft: true,
          isActive: false
        });
        // Clear the editors
        if (subtitleRef.current) subtitleRef.current.innerHTML = '';
        if (bodyTextRef.current) bodyTextRef.current.innerHTML = '';
        setUploadedFiles([]);
        setErrors({});
      }

    } catch (error) {
      console.error('=== DEBUG: Full Error Details ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error request:', error.request);
      console.error('Error message:', error.message);
      
      // Handle different types of errors
      let errorMessage = 'Failed to save news article. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (status === 400) {
          // More detailed error for 400 status
          if (data?.message) {
            errorMessage = `Invalid data: ${data.message}`;
          } else if (data?.errors) {
            errorMessage = `Validation errors: ${JSON.stringify(data.errors)}`;
          } else if (data?.error) {
            errorMessage = `Error: ${data.error}`;
          } else {
            errorMessage = `Invalid data provided. Server response: ${JSON.stringify(data)}`;
          }
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        console.error('API Error Response:', data);
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrors({ general: errorMessage });
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handlers
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file?.name || 'Unknown',
      size: file?.size || 0,
      type: file?.type || 'unknown',
      progress: 0,
      completed: false,
      isUploading: true,
      makeCoverImage: false,
      caption: '',
      uploadedUrl: null
    }));
    
    setUploadedFiles(prev => [...(prev || []), ...newFiles]);
    
    // Simulate upload process
    newFiles.forEach(fileObj => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => (prev || []).map(f => 
          f.id === fileObj.id && f.progress < 90
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 200);
      
      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles(prev => (prev || []).map(f => 
          f.id === fileObj.id 
            ? { ...f, progress: 100, completed: true, isUploading: false }
            : f
        ));
      }, 2000);
    });
  };

  const handleFileRemove = (fileId) => {
    setUploadedFiles(prev => (prev || []).filter(f => f.id !== fileId));
  };

  const handleFileUpdate = (fileId, updates) => {
    if (!updates || typeof updates !== 'object') return;
    
    setUploadedFiles(prev => (prev || []).map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  // Tags handlers
  const handleTagsChange = (newTags) => {
    if (!Array.isArray(newTags)) return;
    
    setFormData(prev => ({ 
      ...prev, 
      tags: newTags 
    }));
  };

  // Safe form data update
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create News Article</h2>
          <p className="text-sm text-gray-600 mt-1">Upload your News information and Images and Media here.</p>
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
                <span className="text-sm">Please log in to save news articles.</span>
              </div>
            </div>
          )}

          {/* Title Section */}
          <div className="grid grid-cols-4 gap-6 items-center mb-6">
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <div className="col-span-3">
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter news title"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
          </div>

          <div className="border-t border-gray-200 mb-6"></div>

          {/* Subtitle Section */}
          <div className="grid grid-cols-4 gap-6 items-start mb-6">
            <label className="text-sm font-medium text-gray-700 pt-3">Subtitle *</label>
            <div className="col-span-3">
              <RichTextEditor
                value={formData.subtitle || ''}
                onChange={(content) => updateFormData('subtitle', content || '')}
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
            <label className="text-sm font-medium text-gray-700 pt-3">Body Text *</label>
            <div className="col-span-3">
              <RichTextEditor
                value={formData.bodyText || ''}
                onChange={(content) => updateFormData('bodyText', content || '')}
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
              <label className="text-sm font-medium text-gray-700">Upload Images</label>
              <div className="text-xs text-gray-500 mt-1">Upload images for media and cover image.</div>
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
              <label className="text-sm font-medium text-gray-700">Cover Image</label>
              <div className="col-span-3">
                <select
                  value={formData.coverImageName || ''}
                  onChange={(e) => updateFormData('coverImageName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Auto-select (first image)</option>
                  {uploadedFiles.filter(f => f.completed).map((file) => (
                    <option key={file.id} value={file.name}>
                      {file.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose which image to use as cover, or leave blank to use the first uploaded image.
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
            <button
              onClick={() => handleSave(true)}
              disabled={isSubmitting || !apiClient}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSubmitting || !apiClient}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : (editingNewsId ? 'Update & Publish' : 'Publish News')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewsForm;