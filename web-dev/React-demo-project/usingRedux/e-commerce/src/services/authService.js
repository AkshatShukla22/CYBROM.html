// Authentication Service
const API_BASE_URL = 'http://localhost:3000'

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?email=${email}&password=${password}`)
      if (!response.ok) {
        throw new Error('Failed to login')
      }
      const users = await response.json()
      
      if (users.length === 0) {
        throw new Error('Invalid email or password')
      }
      
      const user = users[0]
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', user.id) // Simple token simulation
      
      return user
    } catch (error) {
      throw error
    }
  },

  // Register user
  register: async (userData) => {
    try {
      // Check if user already exists
      const existingUserResponse = await fetch(`${API_BASE_URL}/users?email=${userData.email}`)
      const existingUsers = await existingUserResponse.json()
      
      if (existingUsers.length > 0) {
        throw new Error('User already exists with this email')
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (!response.ok) {
        throw new Error('Failed to register user')
      }

      const user = await response.json()
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', user.id)
      
      return user
    } catch (error) {
      throw error
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      return null
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    return !!token
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  },

  // Update user profile
  updateProfile: async (userId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error) {
      throw error
    }
  }
}