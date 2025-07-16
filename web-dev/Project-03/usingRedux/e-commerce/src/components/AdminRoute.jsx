import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import '../style/adminRoute.css';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  
  // Check if user is authenticated and is admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default AdminRoute