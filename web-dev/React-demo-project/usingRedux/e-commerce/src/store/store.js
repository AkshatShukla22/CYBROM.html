// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import authReducer from './authSlice'
import adminReducer from './adminSlice'
import productReducer from './productSlice'
import orderReducer from './orderSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    admin: adminReducer,
    product: productReducer,
    order: orderReducer
  }
})