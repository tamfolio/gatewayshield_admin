import { ChevronDown, Upload, X, FileText, Film, Image } from "lucide-react";
import React, { useState, useRef } from "react";

function CreateNewsArticle() {
  const [formData, setFormData] = useState({
    title: '',
    subHeading: '',
    bodyText: '',
    tags: []
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: Math.floor(Math.random() * 100), // Simulated progress
      caption: '',
      makeCover: false
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const updateFileCaption = (fileId, caption) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, caption } : file
      )
    );
  };

  const toggleMakeCover = (fileId) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, makeCover: !file.makeCover } : file
      )
    );
  };

  const addTag = (tagText) => {
    if (tagText.trim() && !formData.tags.includes(tagText.trim())) {
      handleInputChange('tags', [...formData.tags, tagText.trim()]);
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Film className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const predefinedTags = ['#web', '#web', '#web', '#web', '#Launching', '#web', '#web', '#web', '#web', '#Launching'];

  return (
    <div className="max-w-4xl p-6">
      <div className="bg-white">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Create News Article</h2>
          <p className="text-gray-600">Update your News Information and images and Media here.</p>
        </div>

        <div className="space-y-6">
          {/* Header/Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Rampant Rape Case in Ogun State"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sub-Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-Heading <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">Write a short introduction.</p>
            <div className="border border-gray-300 rounded-md">
              <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">
                    <strong>B</strong>
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">
                    <em>I</em>
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">
                    <u>U</u>
                  </button>
                  <button type="button" className="w-3 h-3 bg-black rounded-full"></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">≡</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">≡</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">≡</button>
                </div>
              </div>
              <textarea
                value={formData.subHeading}
                onChange={(e) => handleInputChange('subHeading', e.target.value)}
                placeholder="How do you create compelling presentations that wow your colleagues and impress your managers? Find out with our in-depth guide on UX presentations."
                className="w-full px-3 py-2 min-h-[100px] resize-y focus:outline-none"
              />
              <div className="px-3 py-2 text-right text-sm text-gray-500 border-t border-gray-200">
                50 characters left
              </div>
            </div>
          </div>

          {/* Body Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Text <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">Write a short introduction.</p>
            <div className="border border-gray-300 rounded-md">
              <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <select className="text-sm border-none bg-transparent focus:outline-none">
                    <option>H1</option>
                    <option>H2</option>
                    <option>H3</option>
                    <option>Normal</option>
                  </select>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">
                    <strong>B</strong>
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">
                    <em>I</em>
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">
                    <u>U</u>
                  </button>
                  <button type="button" className="w-3 h-3 bg-black rounded-full"></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">≡</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">≡</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">≡</button>
                </div>
              </div>
              <textarea
                value={formData.bodyText}
                onChange={(e) => handleInputChange('bodyText', e.target.value)}
                placeholder="I'm a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and Webflow development."
                className="w-full px-3 py-2 min-h-[150px] resize-y focus:outline-none"
              />
              <div className="px-3 py-2 text-right text-sm text-gray-500 border-t border-gray-200">
                984 characters left
              </div>
            </div>
          </div>

          {/* Upload Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media</label>
            <p className="text-sm text-gray-500 mb-2">Image/Video goes here</p>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Click to upload
                </button>
                {' '}or drag and drop
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • Complete
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id={`cover-${file.id}`}
                        checked={file.makeCover}
                        onChange={() => toggleMakeCover(file.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`cover-${file.id}`} className="text-sm text-gray-700">
                        Make Cover Image
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Caption (Optional)</label>
                      <input
                        type="text"
                        value={file.caption}
                        onChange={(e) => updateFileCaption(file.id, e.target.value)}
                        placeholder="This is Image description and caption"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Maximum 20) <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Tags can be useful if content in your post is commonly misspelled. Otherwise tags play admittial role in helping people find your post.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedTags.map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                placeholder="Add Tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  addTag(input.value);
                  input.value = '';
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Save to Draft
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Publish News
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateNewsArticle