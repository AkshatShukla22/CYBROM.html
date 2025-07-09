import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../services/productService';

// Async thunks for product operations
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productService.getAllProducts();
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const product = await productService.getProductById(id);
      return product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const products = await productService.getFeaturedProducts(limit);
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const products = await productService.getNewArrivals(limit);
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  'products/fetchBestSellers',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const products = await productService.getBestSellers(limit);
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopRatedProducts = createAsyncThunk(
  'products/fetchTopRated',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const products = await productService.getTopRatedProducts(limit);
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await productService.getCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Product lists
  products: [],
  featuredProducts: [],
  newArrivals: [],
  bestSellers: [],
  topRatedProducts: [],
  filteredProducts: [],
  
  // Single product
  currentProduct: null,
  
  // Categories and brands
  categories: [],
  brands: [],
  
  // Filter and sort state
  filters: {
    searchTerm: '',
    category: '',
    brand: '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    inStock: false,
    sortBy: ''
  },
  
  // Loading states
  loading: {
    products: false,
    featuredProducts: false,
    newArrivals: false,
    bestSellers: false,
    topRatedProducts: false,
    currentProduct: false,
    categories: false
  },
  
  // Error states
  error: {
    products: null,
    featuredProducts: null,
    newArrivals: null,
    bestSellers: null,
    topRatedProducts: null,
    currentProduct: null,
    categories: null
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Filter actions
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.filteredProducts = productService.filterProducts(state.products, state.filters);
    },
    
    setCategory: (state, action) => {
      state.filters.category = action.payload;
      state.filteredProducts = productService.filterProducts(state.products, state.filters);
    },
    
    setBrand: (state, action) => {
      state.filters.brand = action.payload;
      state.filteredProducts = productService.filterProducts(state.products, state.filters);
    },
    
    setPriceRange: (state, action) => {
      state.filters.minPrice = action.payload.min;
      state.filters.maxPrice = action.payload.max;
      state.filteredProducts = productService.filterProducts(state.products, state.filters);
    },
    
    setMinRating: (state, action) => {
      state.filters.minRating = action.payload;
      state.filteredProducts = productService.filterProducts(state.products, state.filters);
    },
    
    setInStock: (state, action) => {
      state.filters.inStock = action.payload;
      state.filteredProducts = productService.filterProducts(state.products, state.filters);
    },
    
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
      state.filteredProducts = productService.sortProducts(state.filteredProducts, action.payload);
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        category: '',
        brand: '',
        minPrice: null,
        maxPrice: null,
        minRating: null,
        inStock: false,
        sortBy: ''
      };
      state.filteredProducts = [...state.products];
    },
    
    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.error.currentProduct = null;
    },
    
    // Clear errors
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType && state.error[errorType]) {
        state.error[errorType] = null;
      }
    }
  },
  
  extraReducers: (builder) => {
    // Fetch all products
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading.products = true;
        state.error.products = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading.products = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
        state.categories = [...new Set(action.payload.map(product => product.category))];
        state.brands = [...new Set(action.payload.map(product => product.brand))];
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading.products = false;
        state.error.products = action.payload;
      });
    
    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading.currentProduct = true;
        state.error.currentProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading.currentProduct = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading.currentProduct = false;
        state.error.currentProduct = action.payload;
      });
    
    // Fetch featured products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading.featuredProducts = true;
        state.error.featuredProducts = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading.featuredProducts = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading.featuredProducts = false;
        state.error.featuredProducts = action.payload;
      });
    
    // Fetch new arrivals
    builder
      .addCase(fetchNewArrivals.pending, (state) => {
        state.loading.newArrivals = true;
        state.error.newArrivals = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.loading.newArrivals = false;
        state.newArrivals = action.payload;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.loading.newArrivals = false;
        state.error.newArrivals = action.payload;
      });
    
    // Fetch best sellers
    builder
      .addCase(fetchBestSellers.pending, (state) => {
        state.loading.bestSellers = true;
        state.error.bestSellers = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.loading.bestSellers = false;
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.loading.bestSellers = false;
        state.error.bestSellers = action.payload;
      });
    
    // Fetch top rated products
    builder
      .addCase(fetchTopRatedProducts.pending, (state) => {
        state.loading.topRatedProducts = true;
        state.error.topRatedProducts = null;
      })
      .addCase(fetchTopRatedProducts.fulfilled, (state, action) => {
        state.loading.topRatedProducts = false;
        state.topRatedProducts = action.payload;
      })
      .addCase(fetchTopRatedProducts.rejected, (state, action) => {
        state.loading.topRatedProducts = false;
        state.error.topRatedProducts = action.payload;
      });
    
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading.categories = true;
        state.error.categories = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.error.categories = action.payload;
      });
  }
});

export const {
  setSearchTerm,
  setCategory,
  setBrand,
  setPriceRange,
  setMinRating,
  setInStock,
  setSortBy,
  clearFilters,
  clearCurrentProduct,
  clearError
} = productSlice.actions;

export default productSlice.reducer;