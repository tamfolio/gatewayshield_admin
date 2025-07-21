import React, { useState } from "react";
import { publicRequest } from "../../requestMethod";
import { toast } from "react-toastify";
import { ForgotPasswordStep } from "./InitializePasswordReset";
import { CheckEmailStep } from "./ForgotPasswordOtp";
import { SetNewPasswordStep } from "./PasswordReset";
import { PasswordResetSuccessStep } from "./PasswordResetSuccess";

const ForgotPasswordFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const forgotPassword = async () => {
    try {
      const response = await publicRequest.post("/auth/password/forgot", {
        email,
      });

      toast.success("OTP sent to your email.");
      setCurrentStep(2);
      return response.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to send reset email."
      );
      throw error;
    }
  };

  const steps = {
    1: (
      <ForgotPasswordStep
        email={email}
        setEmail={setEmail}
        forgotPassword={forgotPassword}
      />
    ),
    2: (
      <CheckEmailStep
        email={email}
        otp={otp}
        handleOtpChange={handleOtpChange}
        handleOtpKeyDown={handleOtpKeyDown}
        setCurrentStep={setCurrentStep}
      />
    ),
    3: <SetNewPasswordStep otp={otp} setCurrentStep={setCurrentStep} />,
    4: <PasswordResetSuccessStep />,
  };

  return <div className="font-sans">{steps[currentStep]}</div>;
};

export default ForgotPasswordFlow;
