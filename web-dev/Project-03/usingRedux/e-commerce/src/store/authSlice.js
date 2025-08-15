import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

// Async Thunks for Authentication
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      // Store token in localStorage if needed
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('token');
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (updateData, { rejectWithValue }) => {
    try {
      const updatedUser = await authService.updateProfile(updateData);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const user = await authService.verifyToken(token);
      return user;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      await authService.resetPassword(email);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Additional state for better UX
  isInitialized: false, // Track if auth state has been initialized
  
  // Operation-specific loading states
  loading: {
    login: false,
    register: false,
    logout: false,
    updateProfile: false,
    verifyToken: false,
    changePassword: false,
    resetPassword: false
  },
  
  // Success messages for operations
  successMessage: null,
  
  // Remember user preference
  rememberMe: false,
  
  // User permissions/roles
  userRole: null,
  permissions: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear specific errors
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear success messages
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Clear all messages
    clearAllMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    
    // Set remember me preference
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    
    // Initialize auth state (useful for app startup)
    initializeAuth: (state) => {
      state.isInitialized = true;
    },
    
    // Update user data locally
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Backward compatibility - alias for updateUserData
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Set user permissions
    setUserPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    
    // Backward compatibility actions
    loginStart: (state) => {
      state.loading.login = true;
      state.error = null;
    },
    
    loginSuccess: (state, action) => {
      state.loading.login = false;
      state.isAuthenticated = true;
      state.user = action.payload.user || action.payload;
      state.userRole = action.payload.user?.role || action.payload.role || null;
      state.permissions = action.payload.user?.permissions || action.payload.permissions || [];
      state.error = null;
    },
    
    loginFailure: (state, action) => {
      state.loading.login = false;
      state.isAuthenticated = false;
      state.user = null;
      state.userRole = null;
      state.permissions = [];
      state.error = action.payload;
    },
    
    // Simple logout (synchronous - for backward compatibility)
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userRole = null;
      state.permissions = [];
      state.error = null;
      state.successMessage = null;
      localStorage.removeItem('token');
    },
    
    // Manual logout (for cases where async logout isn't needed)
    logoutImmediate: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userRole = null;
      state.permissions = [];
      state.error = null;
      state.successMessage = null;
      localStorage.removeItem('token');
    }
  },
  
  extraReducers: (builder) => {
    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading.login = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.login = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userRole = action.payload.user?.role || null;
        state.permissions = action.payload.user?.permissions || [];
        state.error = null;
        state.successMessage = 'Login successful!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.login = false;
        state.isAuthenticated = false;
        state.user = null;
        state.userRole = null;
        state.permissions = [];
        state.error = action.payload;
      });
    
    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading.register = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading.register = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userRole = action.payload.user?.role || null;
        state.permissions = action.payload.user?.permissions || [];
        state.error = null;
        state.successMessage = 'Registration successful!';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading.register = false;
        state.isAuthenticated = false;
        state.user = null;
        state.userRole = null;
        state.permissions = [];
        state.error = action.payload;
      });
    
    // Logout User
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading.logout = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading.logout = false;
        state.isAuthenticated = false;
        state.user = null;
        state.userRole = null;
        state.permissions = [];
        state.error = null;
        state.successMessage = 'Logout successful!';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading.logout = false;
        // Still logout locally even if server request fails
        state.isAuthenticated = false;
        state.user = null;
        state.userRole = null;
        state.permissions = [];
        state.error = action.payload;
      });
    
    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading.updateProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading.updateProfile = false;
        state.user = action.payload;
        state.error = null;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.error = action.payload;
      });
    
    // Verify Token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.loading.verifyToken = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading.verifyToken = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.userRole = action.payload?.role || null;
        state.permissions = action.payload?.permissions || [];
        state.isInitialized = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading.verifyToken = false;
        state.isAuthenticated = false;
        state.user = null;
        state.userRole = null;
        state.permissions = [];
        state.isInitialized = true;
      });
    
    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading.changePassword = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading.changePassword = false;
        state.error = null;
        state.successMessage = 'Password changed successfully!';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading.changePassword = false;
        state.error = action.payload;
      });
    
    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading.resetPassword = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading.resetPassword = false;
        state.error = null;
        state.successMessage = 'Password reset email sent!';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading.resetPassword = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccessMessage,
  clearAllMessages,
  setRememberMe,
  initializeAuth,
  updateUserData,
  updateUser,
  setUserPermissions,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  logoutImmediate
} = authSlice.actions;

export default authSlice.reducer;