import React, { useState } from 'react';
import { X } from 'lucide-react';

const NewsDetails = ({ isOpen, newsData, loading, onClose }) => {
  const [imageError, setImageError] = useState(false);

  // Don't render anything if not open
  if (!isOpen) return null;

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    return newsData?.coverImage || newsData?.coverImageUrl || newsData?.thumbnail;
  };

  const hasImage = getImageSrc() && !imageError;

  return (
    <div className="fixed inset-0 bg-gray-200 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900">News Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading news details...</p>
            </div>
          ) : newsData ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {newsData.title || 'Untitled'}
                </h1>
              </div>

              {/* Body */}
              {newsData.body && (
                <div className="text-gray-700 leading-relaxed">
                  <div className="whitespace-pre-wrap">
                    {newsData.body.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Image */}
              {hasImage && (
                <div className="w-full">
                  <img
                    src={getImageSrc()}
                    alt={newsData.title || 'News image'}
                    className="w-full h-auto"
                    onError={handleImageError}
                    onLoad={() => setImageError(false)}
                  />
                </div>
              )}

              {/* Image Error Fallback */}
              {imageError && getImageSrc() && (
                <div className="w-full p-8 bg-gray-100 text-center text-gray-500">
                  <p>Image could not be loaded</p>
                  <p className="text-sm mt-1">Source: {getImageSrc()}</p>
                </div>
              )}

              {/* Tags */}
              {(newsData.tags || newsData.categories) && 
               (newsData.tags?.length > 0 || newsData.categories?.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {(newsData.tags || newsData.categories || []).map((tag, index) => (
                    <span
                      key={`tag-${index}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {typeof tag === 'string' ? tag : tag.name || tag.title || `Tag ${index + 1}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">Failed to load news details</p>
              <p className="text-sm">Please try again later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;