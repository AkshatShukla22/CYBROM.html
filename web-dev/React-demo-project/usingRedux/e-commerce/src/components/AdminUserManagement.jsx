import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers, deleteUser } from '../store/adminSlice'
import '../style/adminUserManagement.css'

const AdminUserManagement = () => {
  const dispatch = useDispatch()
  const { users, loading, error } = useSelector(state => state.admin)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [dispatch])

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId))
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading.users) {
    return <div className="loading">Loading users...</div>
  }

  if (error.users) {
    return <div className="error">Error: {error.users}</div>
  }

  return (
    <div className="admin-user-management">
      <div className="header">
        <h2>User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr className="table-header">
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id} className="table-row">
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="delete-button"
                      disabled={loading.userOperation}
                    >
                      {loading.userOperation ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-users">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="statistics">
        <h3>User Statistics</h3>
        <p>Total Users: {users.length}</p>
        <p>Users found: {filteredUsers.length}</p>
      </div>
    </div>
  )
}

export default AdminUserManagement