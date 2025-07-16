// src/services/orderService.js
const API_URL = 'http://localhost:3000';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Error creating order: ' + error.message);
    }
  },

  // Get orders by user ID
  getOrdersByUserId: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/orders?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Error fetching orders: ' + error.message);
    }
  },

  // Get all orders (admin)
  getAllOrders: async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Error fetching orders: ' + error.message);
    }
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          updatedAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Error updating order status: ' + error.message);
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Error fetching order: ' + error.message);
    }
  },

  // Cancel order (user)
  cancelOrder: async (orderId) => {
    try {
      // First, get the order to check if it can be cancelled
      const orderResponse = await fetch(`${API_URL}/orders/${orderId}`);
      
      if (!orderResponse.ok) {
        throw new Error('Order not found');
      }
      
      const order = await orderResponse.json();
      
      // Check if order can be cancelled
      if (order.status === 'delivered') {
        throw new Error('Cannot cancel delivered order');
      }
      
      if (order.status === 'cancelled') {
        throw new Error('Order is already cancelled');
      }
      
      // Update order status to cancelled
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
          cancelledAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Error cancelling order: ' + error.message);
    }
  }
};