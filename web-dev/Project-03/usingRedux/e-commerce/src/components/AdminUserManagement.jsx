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

  // Comprehensive debugging
  useEffect(() => {
    console.log('=== DEBUGGING USER DATA ===')
    console.log('Full Redux state:', { users, loading, error })
    console.log('Users array:', users)
    console.log('Users type:', typeof users)
    console.log('Users is array:', Array.isArray(users))
    console.log('Users length:', users?.length)
    
    if (users && users.length > 0) {
      console.log('First user:', users[0])
      console.log('First user keys:', Object.keys(users[0]))
      console.log('First user values:', Object.values(users[0]))
      
      // Check each field specifically
      console.log('ID field:', users[0].id)
      console.log('Name field:', users[0].name)
      console.log('Email field:', users[0].email)
      console.log('Phone field:', users[0].phone)
      console.log('CreatedAt field:', users[0].createdAt)
      
      // Check for common alternative field names
      console.log('Alternative fields check:')
      console.log('_id:', users[0]._id)
      console.log('fullName:', users[0].fullName)
      console.log('username:', users[0].username)
      console.log('firstName:', users[0].firstName)
      console.log('lastName:', users[0].lastName)
      console.log('phoneNumber:', users[0].phoneNumber)
      console.log('mobile:', users[0].mobile)
      console.log('created_at:', users[0].created_at)
      console.log('dateCreated:', users[0].dateCreated)
    }
    console.log('=== END DEBUGGING ===')
  }, [users])

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId))
    }
  }

  // Safe filtering with null checks
  const filteredUsers = users?.filter(user => {
    if (!user) return false
    const name = user.name || user.fullName || user.username || ''
    const email = user.email || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase())
  }) || []

  if (loading?.users) {
    return <div className="loading">Loading users...</div>
  }

  if (error?.users) {
    return <div className="error">Error: {error.users}</div>
  }

  // If users is not an array or is empty
  if (!Array.isArray(users)) {
    return (
      <div className="admin-user-management">
        <div className="error">
          Error: Users data is not in expected format. Check console for details.
        </div>
      </div>
    )
  }

  return (
    <div className="admin-user-management">
      <div className="header">
        <h2>User Management</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr className="table-header">
              <th> </th>
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
              filteredUsers.map((user, index) => {
                // More detailed logging for each user
                console.log(`User ${index}:`, user)
                
                return (
                  <tr key={user?.id || user?._id || index} className="table-row">
                    <td>{user?.id || user?._id || 'N/A'}</td>
                    <td>{user?.name || user?.fullName || user?.username || 'N/A'}</td>
                    <td>{user?.email || 'N/A'}</td>
                    <td>{user?.phone || user?.phoneNumber || user?.mobile || 'N/A'}</td>
                    <td>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 
                       user?.created_at ? new Date(user.created_at).toLocaleDateString() : 
                       user?.dateCreated ? new Date(user.dateCreated).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="user-actions">
                        <button
                          onClick={() => handleDeleteUser(user?.id || user?._id)}
                          className="delete-button"
                          disabled={loading?.userOperation}
                        >
                          {loading?.userOperation ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
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
        <p>Total Users: {users?.length || 0}</p>
        <p>Users found: {filteredUsers?.length || 0}</p>
      </div>
    </div>
  )
}

export default AdminUserManagement