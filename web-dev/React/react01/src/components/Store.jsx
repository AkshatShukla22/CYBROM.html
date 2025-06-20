// Store.jsx
import { configureStore } from "@reduxjs/toolkit";
import myReducer from "./counterSlice";

const store = configureStore({
  reducer: {
    myCounter: myReducer
  }
});

export default store;
