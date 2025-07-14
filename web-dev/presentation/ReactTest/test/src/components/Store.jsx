import { configureStore } from "@reduxjs/toolkit";
import colorReducer from './colorSlice';
import counterReducer from './counterSlice';
import todoReducer from './todoSlice';

const store = configureStore({
  reducer: {
    mycolor: colorReducer,
    myCounter: counterReducer,
    todo: todoReducer
  }
});

export default store;
