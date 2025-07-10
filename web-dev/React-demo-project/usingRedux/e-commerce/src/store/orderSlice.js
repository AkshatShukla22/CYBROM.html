// src/store/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../services/orderService';

// Async thunks
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      return await orderService.getOrdersByUserId(userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getAllOrders();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(orderId, status);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    userOrders: [],
    allOrders: [],
    loading: {
      creating: false,
      fetching: false,
      updating: false,
    },
    error: null,
    success: false,
  },
  reducers: {
    clearOrderState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearOrders: (state) => {
      state.userOrders = [];
      state.allOrders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.userOrders.unshift(action.payload);
        state.allOrders.unshift(action.payload);
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading.fetching = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading.fetching = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading.fetching = false;
        state.error = action.payload;
      })
      
      // Fetch All Orders (Admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading.fetching = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading.fetching = false;
        state.allOrders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading.fetching = false;
        state.error = action.payload;
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updatedOrder = action.payload;
        
        // Update in allOrders
        const orderIndex = state.allOrders.findIndex(order => order.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.allOrders[orderIndex] = updatedOrder;
        }
        
        // Update in userOrders
        const userOrderIndex = state.userOrders.findIndex(order => order.id === updatedOrder.id);
        if (userOrderIndex !== -1) {
          state.userOrders[userOrderIndex] = updatedOrder;
        }
        
        state.success = true;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderState, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;