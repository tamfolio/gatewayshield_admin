import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';

function AddMultipleUsers() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDownloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = 'Name,Email,Role,Department\nJohn Doe,john@example.com,Developer,Engineering\nJane Smith,jane@example.com,Designer,Design';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadedFile(file);

    // Simulate upload progress
    setTimeout(() => {
      setUploadStatus('success');
      // Add to uploaded files list
      const newFile = {
        name: file.name,
        size: Math.round(file.size / 1024), // Convert to KB
        type: file.name.endsWith('.csv') ? 'csv' : 'xlsx',
        id: Date.now() // Add unique ID
      };
      setUploadedFiles(prev => [...prev, newFile]);
      // Reset for next upload
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadedFile(null);
      }, 1000);
    }, 2000);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
  };

  const handleRemoveUploadedFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleBulkSubmit = () => {
    console.log('Submitting files:', uploadedFiles);
    // Handle submission logic here
  };

  const handleBulkCancel = () => {
    setUploadedFiles([]);
    setUploadedFile(null);
    setUploadStatus('idle');
  };

  const getFileIcon = (type) => {
    if (type === 'csv') {
      return <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">CSV</span>
      </div>;
    } else {
      return <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">XLSX</span>
      </div>;
    }
  };

  const formatFileSize = (sizeInKB) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    }
  };

  return (
    <div className="bg-white p-6 w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Add Bulk User</h2>
          <p className="text-sm text-gray-500 mt-1"></p>
        </div>
        <button 
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : uploadStatus === 'error'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Upload Status Rendering */}
          {uploadStatus === 'uploading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          )}

          {uploadStatus === 'success' && uploadedFile && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-2">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500 mb-4">
                {formatFileSize(Math.round(uploadedFile.size / 1024))}
              </p>
              <button
                onClick={handleRemoveFile}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
              <p className="text-sm text-red-600 mb-2">Invalid file type</p>
              <p className="text-xs text-gray-500">Please upload CSV, XLS, or XLSX files only</p>
            </div>
          )}

          {uploadStatus === 'idle' && (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <div className="mb-4">
                <button
                  onClick={() => document.getElementById('fileInput').click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to upload
                </button>
                <span className="text-gray-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                CSV format only
              </p>
            </div>
          )}

          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Uploaded Files List - Show all uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mb-6">
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 flex-1">
                  {/* File Icon */}
                  {file.type === 'csv' ? (
                    <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CSV</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">XLSX</span>
                    </div>
                  )}
                  
                  {/* File Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        100%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveUploadedFile(file.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleBulkCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={handleBulkSubmit}
          disabled={uploadedFiles.length === 0}
          className={`px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            uploadedFiles.length > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default AddMultipleUsers;