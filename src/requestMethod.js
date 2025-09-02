import axios from "axios";
// Import logout action
import { store } from "./Redux/Store"; // Import Redux store
import { toast } from "react-toastify";
import { LogOut } from "./Redux/LoginSlice";

const BASE_URL = 'https://admin-api.thegatewayshield.com/api/v1';

export const publicRequest = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Global Response Interceptor for Handling Token Expiry
publicRequest.interceptors.response.use(
  (response) => response, // Pass successful response as is
  (error) => {
    const token = store.getState().user?.currentUser?.tokens?.access?.token;
    
    // ✅ Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && token) {
      toast.error("Session expired. Please log in again.");
      store.dispatch(LogOut()); // ✅ Reset all state via logout
      window.location.href = "/"; // ✅ Redirect to login page
      return Promise.reject(error);
    }
    
    // ✅ Handle 400 Access Denied (existing logic)
    if (
      error.response?.status === 400 &&
      error.response?.data?.message === "Access denied" &&
      token
    ) {
      toast.error("Session expired. Please log in again.");
      store.dispatch(LogOut()); // ✅ Reset all state via logout
      window.location.href = "/"; // ✅ Redirect to login page
    }

    return Promise.reject(error); // Pass error to further handlers
  }
);

export const userRequest = (token) => {
  const request = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // ✅ Add the same interceptor to userRequest instances
  request.interceptors.response.use(
    (response) => response,
    (error) => {
      const currentToken = store.getState().user?.currentUser?.tokens?.access?.token;
      
      // ✅ Handle 401 Unauthorized
      if (error.response?.status === 401 && currentToken) {
        toast.error("Session expired. Please log in again.");
        store.dispatch(LogOut());
        window.location.href = "/";
        return Promise.reject(error);
      }
      
      // ✅ Handle 400 Access Denied
      if (
        error.response?.status === 400 &&
        error.response?.data?.message === "Access denied" &&
        currentToken
      ) {
        toast.error("Session expired. Please log in again.");
        store.dispatch(LogOut());
        window.location.href = "/";
      }

      return Promise.reject(error);
    }
  );

  return request;
};