import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../services/adminService';
import { fetchAllProducts } from './productSlice';

// User Management Async Thunks
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await adminService.getAllUsers();
      return users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const updatedUser = await adminService.updateUserStatus(id, status);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Product Management Async Thunks
export const addProduct = createAsyncThunk(
  'admin/addProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const product = await adminService.addProduct(productData);
      // Refresh products in the main product slice
      dispatch(fetchAllProducts());
      return product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ productId, updateData }, { rejectWithValue, dispatch }) => {
    try {
      const product = await adminService.updateProduct(productId, updateData);
      // Refresh products in the main product slice
      dispatch(fetchAllProducts());
      return product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await adminService.deleteProduct(productId);
      // Refresh products in the main product slice
      dispatch(fetchAllProducts());
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Dashboard Stats Async Thunk
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await adminService.getDashboardStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // User Management
  users: [],
  
  // Dashboard Stats
  dashboardStats: {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalValue: 0,
    lowStockProducts: 0,
    recentUsers: [],
    topProducts: []
  },
  
  // Loading States
  loading: {
    users: false,
    dashboardStats: false,
    productOperation: false,
    userOperation: false
  },
  
  // Error States
  error: {
    users: null,
    dashboardStats: null,
    productOperation: null,
    userOperation: null
  },
  
  // Current Operation Tracking
  currentOperation: null,
  
  // Admin Authentication
  isAdminAuthenticated: false,
  adminUser: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Admin Authentication
    setAdminAuthenticated: (state, action) => {
      state.isAdminAuthenticated = action.payload.isAuthenticated;
      state.adminUser = action.payload.user;
    },
    
    clearAdminAuth: (state) => {
      state.isAdminAuthenticated = false;
      state.adminUser = null;
    },
    
    // Operation Tracking
    setCurrentOperation: (state, action) => {
      state.currentOperation = action.payload;
    },
    
    clearCurrentOperation: (state) => {
      state.currentOperation = null;
    },
    
    // Error Management
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType && state.error[errorType]) {
        state.error[errorType] = null;
      }
    },
    
    clearAllErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    },
    
    // Stats Update
    updateDashboardStats: (state, action) => {
      state.dashboardStats = { ...state.dashboardStats, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    // Fetch All Users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading.users = true;
        state.error.users = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading.users = false;
        state.users = action.payload;
        state.dashboardStats.totalUsers = action.payload.length;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading.users = false;
        state.error.users = action.payload;
      });
    
    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading.userOperation = true;
        state.error.userOperation = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading.userOperation = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.dashboardStats.totalUsers = Math.max(0, state.dashboardStats.totalUsers - 1);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading.userOperation = false;
        state.error.userOperation = action.payload;
      });
    
    // Update User Status
    builder
      .addCase(updateUserStatus.pending, (state) => {
        state.loading.userOperation = true;
        state.error.userOperation = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading.userOperation = false;
        const userIndex = state.users.findIndex(user => user.id === action.payload.id);
        if (userIndex !== -1) {
          state.users[userIndex] = action.payload;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading.userOperation = false;
        state.error.userOperation = action.payload;
      });
    
    // Add Product
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading.productOperation = true;
        state.error.productOperation = null;
        state.currentOperation = 'adding';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading.productOperation = false;
        state.currentOperation = null;
        state.dashboardStats.totalProducts += 1;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading.productOperation = false;
        state.error.productOperation = action.payload;
        state.currentOperation = null;
      });
    
    // Update Product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading.productOperation = true;
        state.error.productOperation = null;
        state.currentOperation = 'updating';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading.productOperation = false;
        state.currentOperation = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading.productOperation = false;
        state.error.productOperation = action.payload;
        state.currentOperation = null;
      });
    
    // Delete Product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading.productOperation = true;
        state.error.productOperation = null;
        state.currentOperation = 'deleting';
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading.productOperation = false;
        state.currentOperation = null;
        state.dashboardStats.totalProducts = Math.max(0, state.dashboardStats.totalProducts - 1);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading.productOperation = false;
        state.error.productOperation = action.payload;
        state.currentOperation = null;
      });
    
    // Fetch Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.dashboardStats = true;
        state.error.dashboardStats = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.dashboardStats = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.dashboardStats = false;
        state.error.dashboardStats = action.payload;
      });
  }
});

export const {
  setAdminAuthenticated,
  clearAdminAuth,
  setCurrentOperation,
  clearCurrentOperation,
  clearError,
  clearAllErrors,
  updateDashboardStats
} = adminSlice.actions;

export default adminSlice.reducer;