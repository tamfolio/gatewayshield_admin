import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const TagsManager = ({ tags = [], onTagsChange, error, maxTags = 20 }) => {
  const [newTag, setNewTag] = useState('');

  // Ensure tags is always an array
  const safeTags = Array.isArray(tags) ? tags : [];

  const addTag = () => {
    if (!onTagsChange) return; // Safety check for callback
    
    if (newTag.trim() && !safeTags.includes(newTag.trim()) && safeTags.length < maxTags) {
      onTagsChange([...safeTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    if (!onTagsChange) return; // Safety check for callback
    
    onTagsChange(safeTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      {/* Tag Input */}
      <div className="mb-4">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add Tag..."
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="text-sm text-gray-500 ml-auto">
            {safeTags.length}/{maxTags} tags
          </div>
        </div>
      </div>
      
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2">
        {safeTags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border"
          >
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-gray-400 hover:text-gray-600 ml-1"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      
      {/* Add Tag Button */}
      <button
        onClick={addTag}
        disabled={!newTag.trim() || safeTags.includes(newTag.trim()) || safeTags.length >= maxTags}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        type="button"
      >
        Add Tag
      </button>
    </div>
  );
};

export default TagsManager;