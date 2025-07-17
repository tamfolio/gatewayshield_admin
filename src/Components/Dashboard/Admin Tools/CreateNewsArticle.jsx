import React, { useState, useRef } from 'react';
import { 
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import RichTextEditor from './components/RichTextEditor';
import TagsManager from './components/TagsManager';
import FileUploadComponent from './components/FileUploadComponent';

const CreateNewsArticle = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    title: '',
    subHeading: '',
    bodyText: '',
    tags: []
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subHeadingRef = useRef(null);
  const bodyTextRef = useRef(null);

  // Character limits
  const SUB_HEADING_LIMIT = 150;
  const BODY_TEXT_LIMIT = 2000;
  const TITLE_LIMIT = 100;
  const TAG_LIMIT = 20;

  // Get accurate character count from contentEditable
  const getTextContent = (element) => {
    if (!element) return '';
    return element.textContent || element.innerText || '';
  };

  // Enhanced form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > TITLE_LIMIT) {
      newErrors.title = `Title cannot exceed ${TITLE_LIMIT} characters`;
    }
    
    // Sub-heading validation
    const subHeadingText = subHeadingRef.current ? getTextContent(subHeadingRef.current) : '';
    if (!subHeadingText.trim()) {
      newErrors.subHeading = 'Sub-heading is required';
    } else if (subHeadingText.length > SUB_HEADING_LIMIT) {
      newErrors.subHeading = `Sub-heading cannot exceed ${SUB_HEADING_LIMIT} characters`;
    }
    
    // Body text validation
    const bodyText = bodyTextRef.current ? getTextContent(bodyTextRef.current) : '';
    if (!bodyText.trim()) {
      newErrors.bodyText = 'Body text is required';
    } else if (bodyText.length > BODY_TEXT_LIMIT) {
      newErrors.bodyText = `Body text cannot exceed ${BODY_TEXT_LIMIT} characters`;
    }
    
    // Tags validation
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > TAG_LIMIT) {
      newErrors.tags = `Cannot exceed ${TAG_LIMIT} tags`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = (validFiles) => {
    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      isUploading: true,
      makeCoverImage: false,
      caption: '',
      isValid: true
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(fileData => {
      simulateUpload(fileData.id);
    });
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, progress: 100, isUploading: false }
              : file
          )
        );
      } else {
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, progress: Math.round(progress) }
              : file
          )
        );
      }
    }, 500);
  };

  // Remove file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Update file data
  const updateFileData = (fileId, updates) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, ...updates }
          : file
      )
    );
  };

  // Handle tags change
  const handleTagsChange = (newTags) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
    // Clear tag error if it exists
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  // Handle content change for rich text editors
  const handleSubHeadingChange = (content) => {
    setFormData(prev => ({ ...prev, subHeading: content }));
    if (errors.subHeading) {
      setErrors(prev => ({ ...prev, subHeading: '' }));
    }
  };

  const handleBodyTextChange = (content) => {
    setFormData(prev => ({ ...prev, bodyText: content }));
    if (errors.bodyText) {
      setErrors(prev => ({ ...prev, bodyText: '' }));
    }
  };

  // Handle form submission
  const handleSaveDraft = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before saving');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving draft...', { formData, uploadedFiles });
      alert('Draft saved successfully!');
    } catch (error) {
      alert('Error saving draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before publishing');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Publishing...', { formData, uploadedFiles });
      alert('Article published successfully!');
    } catch (error) {
      alert('Error publishing article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error component
  const ErrorMessage = ({ error }) => (
    error ? (
      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    ) : null
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4" />
        <span>Admin Tools</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">News</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create News Article
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'view'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          View All News
        </button>
      </div>

      {/*  Active Tab */}
      {activeTab === 'create' ? (
        <div className="bg-white rounded-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Create News Article</h1>
            <p className="text-gray-600">Update your News Information and Images and Media here.</p>
          </div>

          {/* Title Field */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-4 pb-6 border-b border-gray-200">
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium text-gray-700">
                Header / Title *
              </label>
            </div>
            <div className="lg:w-3/4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  if (e.target.value.length <= TITLE_LIMIT) {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: '' }));
                    }
                  }
                }}
                placeholder="Rampant Rape Case in Ogun State"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                <ErrorMessage error={errors.title} />
                <div className="text-sm text-gray-500">
                  {formData.title.length}/{TITLE_LIMIT}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-heading Field */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-start gap-4 pb-6 border-b border-gray-200">
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Heading *
              </label>
              <p className="text-sm text-gray-500">Write a short introduction.</p>
            </div>
            <div className="lg:w-3/4">
              <RichTextEditor
                value={formData.subHeading}
                onChange={handleSubHeadingChange}
                placeholder="Enter sub-heading..."
                minHeight="120px"
                showHeadings={false}
                error={errors.subHeading}
                limit={SUB_HEADING_LIMIT}
                textRef={subHeadingRef}
              />
            </div>
          </div>

          {/* Body Text Field */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-start gap-4 pb-6 border-b border-gray-200">
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Text *
              </label>
              <p className="text-sm text-gray-500">Write the main content.</p>
            </div>
            <div className="lg:w-3/4">
              <RichTextEditor
                value={formData.bodyText}
                onChange={handleBodyTextChange}
                placeholder="Enter body text..."
                minHeight="160px"
                showHeadings={true}
                error={errors.bodyText}
                limit={BODY_TEXT_LIMIT}
                textRef={bodyTextRef}
              />
            </div>
          </div>

          {/* Upload Media Section */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-start gap-4 pb-6 border-b border-gray-200">
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Media
              </label>
              <p className="text-sm text-gray-500">Image/Video goes here</p>
              <p className="text-xs text-gray-400 mt-1">
                Max 10 files. Images: 5MB, Videos: 50MB, PDF: 10MB
              </p>
            </div>
            <div className="lg:w-3/4">
              <FileUploadComponent
                uploadedFiles={uploadedFiles}
                onFileUpload={handleFileUpload}
                onFileRemove={removeFile}
                onFileUpdate={updateFileData}
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Maximum {TAG_LIMIT}) *
              </label>
              <p className="text-sm text-gray-500">
                Tags can be useful to search for content in your post otherwise the tags don't play a significant role in helping people find your post.
              </p>
            </div>
            <div className="lg:w-3/4">
              <TagsManager
                tags={formData.tags}
                onTagsChange={handleTagsChange}
                error={errors.tags}
                maxTags={TAG_LIMIT}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save to Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Publish News'}
            </button>
          </div>
        </div>
      ) : (
        /* View All News Tab */
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">View All News</h2>
            <p className="text-gray-600 mb-4">
              This section will display all published news articles.
            </p>
            <p className="text-sm text-gray-500">
              tab implementation soon.
            </p>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNewsArticle;