import React, { useEffect, useState } from "react";
import { HiOutlineUpload } from "react-icons/hi";
import { MdEmail } from "react-icons/md";
import { userRequest } from "../../../requestMethod";
import useAccessToken from "../../../Utils/useAccessToken";
import { toast } from "react-toastify";

const UserProfile = ({ userName, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    badgeNumber: "",
    coordinate: "",
  });
  
  const [userDetails, setUserDataDetails] = useState(null);
  const token = useAccessToken();
  const [profileImage, setProfileImage] = useState(
    "/assets/profile-placeholder.jpg"
  );
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      setFetchingData(true);
      try {
        const res = await userRequest(token).get(`/admin/get/`);
        const adminData = res.data.data.admin;
        
        setUserDataDetails(adminData);
        
        // Populate form with fetched data
        setFormData({
          firstName: adminData.firstName || "",
          lastName: adminData.lastName || "",
          email: adminData.email || "",
          phoneNumber: adminData.phoneNumber || "",
          address: adminData.address || "",
          badgeNumber: adminData.badgeNumber || "",
          coordinate: adminData.coordinate || "",
        });
        
      } catch (error) {
        console.error("❌ Failed to fetch admin data:", error);
        toast.error("Failed to load user details");
      } finally {
        setFetchingData(false);
      }
    };

    if (token) {
      fetchUserDetails();
    }
  }, [token]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      };

      const res = await userRequest(token).patch("/admin/update", payload);
      
      console.log("✅ Profile updated successfully:", res.data);
      toast.success("Profile updated successfully!");
      
      // Update local state with new data
      setUserDataDetails(prev => ({
        ...prev,
        firstName: payload.firstName,
        lastName: payload.lastName
      }));
      
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (fetchingData) {
    return (
      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0">
          <h3 className="text-base font-medium text-gray-900 mb-1">User Info</h3>
          <p className="text-sm text-gray-500">Loading user details...</p>
        </div>
        <div className="flex-1 bg-white p-6 border rounded-md border-gray-100 max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Left Column - User Info Header */}
      <div className="w-64 flex-shrink-0">
        <h3 className="text-base font-medium text-gray-900 mb-1">User Info</h3>
        <p className="text-sm text-gray-500">Update User details.</p>
        
        {userDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 mb-1">Current User:</p>
            <p className="text-sm font-medium text-gray-900">
              {userDetails.firstName} {userDetails.lastName}
            </p>
            <p className="text-xs text-gray-500">{userDetails.email}</p>
            {userDetails.badgeNumber && (
              <p className="text-xs text-gray-500">Badge: {userDetails.badgeNumber}</p>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Form Content */}
      <div className="flex-1 bg-white p-6 border rounded-md border-gray-100 max-w-2xl space-y-6">
        
        {/* Editable Fields Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Only First Name and Last Name can be updated. Other fields are read-only.
          </p>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Enter first name"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Enter last name"
          />
        </div>

        {/* Email Address (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
              placeholder="Email address"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Email cannot be modified</p>
        </div>

        {/* Phone Number (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Phone number
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
            <div className="flex items-center px-3 bg-gray-100 text-gray-500 text-sm border-r border-gray-300">
              NG
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              readOnly
              className="flex-1 px-3 py-2.5 text-sm text-gray-600 bg-gray-50 cursor-not-allowed focus:outline-none"
              placeholder="Phone number"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Phone number cannot be modified</p>
        </div>

        {/* Address (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
            placeholder="Address"
          />
          <p className="text-xs text-gray-500 mt-1">Address cannot be modified</p>
        </div>

        {/* Badge Number (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge Number
          </label>
          <input
            type="text"
            name="badgeNumber"
            value={formData.badgeNumber}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
            placeholder="Badge number"
          />
          <p className="text-xs text-gray-500 mt-1">Badge number cannot be modified</p>
        </div>

        {/* Coordinates (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coordinates
          </label>
          <input
            type="text"
            name="coordinate"
            value={formData.coordinate}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
            placeholder="Coordinates"
          />
          <p className="text-xs text-gray-500 mt-1">Coordinates cannot be modified</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={loading || !formData.firstName.trim() || !formData.lastName.trim()}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors ${
              loading || !formData.firstName.trim() || !formData.lastName.trim()
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-blue-700"
            } flex items-center space-x-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Names</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;