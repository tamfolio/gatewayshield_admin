// apiCalls.js
import {publicRequest, userRequest} from '../requestMethod'
import { loginStart, loginSuccess, LoginFailure, setAdminRoles } from "./LoginSlice";

export const loginUser = async (dispatch, data) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("auth/login/email", data);
    dispatch(loginSuccess(res.data));
    
    // Fetch admin roles after successful login (non-blocking)
    // Updated to use the correct token path
    fetchAdminRoles(dispatch, res.data.data.tokens.access.token).catch(err => {
      console.warn("Admin roles fetch failed, but login succeeded:", err);
    });
    
  } catch (error) {
    dispatch(LoginFailure(error?.response?.data?.error))
    throw error
  }
};

export const loginAdmin = async (dispatch, data) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("/auth/login", data);
    dispatch(loginSuccess(res.data));
    
    // Fetch admin roles after successful admin login (non-blocking)
    // Updated to use the correct token path
    fetchAdminRoles(dispatch, res.data.data.tokens.access.token).catch(err => {
      console.warn("Admin roles fetch failed, but login succeeded:", err);
    });
    
  } catch (error) {
    dispatch(LoginFailure(error?.response?.data?.error || error?.data))
    window.localStorage.setItem("error", error)
    throw error
  }
};

// Updated function to fetch admin roles with better error handling
export const fetchAdminRoles = async (dispatch, token) => {
  try {
    const res = await userRequest(token).get("/options/adminRoles/all");
    dispatch(setAdminRoles(res.data?.data?.adminRoles || []));
    console.log("✅ Admin roles fetched successfully");
    return res.data?.data?.adminRoles || [];
  } catch (err) {
    console.error("❌ Failed to fetch admin roles:", err);
    
    // Check if it's an authentication error
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn("Token may not be valid yet for admin roles endpoint");
    }
    
    // Set empty array as fallback
    dispatch(setAdminRoles([]));
    
    // Re-throw the error so calling code can handle it
    throw err;
  }
};