import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../Redux/apiCalls";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { publicRequest } from "../../requestMethod";
import {
  LoginFailure,
  loginStart,
  loginSuccess,
} from '../../Redux/LoginSlice'
import { GoogleLogin } from "@react-oauth/google";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const credentials = {
      email,
      password,
    };

    try {
    //   await loginUser(dispatch, credentials);
    //   toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
    //   toast.error(err?.response?.data?.error);
    //   console.error("Login Error:", err?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  

 

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl  p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <img src="/assets/Logomark.svg" alt="" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Log in to your account
            </h1>
            <p className="text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => console.log("Forgot password clicked")}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Link to="/forgot-password">Forgot password</Link>
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium transform transition-all duration-200 shadow-lg ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-xl"
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

       

       
        </div>
      </div>
    </div>
  );
}
