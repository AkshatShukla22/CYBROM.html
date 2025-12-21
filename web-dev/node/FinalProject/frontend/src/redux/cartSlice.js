import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BACKEND_URL from '../utils/BackendURL';

// Async thunk for adding to cart via backend
export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ gameId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/add`, { // FIXED: users (plural)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ gameId, quantity: 1 })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching cart from backend
export const fetchCartAsync = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart`, { // FIXED: users (plural)
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch cart');
      }

      const data = await response.json();
      return data.cart || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for removing from cart
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/remove/${gameId}`, { // FIXED: users (plural)
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove from cart');
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating cart quantity
export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ gameId, quantity }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/update/${gameId}`, { // FIXED: users (plural)
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update cart');
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for clearing cart
export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/cart/clear`, { // FIXED: users (plural)
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear cart');
      }

      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  successMessage: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    // Add to cart
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Added to cart!';
        state.items = action.payload;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add to cart';
      });

    // Fetch cart
    builder
      .addCase(fetchCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove from cart
    builder
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.successMessage = 'Removed from cart';
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update cart quantity
    builder
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.successMessage = 'Cart updated';
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear cart
    builder
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.successMessage = 'Cart cleared';
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccessMessage } = cartSlice.actions;
export default cartSlice.reducer;