import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';

const AdminPurchasesPanel = ({ setMessage, navigate }) => {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/purchases`, { credentials: 'include' });
      if (response.status === 401) { navigate('/login'); return; }
      const data = await response.json();
      if (response.ok) setPurchases(data.purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="action-bar">
        <h2>Purchase Tracking</h2>
        <input
          type="text"
          className="search-input-admin"
          placeholder="Search by user or game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="purchases-list">
        {filteredPurchases.map(purchase => (
          <div key={purchase._id} className="purchase-card">
            <div className="purchase-info">
              <p><strong><i className="fas fa-user"></i> User:</strong> {purchase.user.username}</p>
              <p><strong><i className="fas fa-gamepad"></i> Game:</strong> {purchase.game.name}</p>
            </div>
            <div className="purchase-details">
              <p><strong><i className="fas fa-rupee-sign"></i> Price:</strong> ₹{purchase.price}</p>
              <p><strong><i className="far fa-calendar"></i> Date:</strong> {new Date(purchase.purchasedAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {filteredPurchases.length === 0 && (
          <div className="no-data">
            <i className="fas fa-shopping-cart"></i>
            <p>No purchases found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPurchasesPanel;