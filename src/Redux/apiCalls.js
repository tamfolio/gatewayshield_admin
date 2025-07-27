// apiCalls.js
import {publicRequest, userRequest} from '../requestMethod'
import { loginStart, loginSuccess, LoginFailure, setAdminRoles } from "./LoginSlice";

export const loginUser = async (dispatch, data) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("auth/login/email", data);
    dispatch(loginSuccess(res.data));
    
    // Fetch admin roles after successful login
    await fetchAdminRoles(dispatch, res.data.token);
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
    
    // Fetch admin roles after successful admin login
    await fetchAdminRoles(dispatch, res.data.token);
  } catch (error) {
    dispatch(LoginFailure(error?.data))
    window.localStorage.setItem("error", error)
    throw error
  }
};

// New function to fetch admin roles
export const fetchAdminRoles = async (dispatch, token) => {
  try {
    const res = await userRequest(token).get("/options/adminRoles/all");
    dispatch(setAdminRoles(res.data?.data?.adminRoles || []));
  } catch (err) {
    console.error("❌ Failed to fetch admin roles:", err);
    // Optionally dispatch an error action or set empty array
    dispatch(setAdminRoles([]));
  }
};