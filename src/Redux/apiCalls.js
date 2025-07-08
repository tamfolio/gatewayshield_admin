import {publicRequest} from '../requestMethod'
import { loginStart,loginSuccess,LoginFailure } from "./LoginSlice";

export const loginUser = async (dispatch, data) => {
    dispatch(loginStart());
    try {
      const res = await publicRequest.post("auth/login/email", data);
      dispatch(loginSuccess(res.data));
    } catch (error) {
      dispatch(LoginFailure(error?.response?.data?.error))
      throw error
    }
  };

  export const loginAdmin = async (dispatch, data) => {
    dispatch(loginStart());
    try {
      const res = await publicRequest.post("/admin/login", data);
      dispatch(loginSuccess(res.data));
    } catch (error) {
      dispatch(LoginFailure(error?.data))
      window.localStorage.setItem("error", error)
      
      throw error
    }
  };