import axios from "axios";
// Import logout action
import { store } from "./Redux/Store"; // Import Redux store
import { toast } from "react-toastify";
import { LogOut } from "./Redux/LoginSlice";

const BASE_URL = import.meta.env.VITE_STAFF_WEB_BASE_URL;


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
    const token = store.getState().user?.currentUser?.tokens?.access?.token
    // ✅ If API responds with "Access Denied" and token exists, force logout
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

console.log("state",store.getState());

export const userRequest = (token) => axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
