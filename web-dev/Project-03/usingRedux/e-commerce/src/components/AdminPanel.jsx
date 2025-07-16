import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../store/adminSlice'
import AdminUserManagement from './AdminUserManagement'
import AdminProductManagement from './AdminProductManagement'
import AdminOrderManagement from './AdminOrderManagement'
import '../style/adminPanel.css'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const dispatch = useDispatch()
  const { dashboardStats, loading, error } = useSelector(state => state.admin)
  const { allOrders } = useSelector(state => state.order)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  const getOrderStats = () => {
    if (!allOrders || allOrders.length === 0) {
      return { total: 0, pending: 0, dispatched: 0, delivered: 0, cancelled: 0 }
    }
    
    return {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      dispatched: allOrders.filter(o => o.status === 'dispatched').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={dashboardStats} loading={loading.dashboardStats} orderStats={getOrderStats()} />
      case 'users':
        return <AdminUserManagement />
      case 'products':
        return <AdminProductManagement />
      case 'orders':
        return <AdminOrderManagement />
      default:
        return <DashboardView stats={dashboardStats} loading={loading.dashboardStats} orderStats={getOrderStats()} />
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-container">
        <h1 className="admin-panel-title">Admin Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          >
            Orders
          </button>
        </div>

        {/* Content Area */}
        {renderContent()}
      </div>
    </div>
  )
}

// Dashboard View Component
const DashboardView = ({ stats, loading, orderStats }) => {
  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard-view">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard title="Total Users" value={stats.totalUsers} color="#28a745" />
        <StatCard title="Total Products" value={stats.totalProducts} color="#007bff" />
        <StatCard title="Total Inventory Value" value={`₹${stats.totalValue?.toLocaleString()}`} color="#17a2b8" />
        <StatCard title="Low Stock Products" value={stats.lowStockProducts} color="#dc3545" />
        <StatCard title="Total Orders" value={orderStats.total} color="#6f42c1" />
        <StatCard title="Pending Orders" value={orderStats.pending} color="#ffc107" />
        <StatCard title="Dispatched Orders" value={orderStats.dispatched} color="#fd7e14" />
        <StatCard title="Delivered Orders" value={orderStats.delivered} color="#28a745" />
      </div>

      {/* Recent Users and Top Products */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Recent Users</h3>
          {stats.recentUsers?.length > 0 ? (
            <div>
              {stats.recentUsers.map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent users</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Top Rated Products</h3>
          {stats.topProducts?.length > 0 ? (
            <div>
              {stats.topProducts.map(product => (
                <div key={product.id} className="product-item">
                  <div className="product-name">{product.name}</div>
                  <div className="product-details">
                    Rating: {product.rating} | Stock: {product.stock}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No products found</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, color }) => (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <h4 className="stat-card-title">{title}</h4>
    <div className="stat-card-value" style={{ color: color }}>{value}</div>
  </div>
)

export default AdminPanel