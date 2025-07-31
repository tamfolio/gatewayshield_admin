import React, { useState } from "react";
import { HiOutlineUpload } from "react-icons/hi";
import { MdEmail } from "react-icons/md";

const UserProfile = ({ userName, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: userName?.firstName + " " + userName?.lastName || "Anita Kikitos",
    email: "",
    username: "",
    address: "",
    phoneNumber: "",
    gender: "Male",
  });
  const [profileImage, setProfileImage] = useState(
    "/assets/profile-placeholder.jpg"
  );
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would make your API call to update user profile
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      console.log("Profile updated:", formData);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="flex gap-8">
      {/* Left Column - User Info Header */}
      <div className="w-64 flex-shrink-0">
        <h3 className="text-base font-medium text-gray-900 mb-1">User Info</h3>
        <p className="text-sm text-gray-500">Update User details.</p>
      </div>

      {/* Right Column - Form Content */}
      <div className="flex-1 bg-white p-6 border rounded-md border-gray-100 max-w-2xl space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Enter full name"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Profile Image Upload */}
        <div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border">
              {profileImage &&
              profileImage !== "/assets/profile-placeholder.jpg" ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {formData.fullName?.charAt(0) || "A"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Click to upload
              </span>
            </label>
            <span className="text-gray-500 text-sm"> or drag and drop</span>
            <p className="text-xs text-gray-400 mt-1">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              gatewayshield.ng/
            </span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="username"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Enter address"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Phone number <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <div className="flex items-center px-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
              NG +234
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none"
              placeholder="816 1234-0000"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            } flex items-center space-x-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
