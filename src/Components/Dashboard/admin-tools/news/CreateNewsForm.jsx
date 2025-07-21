import React, { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useApiClient, newsApi } from '../../../../Utils/apiClient';
import RichTextEditor from './components/RichTextEditor';
import FileUploadComponent from './components/FileUploadComponent';
import TagsManager from './components/TagsManager';

const CreateNewsForm = ({ editingNewsId, setEditingNewsId }) => {
  const apiClient = useApiClient();
  const [formData, setFormData] = useState({
    title: '',
    body: '', 
    subHeading: '',
    tags: [],
    alertType: '',
    lgaId: '',
    broadcastId: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subHeadingRef = useRef(null);
  const bodyTextRef = useRef(null);

  const TITLE_LIMIT = 100, SUB_HEADING_LIMIT = 150, BODY_TEXT_LIMIT = 2000, TAG_LIMIT = 20;

  const getTextContent = (el) => (el ? el.textContent || '' : '');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > TITLE_LIMIT) newErrors.title = `Max ${TITLE_LIMIT} chars`;
    if (!getTextContent(subHeadingRef.current)) newErrors.subHeading = 'Sub-heading required';
    if (!getTextContent(bodyTextRef.current)) newErrors.bodyText = 'Body required';
    if (formData.tags.length === 0) newErrors.tags = 'At least one tag';
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

    try {
      const apiData = {
        title: formData.title.trim(),
        body: bodyTextRef.current?.innerHTML || '',
        subHeading: subHeadingRef.current?.innerHTML || '',
        alertType: formData.alertType || '',
        lgaId: formData.lgaId || '',
        broadcastId: formData.broadcastId || '',
        tags: formData.tags,
        isDraft,
        media: uploadedFiles.filter(f => f.completed).map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          caption: f.caption,
          makeCoverImage: f.makeCoverImage
        }))
      };

      let response;
      if (editingNewsId) {
        response = await newsApi.update(apiClient, editingNewsId, apiData);
        alert('News article updated successfully!');
      } else {
        const createClient = apiClient;
        createClient.defaults.baseURL = createClient.defaults.baseURL.replace('/news', '/news/new');
        response = await createClient.post('/', apiData);
        alert(isDraft ? 'Draft saved successfully!' : 'News article published successfully!');
      }

      console.log('API Response:', response.data);

      if (!isDraft && !editingNewsId) {
        setFormData({ 
          title: '', 
          body: '', 
          subHeading: '', 
          tags: [], 
          alertType: '', 
          lgaId: '', 
          broadcastId: '' 
        });
        // Clear the editors
        if (subHeadingRef.current) subHeadingRef.current.innerHTML = '';
        if (bodyTextRef.current) bodyTextRef.current.innerHTML = '';
        setUploadedFiles([]);
        setErrors({});
      }

    } catch (error) {
      console.error('API Error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'An unexpected error occurred';
      
      setErrors({ general: errorMessage });
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handlers for FileUploadComponent
  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      completed: false,
      isUploading: true,
      makeCoverImage: false,
      caption: '',
      uploadedUrl: null
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload process
    newFiles.forEach(fileObj => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id && f.progress < 90
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 200);
      
      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, progress: 100, completed: true, isUploading: false }
            : f
        ));
      }, 2000);
    });
  };

  const handleFileRemove = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFileUpdate = (fileId, updates) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  // Tags handlers for TagsManager
  const handleTagsChange = (newTags) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
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

          {/* Title Section */}
          <div className="grid grid-cols-4 gap-6 items-center mb-6">
            <label className="text-sm font-medium text-gray-700">Header / Title *</label>
            <div className="col-span-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ransom Rape Case In Ogun State"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
          </div>

          <div className="border-t border-gray-200 mb-6"></div>

          {/* Sub-heading Section */}
          <div className="grid grid-cols-4 gap-6 items-start mb-6">
            <label className="text-sm font-medium text-gray-700 pt-3">Sub-Heading *</label>
            <div className="col-span-3">
              <RichTextEditor
                value={formData.subHeading}
                onChange={(content) => setFormData({ ...formData, subHeading: content })}
                placeholder="Write a short introduction..."
                textRef={subHeadingRef}
                limit={SUB_HEADING_LIMIT}
                error={errors.subHeading}
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
                value={formData.body}
                onChange={(content) => setFormData({ ...formData, body: content })}
                placeholder="Write your article content..."
                textRef={bodyTextRef}
                limit={BODY_TEXT_LIMIT}
                error={errors.bodyText}
                minHeight="120px"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 mb-6"></div>

          {/* File Upload Section */}
          <div className="grid grid-cols-4 gap-6 items-start mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Media</label>
              <div className="text-xs text-gray-500 mt-1">Upload files and link images and Media here.</div>
            </div>
            <div className="col-span-3">
              <FileUploadComponent
                uploadedFiles={uploadedFiles}
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                onFileUpdate={handleFileUpdate}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 mb-6"></div>

          {/* Tags Section */}
          <div className="grid grid-cols-4 gap-6 items-start mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tags (Maximum 20) *
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Tags can be useful if content in your post is commonly misspelled. Otherwise tags 
                play similar to hashtags.
              </p>
            </div>
            <div className="col-span-3">
              <TagsManager
                tags={formData.tags}
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
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save to Draft
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {editingNewsId ? 'Update News' : 'Publish News'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewsForm;