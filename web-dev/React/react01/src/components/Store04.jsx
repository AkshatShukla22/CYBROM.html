// Store04.jsx
import { configureStore } from "@reduxjs/toolkit";
import myReducer from "./todoSlice02";

const store = configureStore({
  reducer: {
    todo: myReducer,
  },
});

export default store;
