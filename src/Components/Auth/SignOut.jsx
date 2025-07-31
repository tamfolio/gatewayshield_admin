import React, { useState } from 'react';
import { PiSignOutThin, PiWarningCircle } from 'react-icons/pi';
import { AiOutlineClose } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignOut = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      // Get token from localStorage or Redux store
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
     
      const response = await fetch('https://admin-api.thegatewayshield.com/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('persist:root'); // Redux persist
        sessionStorage.clear();
        
        // Clear any cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        toast.success("Signed out successfully!");
        
        // Navigate to login page
        navigate("/");
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }
      
    } catch (err) {
      console.error("Logout Error:", err?.message || err);
      toast.error(err?.message || "Failed to sign out");
      
      // Even if API call fails, clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <PiWarningCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign Out</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <AiOutlineClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-gray-600 mb-2">
            Are you sure you want to sign out?
          </p>
          <p className="text-sm text-gray-500">
            You'll need to sign in again to access your account.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-medium transform transition-all duration-200 shadow-lg ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-red-700 hover:to-red-800 hover:scale-[1.02] hover:shadow-xl"
            } flex items-center justify-center space-x-2`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <PiSignOutThin className="w-5 h-5" />
                <span>Sign Out</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOut;