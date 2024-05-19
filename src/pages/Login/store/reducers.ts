import { createSlice } from "@reduxjs/toolkit";
import { login } from "./thunks";

const initialLoginState = {
  email: "",
  password: "",
  error: "",
};

const loginSlice = createSlice({
  name: "loginState",
  initialState: initialLoginState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state) => {
      state.email = "";
      state.password = "";
      state.error = "";
    });
  },
});

export const { setEmail, setPassword, setError } = loginSlice.actions;
export default loginSlice.reducer;
