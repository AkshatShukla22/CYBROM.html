// Store02.jsx
import { configureStore } from "@reduxjs/toolkit";
import myReducer from './colorSlice';
const store = configureStore({
    reducer:{
        mycolor:myReducer
    }
})
export default store;