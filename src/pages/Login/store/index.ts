import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./reducers";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const store = configureStore({
  reducer: {
    loginState: loginReducer,
  },
});

export default store;

export type LoginState = ReturnType<typeof store.getState>;
export const useLoginDispatch: () => typeof store.dispatch = useDispatch;
export const useLoginSelector: TypedUseSelectorHook<LoginState> = useSelector;
