import React, { useState } from "react";
import { publicRequest } from "../../requestMethod";
import { toast } from "react-toastify";
import { Mail, MoveLeft } from "lucide-react";

export const SignUpOtp = ({ formData, setFormData, onPrevious, onSubmit, setCurrentPage }) => {
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
    if (/^\d$/.test(e.key) && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) setTimeout(() => nextInput.focus(), 10);
    }
  };

  const handleFinalSubmit = async () => {
    const otp = otpDigits.join("");
    const {
      fullName,
      phoneNumber,
      state,
      address,
      gender,
      username,
      password,
    } = formData;

    const payload = {
      userName: username,
      fullName,
      address,
      phoneNumber,
      gender,
      state,
      provider: "Email",
      password,
      otp,
    };

    try {
      await publicRequest.post("/auth/signup/complete", payload);
      toast.success("Signup successful!");
      onSubmit(); // This will trigger the permission modal flow
    } catch (error) {
      const msg = error.response?.data?.error || "OTP verification failed.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 mt-20">
        <div className="max-w-md w-full space-y-8">
          <div className="text-left mb-4">
            <button
              onClick={onPrevious}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
            >
              ← Back
            </button>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-8">
              <Mail />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-gray-600">
              We sent an OTP to {formData?.email || "your email"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    digit ? "border-blue-500 text-blue-600" : "border-gray-300"
                  }`}
                  maxLength={1}
                />
              ))}
            </div>

            <button
              onClick={handleFinalSubmit}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Verify email
            </button>

            <div className="text-center">
              <span className="text-gray-600">Didn't receive the email? </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Click to resend
              </button>
            </div>
            <div className="text-center flex items-center justify-center gap-2 cursor-pointer" onClick={() => setCurrentPage(1)}>
            <MoveLeft />
              <span className="text-gray-600 font-semibold">Back to Login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
