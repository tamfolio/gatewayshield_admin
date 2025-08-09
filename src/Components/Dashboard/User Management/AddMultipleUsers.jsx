import React, { useEffect, useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import { userRequest } from '../../../requestMethod';
import useAccessToken from '../../../Utils/useAccessToken';
import { toast } from 'react-toastify';

function AddMultipleUsers() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [parsedData, setParsedData] = useState([]); // Store parsed CSV data
  const [adminData, setAdminData] = useState([]);
  const [paginationData, setPaginationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useAccessToken();

  const handleDownloadTemplate = () => {
    // Updated CSV template with sample data for testing
    const csvContent = firstName,lastName,phoneNumber,email,roleId,formationId,rankId,badgeNumber,address,coordinate;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_users_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Function to parse CSV content
  const parseCSV = (csvContent) => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const requiredHeaders = ['firstName', 'lastName', 'phoneNumber', 'email', 'roleId', 'formationId', 'rankId', 'badgeNumber', 'address', 'coordinate'];
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(Missing required columns: ${missingHeaders.join(', ')});
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim());
      if (values.length !== headers.length) {
        throw new Error(Row ${i + 1} has ${values.length} columns but expected ${headers.length});
      }

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Validate required fields
      const emptyFields = requiredHeaders.filter(field => !row[field] || row[field].trim() === '');
      if (emptyFields.length > 0) {
        throw new Error(Row ${i + 1} has empty required fields: ${emptyFields.join(', ')});
      }

      data.push(row);
    }

    return data;
  };

  // Function to read and parse Excel files
  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // For Excel files, you'd typically use a library like xlsx
          // For now, we'll simulate Excel parsing by treating it as CSV
          // In a real implementation, you'd use: 
          // import * as XLSX from 'xlsx';
          // const workbook = XLSX.read(e.target.result, { type: 'array' });
          // const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          // const csvData = XLSX.utils.sheet_to_csv(firstSheet);
          
          // For this example, we'll just reject Excel files and ask for CSV
          reject(new Error('Excel file parsing requires additional library. Please use CSV format.'));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    // Support both CSV and Excel files
    const validTypes = [
      'text/csv', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const isValidFile = validTypes.includes(file.type) || 
                       file.name.endsWith('.csv') || 
                       file.name.endsWith('.xlsx') || 
                       file.name.endsWith('.xls');

    if (!isValidFile) {
      setUploadStatus('error');
      setError('Please upload CSV or Excel files only');
      return;
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadStatus('error');
      setError('File size must be less than 10MB');
      return;
    }

    setUploadStatus('uploading');
    setUploadedFile(file);
    setError('');

    try {
      let parsedFileData = [];
      
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        // Parse CSV file
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const csvContent = e.target.result;
            parsedFileData = parseCSV(csvContent);
            
            setUploadStatus('success');
            
            const newFile = {
              name: file.name,
              size: Math.round(file.size / 1024),
              type: 'csv',
              id: Date.now(),
              recordCount: parsedFileData.length,
              data: parsedFileData // Store the parsed data
            };
            
            setUploadedFiles(prev => [...prev, newFile]);
            setParsedData(prev => [...prev, ...parsedFileData]);
            
            setTimeout(() => {
              setUploadStatus('idle');
              setUploadedFile(null);
            }, 1000);
          } catch (parseError) {
            setUploadStatus('error');
            setError(CSV parsing error: ${parseError.message});
          }
        };
        reader.onerror = () => {
          setUploadStatus('error');
          setError('Failed to read CSV file');
        };
        reader.readAsText(file);
      } else {
        // Handle Excel files
        try {
          await parseExcelFile(file);
        } catch (parseError) {
          setUploadStatus('error');
          setError(Excel parsing error: ${parseError.message});
        }
      }
    } catch (error) {
      setUploadStatus('error');
      setError(File processing error: ${error.message});
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setError('');
  };

  const handleRemoveUploadedFile = (id) => {
    const fileToRemove = uploadedFiles.find(file => file.id === id);
    if (fileToRemove && fileToRemove.data) {
      // Remove the file's data from parsedData
      setParsedData(prev => {
        const remainingData = [...prev];
        fileToRemove.data.forEach(record => {
          const index = remainingData.findIndex(item => 
            item.email === record.email && item.phoneNumber === record.phoneNumber
          );
          if (index > -1) {
            remainingData.splice(index, 1);
          }
        });
        return remainingData;
      });
    }
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

  const handleBulkSubmit = async () => {
    if (parsedData.length === 0) {
      setError('No data to upload');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Format data according to your API structure
      const payload = {
        admins: parsedData.map(row => ({
          firstName: row.firstName,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber,
          email: row.email,
          roleId: row.roleId,
          formationId: row.formationId,
          rankId: row.rankId,
          badgeNumber: row.badgeNumber,
          address: row.address,
          coordinate: row.coordinate
        }))
      };

      console.log('Submitting bulk upload with payload:', payload);
      
      const response = await userRequest(token).post('/admin/create/bulk', payload);
      
      console.log('✅ Bulk upload successful:', response.data);
      
      // Show success toast message
      toast.success(response.data.message || Successfully uploaded ${parsedData.length} users!);
      
      // Clear uploaded files and data
      setUploadedFiles([]);
      setParsedData([]);
      setError('');
      
    } catch (error) {
      console.error('❌ Bulk upload failed:', error);
      const message = error?.response?.data?.error || error?.response?.data?.message || 'Failed to upload users. Please try again.';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCancel = () => {
    setUploadedFiles([]);
    setParsedData([]);
    setUploadedFile(null);
    setUploadStatus('idle');
    setError('');
  };

  const getFileIcon = (type) => {
    if (type === 'csv') {
      return <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">CSV</span>
      </div>;
    } else {
      return <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">XLSX</span>
      </div>;
    }
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await userRequest(token).get("/admin/get/all");
        console.log("✅:", res.data);
        setAdminData(res.data?.data?.incidents?.data || []);
        setPaginationData(res.data?.data?.incidents?.pagination || []);
      } catch (err) {
        console.error("❌ Failed to fetch incidents:", err);
        setError("Failed to fetch incidents");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAdmins();
    }
  }, [token]);

  const formatFileSize = (sizeInKB) => {
    if (sizeInKB < 1024) {
      return ${sizeInKB} KB;
    } else {
      return ${(sizeInKB / 1024).toFixed(1)} MB;
    }
  };

  const getTotalRecords = () => {
    return uploadedFiles.reduce((total, file) => total + (file.recordCount || 0), 0);
  };

  return (
    <div className="bg-white p-6 w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Add Bulk Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload CSV or Excel files to add multiple users at once
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-sm text-gray-600">Processing file...</p>
            </div>
          )}

          {uploadStatus === 'success' && uploadedFile && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-2">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500 mb-4">
                {formatFileSize(Math.round(uploadedFile.size / 1024))} • File processed successfully
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
              <p className="text-sm text-red-600 mb-2">Upload failed</p>
              <p className="text-xs text-gray-500">Please check file format and try again</p>
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
                CSV files recommended (Max 10MB)
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

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Ready to Upload</h3>
            <p className="text-sm text-gray-500">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} • {getTotalRecords()} records
            </p>
          </div>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(file.type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Ready
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.recordCount || 0} records
                    </p>
                  </div>
                </div>
                
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

      {/* Data Preview */}
      {parsedData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Data Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
            <div className="text-xs text-gray-600 mb-2">First 3 records:</div>
            {parsedData.slice(0, 3).map((record, index) => (
              <div key={index} className="mb-2 p-2 bg-white rounded text-xs">
                <strong>{record.firstName} {record.lastName}</strong> - {record.email} - {record.phoneNumber}
              </div>
            ))}
            {parsedData.length > 3 && (
              <div className="text-xs text-gray-500">... and {parsedData.length - 3} more records</div>
            )}
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
          disabled={parsedData.length === 0 || loading}
          className={`px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            parsedData.length > 0 && !loading
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Processing...' : Upload ${getTotalRecords()} Users}
        </button>
      </div>
    </div>
  );
}

export default AddMultipleUsers;