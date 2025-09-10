// utils/apiUtils.js

const API_BASE_URL = 'http://localhost:8000/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

// Doctor-related API functions
export const doctorAPI = {
  // Get all doctors with filters
  getAllDoctors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/doctors?${queryString}` : '/doctors';
    return apiRequest(endpoint);
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: async (specialization, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/doctors/specialization/${specialization}?${queryString}`
      : `/doctors/specialization/${specialization}`;
    return apiRequest(endpoint);
  },

  // Get doctor statistics
  getDoctorStats: async () => {
    return apiRequest('/doctors/stats');
  },

  // Get single doctor by ID
  getDoctorById: async (id) => {
    return apiRequest(`/doctors/${id}`);
  },

  // Search doctors
  searchDoctors: async (searchQuery, params = {}) => {
    const allParams = { ...params, search: searchQuery };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/doctors/search?${queryString}`);
  }
};

// User/Auth related API functions
export const authAPI = {
  // Login
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Upload image
  uploadImage: async (imageFile, type = 'profile') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('type', type);

    return apiRequest(`/auth/upload-image/${type}`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  },

  // Logout
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  }
};

// Appointment related API functions (for future use)
export const appointmentAPI = {
  // Book appointment
  bookAppointment: async (appointmentData) => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  // Get user appointments
  getUserAppointments: async (userId) => {
    return apiRequest(`/appointments/user/${userId}`);
  },

  // Get doctor appointments
  getDoctorAppointments: async (doctorId) => {
    return apiRequest(`/appointments/doctor/${doctorId}`);
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    return apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
    });
  }
};

// Utility functions
export const utils = {
  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format time
  formatTime: (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  },

  // Get full image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return '/api/placeholder/150/150';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  },

  // Debounce function for search
  debounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  // Calculate distance between two coordinates (for location-based features)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  } else if (error.message.includes('404')) {
    return 'Resource not found.';
  } else if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

export default {
  doctorAPI,
  authAPI,
  appointmentAPI,
  utils,
  handleApiError
};