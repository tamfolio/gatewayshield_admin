import React, { useState, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';

const FileUploadComponent = ({ uploadedFiles = [], onFileUpload, onFileRemove, onFileUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const MAX_FILES = 10;
  
  // Ensure uploadedFiles is always an array
  const safeUploadedFiles = Array.isArray(uploadedFiles) ? uploadedFiles : [];
  
  // File upload security configuration
  const ALLOWED_FILE_TYPES = {
    'image/jpeg': { ext: ['jpg', 'jpeg'], maxSize: 5 * 1024 * 1024 }, // 5MB
    'image/png': { ext: ['png'], maxSize: 5 * 1024 * 1024 }, // 5MB
    'image/gif': { ext: ['gif'], maxSize: 5 * 1024 * 1024 }, // 5MB
    'image/webp': { ext: ['webp'], maxSize: 5 * 1024 * 1024 }, // 5MB
    'image/svg+xml': { ext: ['svg'], maxSize: 1 * 1024 * 1024 }, // 1MB
    'video/mp4': { ext: ['mp4'], maxSize: 50 * 1024 * 1024 }, // 50MB
    'video/webm': { ext: ['webm'], maxSize: 50 * 1024 * 1024 }, // 50MB
    'video/quicktime': { ext: ['mov'], maxSize: 50 * 1024 * 1024 }, // 50MB
    'application/pdf': { ext: ['pdf'], maxSize: 10 * 1024 * 1024 } // 10MB
  };

  // Validate file security
  const validateFile = (file) => {
    const errors = [];
    
    if (!file || !file.type) {
      errors.push('Invalid file');
      return errors;
    }
    
    if (!ALLOWED_FILE_TYPES[file.type]) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    const fileName = file.name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const allowedConfig = ALLOWED_FILE_TYPES[file.type];
    
    if (allowedConfig && !allowedConfig.ext.includes(fileExtension)) {
      errors.push(`File extension .${fileExtension} is not allowed for this file type`);
    }
    
    if (allowedConfig && file.size > allowedConfig.maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${formatFileSize(allowedConfig.maxSize)}`);
    }
    
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|app|deb|pkg|dmg)$/i,
      /[<>:"|?*]/,
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(fileName))) {
      errors.push('File name contains suspicious characters or is a reserved name');
    }
    
    return errors;
  };

  // Handle file upload with security checks
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    if (!onFileUpload) return; // Safety check for callback
    
    if (safeUploadedFiles.length + files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const validFiles = [];
    const fileErrors = [];

    Array.from(files).forEach(file => {
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        fileErrors.push(`${file.name || 'Unknown file'}: ${validationErrors.join(', ')}`);
      } else {
        validFiles.push(file);
      }
    });

    if (fileErrors.length > 0) {
      alert('File validation errors:\n' + fileErrors.join('\n'));
    }

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  // Get file type badge
  const getFileTypeBadge = (type) => {
    if (!type) return <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">FILE</span>;
    
    if (type.startsWith('image/')) {
      return <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">IMG</span>;
    }
    if (type.startsWith('video/')) {
      return <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">VIDEO</span>;
    }
    if (type.includes('pdf')) {
      return <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">PDF</span>;
    }
    return <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">FILE</span>;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Safe callback handlers
  const handleRemove = (fileId) => {
    if (onFileRemove) {
      onFileRemove(fileId);
    }
  };

  const handleUpdate = (fileId, updates) => {
    if (onFileUpdate && updates) {
      onFileUpdate(fileId, updates);
    }
  };

  return (
    <div>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
            type="button"
          >
            Click to upload
          </button>
          {' '}or drag and drop
        </p>
        <p className="text-sm text-gray-500">
          JPG, PNG, GIF, WEBP, SVG, MP4, WEBM, MOV, PDF
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ({safeUploadedFiles.length}/{MAX_FILES} files uploaded)
        </p>
        
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
      {safeUploadedFiles.length > 0 && (
        <div className="mt-4 space-y-4">
          {safeUploadedFiles.map((file, index) => {
            // Ensure file has required properties
            const fileId = file?.id || index;
            const fileName = file?.name || 'Unknown file';
            const fileSize = file?.size || 0;
            const fileType = file?.type || '';
            const progress = file?.progress || 0;
            const isUploading = file?.isUploading || false;
            const makeCoverImage = file?.makeCoverImage || false;
            const caption = file?.caption || '';
            
            return (
              <div key={fileId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getFileTypeBadge(fileType)}
                    <div>
                      <p className="font-medium text-gray-900">{fileName}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(fileId)}
                    className="text-gray-400 hover:text-red-500"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">
                      {isUploading ? 'Uploading...' : 'Complete'}
                    </span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isUploading ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                {!isUploading && (
                  <>
                    {/* Make Cover Image Option */}
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id={`cover-${fileId}`}
                        checked={makeCoverImage}
                        onChange={(e) => handleUpdate(fileId, { makeCoverImage: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`cover-${fileId}`} className="text-sm text-gray-700">
                        Make Cover Image
                      </label>
                    </div>
                    
                    {/* Caption Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => handleUpdate(fileId, { caption: e.target.value })}
                        placeholder="This is image description and caption"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;