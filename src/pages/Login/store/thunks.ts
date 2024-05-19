import { createAsyncThunk } from "@reduxjs/toolkit";
import { LoginState } from ".";
import axios from "axios";

export const login = createAsyncThunk("login", async (_, thunkApi) => {
  const { email, password } = (thunkApi.getState() as LoginState).loginState;
  const res = await axios.post("/rest/login", { email, password });
  return res;
});
