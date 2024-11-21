import { createSlice } from "@reduxjs/toolkit";

const otp = createSlice({
  name: "otp",
  initialState: {
    otp: null
  },
  reducers: {
    createOtp(state, action) {
      state.otp = action.payload;
    }
  }
});

export const otpAction = otp.actions;

export default otp;
