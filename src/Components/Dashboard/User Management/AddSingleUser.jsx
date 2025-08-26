import React, { useEffect, useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { userRequest } from "../../../requestMethod";
import useAccessToken from "../../../Utils/useAccessToken";
import { toast } from "react-toastify";

function AddSingleUser({ activeTab, setActiveTab }) {
  const token = useAccessToken();
  const [adminRoles, setAdminRoles] = useState([]);
  const [adminFormation, setAdminFormation] = useState([]);
  const [adminRanks, setAdminRanks] = useState([]);
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

  useEffect(() => {
    const fetchAdminRoles = async () => {
      try {
        const res = await userRequest(token).get("/options/adminRoles/canManage");

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

    if (token) {
      fetchAdminRoles();
      fetchAdminFormation();
      fetchAdminRanks();
    }
  }, [token]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle formation change and auto-populate address and coordinates
  const handleFormationChange = (formationId) => {
    const selectedFormation = adminFormation.find(formation => formation.id === formationId);
    
    setFormData((prev) => ({
      ...prev,
      formation: formationId,
      address: selectedFormation ? selectedFormation.address : "",
      coordinate: selectedFormation ? selectedFormation.coordinates : "",
    }));
  };

  const handleSubmit = async () => {
    const payload = {
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
    setIsLoading(true);
    try {
      const res = await userRequest(token).post("/admin/create", payload);
      toast.success(res.data.message);
      setFormData({
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
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      const message = err?.response?.data?.error || "❌ Failed to create admin";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    console.log("Form cancelled");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex gap-8 mb-8">
              {/* Left Side - User Info */}
              <div className="w-1/3">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  User Info
                </h2>
                <p className="text-sm text-gray-500">Add User details.</p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter last name"
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
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
                        <select className="appearance-none bg-white border border-gray-300 rounded-l-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
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
                        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+234**********"
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
                        className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-500"
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
                        onChange={(e) => handleFormationChange(e.target.value)}
                        className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-500"
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

                  {/* Address - Auto-populated from Formation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="Address will be auto-filled when formation is selected"
                    />
                  </div>

                  {/* Coordinate - Auto-populated from Formation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coordinate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.coordinate}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="Coordinates will be auto-filled when formation is selected"
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
                        className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter badge number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSingleUser;