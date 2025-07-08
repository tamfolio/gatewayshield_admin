// loginSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: {},
  isFetching: false,
  error: false,
  success: false,
};

const loginSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
      state.success = false;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      
      // Debug logging
      console.log('Login payload:', action.payload);
      
      // Normalize the payload structure
      if (action.payload.data) {
        // Google login format
        console.log('Using Google login format');
        state.currentUser = action.payload.data;
      } else {
        // Normal login format - wrap in data object
        console.log('Using normal login format');
        state.currentUser = {
          user: action.payload.user,
          tokens: {
            access: {
              token: action.payload.token
            }
          }
        };
      }
      
      console.log('Final currentUser:', state.currentUser);
      state.success = true;
      state.error = false;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
    LoginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
      state.success = false;
    },
    LogOut: (state) => {
      state.currentUser = {};
      state.error = false;
      state.success = false;
      state.otpSuccess = false;
      state.otpError = false;
    },
  },
});

export const { loginStart, loginSuccess, LoginFailure,LogOut,resetSuccess } = loginSlice.actions;
export default loginSlice.reducer;
