// src/components/orders/OrderList.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserOrders, cancelOrder } from '../store/orderSlice'
import '../style/orderList.css'

const OrderList = () => {
  const dispatch = useDispatch()
  const { userOrders, loading, error } = useSelector(state => state.order)
  const { user } = useSelector(state => state.auth)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders(user.id))
    }
  }, [dispatch, user])

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

  const canCancelOrder = (order) => {
    return order.status !== 'delivered' && order.status !== 'cancelled'
  }

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancellingOrderId(orderId)
      try {
        await dispatch(cancelOrder(orderId)).unwrap()
        // Refresh the orders list
        dispatch(fetchUserOrders(user.id))
      } catch (error) {
        console.error('Failed to cancel order:', error)
        alert('Failed to cancel order: ' + error)
      } finally {
        setCancellingOrderId(null)
      }
    }
  }

  if (loading.fetching) {
    return <div className="loading">Loading your orders...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="order-list">
      <h2>Your Orders</h2>
      
      {userOrders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-container">
          {userOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                  {order.cancelledAt && (
                    <p className="order-date cancelled">
                      Cancelled on {formatDate(order.cancelledAt)}
                    </p>
                  )}
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.productId} className="order-item">
                    <img src={item.image} alt={item.name} className="order-item-image" />
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{item.price}</p>
                    </div>
                    <div className="order-item-total">
                      ₹{item.totalPrice}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="order-totals">
                  <p>Total Items: {order.totalQuantity}</p>
                  <p className="order-total">Total Amount: ₹{order.totalAmount}</p>
                </div>
                
                {/* Cancel Order Button */}
                {canCancelOrder(order) && (
                  <div className="order-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id || loading.cancelling}
                    >
                      {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderList