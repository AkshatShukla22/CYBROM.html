// src/pages/OrdersPage.jsx
import React from 'react'
import { useSelector } from 'react-redux'
import OrderList from '../components/OrderList'

const OrdersPage = () => {
  const { user } = useSelector(state => state.auth)

  if (!user) {
    return (
      <div className="orders-page">
        <div className="container">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="container">
        <OrderList />
      </div>
    </div>
  )
}

export default OrdersPage