import React, { useState } from 'react';
import { Upload, ChevronDown } from 'lucide-react';

const AddNewResources = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    caption: '',
    isPublished: true
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    // Add your form submission logic here
  };

  const handleGoBack = () => {
    // Add navigation logic here
    console.log('Going back...');
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-2">Add New Resource</h2>
      <p className="text-gray-600 text-sm mb-6">Update your team information and images and Media here.</p>

      <div className="space-y-6">
        {/* Header/Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Header / Title *
          </label>
          <input
            type="text"
            placeholder="Rampant Rape Case In Ogun State"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Caption */}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <p className="text-xs text-gray-500 mb-2">Write a short Description.</p>
          
          {/* Text Editor Toolbar */}
          <div className="flex items-center space-x-3 p-3 border border-gray-300 border-b-0 rounded-t-md bg-gray-50">
            <button className="p-1 text-gray-600 hover:text-gray-800 rounded">
              <span className="text-sm font-bold">B</span>
            </button>
            <button className="p-1 text-gray-600 hover:text-gray-800 rounded">
              <span className="text-sm italic">I</span>
            </button>
            <button className="p-1 text-gray-600 hover:text-gray-800 rounded">
              <span className="text-sm font-bold underline">U</span>
            </button>
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div className="flex space-x-2 ml-4">
              <button className="p-1 text-gray-600 hover:text-gray-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              placeholder="How do you create compelling presentations that wow your colleagues and impress your managers? Find out with our in-depth guide on UX presentations."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              50 characters left
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <input
            type="text"
            placeholder="Rampant Rape Case In Ogun State"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sub Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub Category *
          </label>
          <div className="relative">
            <select
              value={formData.subCategory}
              onChange={(e) => handleInputChange('subCategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="" disabled>Select sub category</option>
              <option value="Pdf">Pdf</option>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="Document">Document</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Upload Media */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Media
          </label>
          <p className="text-xs text-gray-500 mb-3">Images/Video goes here</p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX: 800x400px)</p>
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption (Optional)
          </label>
          <input
            type="text"
            placeholder="This is image description and caption"
            value={formData.caption}
            onChange={(e) => handleInputChange('caption', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Optional Tags */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="radio"
              id="setup"
              name="optional-tags"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              defaultChecked
            />
            <label htmlFor="setup" className="ml-2 text-sm text-gray-700">Setup</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="advanced"
              name="optional-tags"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="advanced" className="ml-2 text-sm text-gray-700">Advanced</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="area-comment"
              name="optional-tags"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="area-comment" className="ml-2 text-sm text-gray-700">For Area Comment Only</label>
          </div>
        </div>

        {/* Publish Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish *
          </label>
          <p className="text-xs text-gray-500 mb-2">Archive this Toggle to Publish</p>
          <div className="flex items-center">
            <button
              onClick={() => handleInputChange('isPublished', !formData.isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.isPublished ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPublished ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-700">
              {formData.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Back
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewResources;