// src/components/admin/AdminOrderManagement.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, updateOrderStatus } from '../store/orderSlice'

const AdminOrderManagement = () => {
  const dispatch = useDispatch()
  const { allOrders, loading, error } = useSelector(state => state.order)
  const [filterStatus, setFilterStatus] = useState('all')
  const [updatingOrder, setUpdatingOrder] = useState(null)

  useEffect(() => {
    dispatch(fetchAllOrders())
  }, [dispatch])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId)
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus }))
      alert('Order status updated successfully!')
    } catch (error) {
      alert('Failed to update order status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107'
      case 'dispatched':
        return '#28a745'
      case 'delivered':
        return '#17a2b8'
      case 'cancelled':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = filterStatus === 'all' 
    ? allOrders 
    : allOrders.filter(order => order.status === filterStatus)

  const getOrderStats = () => {
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      dispatched: allOrders.filter(o => o.status === 'dispatched').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length
    }
    return stats
  }

  if (loading.fetching) {
    return <div>Loading orders...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const stats = getOrderStats()

  return (
    <div className="admin-order-management">
      <h2>Order Management</h2>
      
      {/* Order Stats */}
      <div className="order-stats">
        <div className="stat-item">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending</span>
          <span className="stat-value pending">{stats.pending}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dispatched</span>
          <span className="stat-value dispatched">{stats.dispatched}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Delivered</span>
          <span className="stat-value delivered">{stats.delivered}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cancelled</span>
          <span className="stat-value cancelled">{stats.cancelled}</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="order-filters">
        <label>Filter by Status:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="admin-orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div>
                        <strong>{order.userName}</strong>
                        <div className="customer-email">{order.userEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div className="order-items-preview">
                        {order.items.slice(0, 2).map(item => (
                          <div key={item.productId} className="item-preview">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="more-items">+{order.items.length - 2} more</div>
                        )}
                      </div>
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'dispatched')}
                            disabled={updatingOrder === order.id}
                            className="dispatch-btn"
                          >
                            {updatingOrder === order.id ? 'Updating...' : 'Dispatch'}
                          </button>
                        )}
                        {order.status === 'dispatched' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            disabled={updatingOrder === order.id}
                            className="deliver-btn"
                          >
                            {updatingOrder === order.id ? 'Updating...' : 'Mark Delivered'}
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'dispatched') && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            disabled={updatingOrder === order.id}
                            className="cancel-btn"
                          >
                            {updatingOrder === order.id ? 'Updating...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrderManagement