import React, { useEffect, useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { userRequest } from "../../../requestMethod";
import useAccessToken from "../../../Utils/useAccessToken";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

function EditUser({ activeTab, setActiveTab }) {
  const token = useAccessToken();
  const { id } = useParams();
  const [adminRoles, setAdminRoles] = useState([]);
  const [adminFormation, setAdminFormation] = useState([]);
  const [adminRanks, setAdminRanks] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    formation: "",
    address: "",
    coordinate: "",
    rank: "",
    badgeNumber: "",
  });

  // Get current user data from Redux
  const userData = useSelector((state) => state.user?.currentUser?.admin);

  // Find current user's role name by matching roleId with adminRoles
  const currentUserRoleObj =
    adminRoles.length > 0
      ? adminRoles.find((role) => role.id === userData?.roleId)
      : null;
  const currentUserRole = currentUserRoleObj?.name;
  const isCurrentUserAdmin =
    currentUserRole === "Admin" || currentUserRole === "Super Admin";

  console.log(userData);
  // Check if current user is editing their own profile using email comparison
  const isEditingSelf = userData?.email === userDetails?.email;

  // Determine what fields can be edited
  const canEditAllFields = isEditingSelf; // Only when editing themselves
  const canEditAllFieldsExceptName = isCurrentUserAdmin && !isEditingSelf; // Admin editing others (except names)

  useEffect(() => {
    const fetchAdminRoles = async () => {
      try {
        const res = await userRequest(token).get("/options/adminRoles/all");
        setAdminRoles(res.data?.data?.adminRoles || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin roles:", err);
      }
    };

    const fetchAdminFormation = async () => {
      try {
        const res = await userRequest(token).get(
          "/options/adminFormations/all"
        );
        setAdminFormation(res.data?.data?.adminFormations || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin Formation:", err);
      }
    };

    const fetchAdminRanks = async () => {
      try {
        const res = await userRequest(token).get("/options/adminRanks/all");
        setAdminRanks(res.data?.data?.adminRanks || []);
      } catch (err) {
        console.error("❌ Failed to fetch admin ranks:", err);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const res = await userRequest(token).get(`/admin/get/${id}`);
        const userDetailsData = res.data?.data?.admin || {};
        setUserDetails(userDetailsData);

        // Initialize form data with user details
        setFormData({
          firstName: userDetailsData.firstName || "",
          lastName: userDetailsData.lastName || "",
          email: userDetailsData.email || "",
          phone: userDetailsData.phoneNumber || "",
          role: userDetailsData.roleId || "",
          formation: userDetailsData.formationId || "",
          address: userDetailsData.address || "",
          coordinate: userDetailsData.coordinate || "",
          rank: userDetailsData.rankId || "",
          badgeNumber: userDetailsData.badgeNumber || "",
        });
      } catch (err) {
        console.error("❌ Failed to fetch user details:", err);
      }
    };

    if (token) {
      fetchAdminRoles();
      fetchAdminFormation();
      fetchAdminRanks();
      fetchUserDetails();
    }
  }, [token, id]);

  console.log("user", userDetails);
  console.log("currentUser", userData);
  console.log("currentUserRole", currentUserRole);
  console.log("isCurrentUserAdmin", isCurrentUserAdmin);
  console.log("isEditingSelf", isEditingSelf);
  console.log("canEditAllFields", canEditAllFields);
  console.log("canEditAllFieldsExceptName", canEditAllFieldsExceptName);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormationChange = (formationId) => {
    const selectedFormation = adminFormation.find(
      (formation) => formation.id === formationId
    );

    setFormData((prev) => ({
      ...prev,
      formation: formationId,
      address: selectedFormation ? selectedFormation.address : "",
      coordinate: selectedFormation ? selectedFormation.coordinates : "",
    }));
  };

  const handleSubmit = async () => {
    let payload;
    let endpoint;

    if (isEditingSelf) {
      // User editing their own profile - use /admin/update endpoint
      payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        email: formData.email,
        roleId: formData.role,
        formationId: formData.formation,
        address: formData.address,
        coordinate: formData.coordinate,
        rankId: formData.rank,
        badgeNumber: formData.badgeNumber,
      };
      endpoint = "/admin/update";
    } else if (canEditAllFieldsExceptName) {
      // Admin editing another user - use /admin/update/{id} endpoint (exclude names)
      payload = {
        phoneNumber: formData.phone,
        email: formData.email,
        roleId: formData.role,
        formationId: formData.formation,
        address: formData.address,
        coordinate: formData.coordinate,
        rankId: formData.rank,
        badgeNumber: formData.badgeNumber,
      };
      endpoint = `/admin/update/${id}`;
    } else {
      toast.error("You don't have permission to edit this user");
      return;
    }

    setIsLoading(true);
    try {
      const res = await userRequest(token).patch(endpoint, payload);
      toast.success(res.data.message);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      const message = err?.response?.data?.error || "❌ Failed to update user";
      toast.error(message);
    }
  };

  const adminActive = userDetails?.isActive ?? true;

  const ChangeUserStatus = async () => {
    // Only admins can change user status and not their own
    if (!isCurrentUserAdmin || isEditingSelf) {
      toast.error("You don't have permission to change user status");
      return;
    }

    const payload = {
      adminId: id,
      isActive: !adminActive,
    };
    setIsLoading(true);
    try {
      const res = await userRequest(token).patch(
        "/admin/update/status",
        payload
      );
      toast.success(res.data.message);
      setIsLoading(false);
      // Update local state
      setUserDetails((prev) => ({ ...prev, isActive: !adminActive }));
    } catch (err) {
      setIsLoading(false);
      const message =
        err?.response?.data?.error || "❌ Failed to update Admin Status";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    console.log("Form cancelled");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span>Dashboard</span>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span>User Management</span>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span className="text-gray-900">Edit User</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex gap-8 mb-8">
              {/* Left Side - User Info */}
              <div className="w-1/3">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Edit Info
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditingSelf
                    ? "Update your profile details."
                    : canEditAllFieldsExceptName
                    ? "Update user details (names cannot be changed)."
                    : "Update user details."}
                </p>

                {/* Permission indicator */}
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    {isEditingSelf && "You can edit all your profile details."}
                    {canEditAllFieldsExceptName &&
                      "You can edit all fields except first and last name."}
                    {!isEditingSelf &&
                      !canEditAllFieldsExceptName &&
                      "Limited editing permissions."}
                  </p>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="flex-1">
                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !canEditAllFields
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Enter first name"
                      disabled={!canEditAllFields}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !canEditAllFields
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Enter last name"
                      disabled={!canEditAllFields}
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !(canEditAllFields || canEditAllFieldsExceptName)
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="Enter email address"
                        disabled={
                          !(canEditAllFields || canEditAllFieldsExceptName)
                        }
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex">
                      <div className="relative">
                        <select
                          className={`appearance-none bg-white border border-gray-300 rounded-l-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                            !(canEditAllFields || canEditAllFieldsExceptName)
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            !(canEditAllFields || canEditAllFieldsExceptName)
                          }
                        >
                          <option>NG</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !(canEditAllFields || canEditAllFieldsExceptName)
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="+234**********"
                        disabled={
                          !(canEditAllFields || canEditAllFieldsExceptName)
                        }
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-500 ${
                          !(canEditAllFields || canEditAllFieldsExceptName)
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={
                          !(canEditAllFields || canEditAllFieldsExceptName)
                        }
                      >
                        <option value="">Select the Role</option>
                        {adminRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Formation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formation
                    </label>
                    <div className="relative">
                      <select
                        value={formData.formation}
                        onChange={(e) => handleFormationChange(e.target.value)} // CHANGED: Use handleFormationChange instead of handleInputChange
                        className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-500 ${
                          !(canEditAllFields || canEditAllFieldsExceptName)
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={
                          !(canEditAllFields || canEditAllFieldsExceptName)
                        }
                      >
                        <option value="">Select the Formation</option>
                        {adminFormation.map((formation) => (
                          <option key={formation.id} value={formation.id}>
                            {formation.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !(canEditAllFields || canEditAllFieldsExceptName)
                          ? "bg-gray-100 cursor-not-allowed"
                          : formData.formation
                          ? "bg-gray-50 text-gray-500"
                          : "" // Show as auto-filled when formation is selected
                      }`}
                      placeholder={
                        formData.formation
                          ? "Auto-filled from formation"
                          : "Enter address"
                      }
                      disabled={
                        !(canEditAllFields || canEditAllFieldsExceptName)
                      }
                      readOnly={!!formData.formation} // Make read-only when formation is selected
                    />
                  </div>

                  {/* Coordinate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coordinate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.coordinate}
                      onChange={(e) =>
                        handleInputChange("coordinate", e.target.value)
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !(canEditAllFields || canEditAllFieldsExceptName)
                          ? "bg-gray-100 cursor-not-allowed"
                          : formData.formation
                          ? "bg-gray-50 text-gray-500"
                          : "" // Show as auto-filled when formation is selected
                      }`}
                      placeholder={
                        formData.formation
                          ? "Auto-filled from formation"
                          : "Enter coordinate"
                      }
                      disabled={
                        !(canEditAllFields || canEditAllFieldsExceptName)
                      }
                      readOnly={!!formData.formation} // Make read-only when formation is selected
                    />
                  </div>

                  {/* Rank */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rank
                    </label>
                    <div className="relative">
                      <select
                        value={formData.rank}
                        onChange={(e) =>
                          handleInputChange("rank", e.target.value)
                        }
                        className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-500 ${
                          !(canEditAllFields || canEditAllFieldsExceptName)
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={
                          !(canEditAllFields || canEditAllFieldsExceptName)
                        }
                      >
                        <option value="">Select the Rank</option>
                        {adminRanks.map((rank) => (
                          <option key={rank.id} value={rank.id}>
                            {rank.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Badge Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.badgeNumber}
                      onChange={(e) =>
                        handleInputChange("badgeNumber", e.target.value)
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !(canEditAllFields || canEditAllFieldsExceptName)
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Enter badge number"
                      disabled={
                        !(canEditAllFields || canEditAllFieldsExceptName)
                      }
                    />
                  </div>
                </div>

                <div className="flex w-full justify-between space-x-3 pt-6 border-t border-gray-200">
                  {/* Only show activate/deactivate for admins and not for self */}
                  {isCurrentUserAdmin && !isEditingSelf && (
                    <div onClick={ChangeUserStatus} className="cursor-pointer">
                      <h3
                        className={`font-semibold ${
                          adminActive ? "text-red-500" : "text-[#444CE7]"
                        }`}
                      >
                        {adminActive ? "Deactivate User" : "Activate User"}
                      </h3>
                    </div>
                  )}

                  <div className="flex gap-3 ml-auto">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isLoading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUser;
