import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  isCartOpen: false
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload
      const existingItem = state.items.find(item => item.id === newItem.id)
      
      if (!existingItem) {
        state.items.push({
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
          quantity: 1,
          totalPrice: newItem.price
        })
        state.totalQuantity++
        state.totalAmount += newItem.price
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload
      const existingItem = state.items.find(item => item.id === id)
      
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity
        state.totalAmount -= existingItem.totalPrice
        state.items = state.items.filter(item => item.id !== id)
      }
    },
    increaseQuantity: (state, action) => {
      const id = action.payload
      const existingItem = state.items.find(item => item.id === id)
      
      if (existingItem) {
        existingItem.quantity++
        existingItem.totalPrice += existingItem.price
        state.totalQuantity++
        state.totalAmount += existingItem.price
      }
    },
    decreaseQuantity: (state, action) => {
      const id = action.payload
      const existingItem = state.items.find(item => item.id === id)
      
      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity--
        existingItem.totalPrice -= existingItem.price
        state.totalQuantity--
        state.totalAmount -= existingItem.price
      }
    },
    clearCart: (state) => {
      state.items = []
      state.totalQuantity = 0
      state.totalAmount = 0
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen
    }
  }
})

export const { 
  addToCart, 
  removeFromCart, 
  increaseQuantity, 
  decreaseQuantity, 
  clearCart, 
  toggleCart 
} = cartSlice.actions

export default cartSlice.reducer