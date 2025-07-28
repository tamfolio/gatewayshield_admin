import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import axios from 'axios';
import useAccessToken from '../../../../Utils/useAccessToken'
import SuccessModal from './SuccessModal'; // Adjust path as needed

const PublishFeedback = ({ isOpen, onClose, feedback }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const accessToken = useAccessToken(); // Get access token from Redux store

  if (!feedback) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No feedback data available</p>
      </div>
    );
  }

  // Extract feedback details without fallbacks
  const feedbackType = feedback.type;
  const stationName = feedback.station;
  const citizenName = feedback.citizenName;
  const officerName = feedback.officer;
  const comment = feedback.comment;
  const submissionDate = feedback.date;

  // Handle publish to homepage
  const handlePublish = async () => {
    if (!accessToken) {
      alert('Authentication required. Please login again.');
      return;
    }

    // Debug: Check the feedback ID before sending
    const feedbackId = feedback.id || feedback.feedbackId;
    console.log('🔍 Publishing feedback with ID:', feedbackId);
    console.log('🔍 Full feedback object:', feedback);

    if (!feedbackId || feedbackId.startsWith('temp-')) {
      alert('Invalid feedback ID. This feedback cannot be published.');
      console.error('❌ Invalid feedback ID:', feedbackId);
      return;
    }

    setIsPublishing(true);
    try {
      const response = await axios.patch(
        'https://admin-api.thegatewayshield.com/api/v1/feedback/generalFeedback/publish-feedback',
        {
          feedbackId: feedbackId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('✅ Feedback published successfully:', response.data);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Error publishing feedback:', error);
      console.error('❌ Error response data:', error.response?.data);
      
      if (error.response?.status === 400) {
        alert(`Bad Request: ${error.response?.data?.message || 'Invalid feedback data'}`);
      } else if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else {
        alert('Failed to publish feedback. Please try again.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating 
            ? 'text-blue-500 fill-blue-500' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {/* Single column layout with each field on its own line */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Feedback Type:</span>
            <span className="text-sm text-gray-900">{feedbackType}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Station Name:</span>
          <span className="text-sm text-gray-900">{stationName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Citizen Name:</span>
          <span className="text-sm text-gray-900">{citizenName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Officer Name:</span>
          <span className="text-sm text-gray-900">{officerName}</span>
        </div>
      </div>

      {/* Comment Section - only actual feedback comment */}
      <div className="space-y-4 mt-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {comment}
        </p>
      </div>

      {/* Publish Button - moved up and repositioned */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPublishing ? 'Publishing...' : 'Publish to homepage'}
        </button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose(); // Close the main modal too
        }}
        title="Feedback Published!"
        message="The feedback has been successfully published to the homepage."
      />
    </div>
  );
};

export default PublishFeedback;