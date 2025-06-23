import { configureStore } from "@reduxjs/toolkit";
import myReducer from './todoSlice';

const Store = configureStore({
    reducer:{
        todo: myReducer
    }
})

export default Store;
