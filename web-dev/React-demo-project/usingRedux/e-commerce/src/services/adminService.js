// Admin Service for Admin Panel Operations
const API_BASE_URL = 'http://localhost:3000'

export const adminService = {
  // User Management
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // Product Management
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  addProduct: async (productData) => {
    try {
      const newProduct = {
        id: Date.now().toString(),
        ...productData,
        createdAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      })

      if (!response.ok) {
        throw new Error('Failed to add product')
      }

      return await response.json()
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  },

  updateProduct: async (productId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  // Dashboard Statistics
  getDashboardStats: async () => {
    try {
      const [users, products] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllProducts()
      ])

      const totalUsers = users.length
      const totalProducts = products.length
      const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
      const lowStockProducts = products.filter(product => product.stock < 10).length

      return {
        totalUsers,
        totalProducts,
        totalValue,
        lowStockProducts,
        recentUsers: users.slice(-5).reverse(),
        topProducts: products.sort((a, b) => b.rating - a.rating).slice(0, 5)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }
}