// Product service for API calls
class ProductService {
  constructor() {
    this.baseURL = 'http://localhost:3000';
  }

  // Get all products
  async getAllProducts() {
    try {
      const response = await fetch(`${this.baseURL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseURL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Get featured products (high-priced items)
  async getFeaturedProducts(limit = 8) {
    try {
      const products = await this.getAllProducts();
      return products
        .filter(product => product.price > 1000)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  // Get new arrivals (simulated by latest IDs)
  async getNewArrivals(limit = 10) {
    try {
      const products = await this.getAllProducts();
      return products
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  }

  // Get best sellers (simulated by random selection)
  async getBestSellers(limit = 10) {
    try {
      const products = await this.getAllProducts();
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  }

  // Get top rated products
  async getTopRatedProducts(limit = 10) {
    try {
      const products = await this.getAllProducts();
      return products
        .filter(product => product.rating >= 4.7)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top rated products:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm) {
    try {
      const products = await this.getAllProducts();
      return products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Filter products by price range
  async getProductsByPriceRange(minPrice, maxPrice) {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      );
    } catch (error) {
      console.error('Error filtering products by price:', error);
      throw error;
    }
  }

  // Get unique categories
  async getCategories() {
    try {
      const products = await this.getAllProducts();
      return [...new Set(products.map(product => product.category))];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get unique brands
  async getBrands() {
    try {
      const products = await this.getAllProducts();
      return [...new Set(products.map(product => product.brand))];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  // Sort products
  sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      case 'stock':
        return sorted.sort((a, b) => b.stock - a.stock);
      default:
        return sorted;
    }
  }

  // Filter products by multiple criteria
  filterProducts(products, filters) {
    let filtered = [...products];

    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Filter by brand
    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice);
    }

    // Filter by rating
    if (filters.minRating) {
      filtered = filtered.filter(product => product.rating >= filters.minRating);
    }

    // Filter by stock availability
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    return filtered;
  }
}

export const productService = new ProductService();