import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllProducts } from '../store/productSlice'
import { addProduct, updateProduct, deleteProduct } from '../store/adminSlice'
import '../style/adminProductManagement.css'

const AdminProductManagement = () => {
  const dispatch = useDispatch()
  
  // Access Redux state - simplified and more direct
  const productState = useSelector(state => state.product)
  const adminState = useSelector(state => state.admin)
  
  // Destructure with fallbacks
  const products = productState?.products || []
  const isLoading = productState?.loading?.products || false
  const productError = productState?.error?.products
  const adminLoading = adminState?.loading?.productOperation || false
  const adminError = adminState?.error?.productOperation
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: '',
    rating: '0',
    brand: ''
  })

  useEffect(() => {
    console.log('Component mounted, fetching products...')
    dispatch(fetchAllProducts())
  }, [dispatch])

  // Debug logs
  useEffect(() => {
    console.log('Products state:', products)
    console.log('Loading state:', isLoading)
    console.log('Error state:', productError)
  }, [products, isLoading, productError])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      rating: parseFloat(formData.rating)
    }

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ 
          productId: editingProduct.id, 
          updateData: productData 
        })).unwrap()
      } else {
        await dispatch(addProduct(productData)).unwrap()
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        image: '',
        rating: '0',
        brand: ''
      })
      setShowAddForm(false)
      setEditingProduct(null)
      
      // Refresh products list
      dispatch(fetchAllProducts())
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      category: product.category || '',
      stock: product.stock?.toString() || '',
      image: product.image || '',
      rating: product.rating?.toString() || '0',
      brand: product.brand || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap()
        dispatch(fetchAllProducts())
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      stock: '',
      image: '',
      rating: '0',
      brand: ''
    })
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!product) return false
    
    const searchLower = searchTerm.toLowerCase()
    return (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower))
    )
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading products...</div>
      </div>
    )
  }

  return (
    <div className="admin-product-management">
      {/* Debug information */}
      <div className="debug-info">
        <strong>Debug Info:</strong>
        <div>Products count: {products.length}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Error: {productError || adminError || 'None'}</div>
      </div>

      <div className="admin-header">
        <h2>Product Management</h2>
        <div className="admin-controls">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowAddForm(true)} className="add-product-btn">
            Add Product
          </button>
        </div>
      </div>

      {/* Show errors */}
      {(productError || adminError) && (
        <div className="error-message">
          Error: {productError || adminError}
        </div>
      )}

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Brand:</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Category:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Audio">Audio</option>
                  <option value="Tablets">Tablets</option>
                  <option value="Smart TV">Smart TV</option>
                  <option value="Camera">Camera</option>
                  <option value="Desktop PC">Desktop PC</option>
                  <option value="Smart Watch">Smart Watch</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Rating:</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="form-textarea"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="form-btn form-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={adminLoading} className="form-btn form-btn-primary">
                  {adminLoading ? 'Saving...' : (editingProduct ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr key={product.id || index}>
                  <td>
                    <img 
                      src={product.image || 'https://via.placeholder.com/50x50?text=No+Image'} 
                      alt={product.name || 'Product'}
                      width="50"
                      height="50"
                      className="product-images"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50x50?text=No+Image'
                      }}
                    />
                  </td>
                  <td>
                    <div className="product-info">
                      <div className="product-name">{product.name || 'N/A'}</div>
                      <div className="product-description">
                        {product.description ? `${product.description.substring(0, 50)}...` : 'No description'}
                      </div>
                    </div>
                  </td>
                  <td>{product.brand || 'N/A'}</td>
                  <td>{product.category || 'N/A'}</td>
                  <td>₹{product.price || 0}</td>
                  <td>{product.stock || 0}</td>
                  <td>{product.rating || 0}/5</td>
                  <td>
                    <div className="product-actions">
                      <button onClick={() => handleEdit(product)} className="action-btn action-btn-edit">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={adminLoading}
                        className="action-btn action-btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  {products.length === 0 ? 'No products found' : 'No products match your search'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Statistics */}
      <div className="statistics-section">
        <h3>Product Statistics</h3>
        <div className="statistics-grid">
          <div className="stat-item">
            <strong>Total Products:</strong> 
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-item">
            <strong>Products Found:</strong> 
            <div className="stat-value">{filteredProducts.length}</div>
          </div>
          <div className="stat-item">
            <strong>Low Stock Products:</strong> 
            <div className="stat-value">{products.filter(p => (p.stock || 0) < 10).length}</div>
          </div>
          <div className="stat-item">
            <strong>Out of Stock:</strong> 
            <div className="stat-value">{products.filter(p => (p.stock || 0) === 0).length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProductManagement