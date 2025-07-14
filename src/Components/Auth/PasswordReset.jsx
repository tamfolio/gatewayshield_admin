import React, { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { publicRequest } from "../../requestMethod";
import { toast } from "react-toastify";

export const SetNewPasswordStep = ({ otp, setCurrentStep }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    specialChar: false,
  });

  


  // Validate password requirements
  const validatePassword = (pwd) => {
    const requirements = {
      minLength: pwd.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    setPasswordRequirements(requirements);
    return requirements;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    validatePassword(pwd);
  };

const resetPassword = async (otp,password) => {
    const stringOtp = otp.join("");
    try {
      const res = await publicRequest.post("/auth/password/reset", {
        otp: stringOtp,
        password: password,
      });
      toast.success("Password reset successful!");
      return res.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to reset password.";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async () => {
    try {
      await resetPassword( otp, password );
      setCurrentStep(4); // Move to success/confirmation step
    } catch (error) {
      console.log(error)
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-8">
              <img src="/assets/Logomark.svg" alt="Logo" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Set new password
            </h2>
            <p className="text-gray-600">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          <div className="space-y-6">
            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirements.minLength
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  {passwordRequirements.minLength ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    passwordRequirements.minLength
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  Must be at least 8 characters
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirements.specialChar
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  {passwordRequirements.specialChar ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    passwordRequirements.specialChar
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  Must contain one special character
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
             onClick={handleSubmit}
             disabled={
               !passwordRequirements.minLength ||
               !passwordRequirements.specialChar ||
               password !== confirmPassword
             }
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Reset password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
