import { toast } from "react-toastify";
import useAccessToken from "./useAccessToken";


export const signOutUser = async (navigate) => {
  try {
    // Get token from localStorage or Redux store
    const token = useAccessToken();
  
    
    // If no token, just clear everything and redirect
    if (!token) {
      console.log('No token found, clearing local data');
      clearUserData();
      toast.success("Signed out successfully!");
      navigate("/");
      return;
    }
    
    // Make API call to logout endpoint using GET method
    const response = await fetch('https://admin-api.thegatewayshield.com/api/v1/auth/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Clear data regardless of API response (401 means token is invalid anyway)
    clearUserData();

    if (response.ok) {
      toast.success("Signed out successfully!");
    } else if (response.status === 401) {
      // Token was invalid/expired, but we still cleared local data
      console.log('Token was invalid/expired, but local data cleared');
      toast.success("Signed out successfully!");
    } else {
      const errorData = await response.json();
      console.warn('Logout API warning:', errorData.error || 'Unknown error');
      toast.success("Signed out successfully!"); // Still show success since we cleared local data
    }
    
    // Navigate to login page
    navigate("/");
    
  } catch (err) {
    console.error("Logout Error:", err?.message || err);
    
    // Even if API call fails completely, clear local data and redirect
    clearUserData();
    toast.success("Signed out successfully!");
    navigate("/");
  }
};

// Helper function to clear all user data
const clearUserData = () => {
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
};