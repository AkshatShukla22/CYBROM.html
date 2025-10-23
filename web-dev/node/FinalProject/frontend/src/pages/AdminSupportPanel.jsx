// components/AdminSupportPanel.jsx
import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/AdminSupportPanel.css';

const AdminSupportPanel = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000); 
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/support/tickets`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setReply('');
    
    // Fetch full ticket details
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/support/tickets/${ticket._id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data.ticket);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/support/tickets/${selectedTicket._id}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ message: reply })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data.ticket);
        setReply('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Send reply error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/support/tickets/${selectedTicket._id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data.ticket);
        fetchTickets();
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/support/tickets/${selectedTicket._id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (error) {
      console.error('Delete ticket error:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'open': 'status-open',
      'in-progress': 'status-progress',
      'resolved': 'status-resolved',
      'closed': 'status-closed'
    };
    return colors[status] || 'status-open';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'open': 'fa-envelope-open',
      'in-progress': 'fa-spinner',
      'resolved': 'fa-check-circle',
      'closed': 'fa-times-circle'
    };
    return icons[status] || 'fa-envelope-open';
  };

  return (
    <div className="admin-support-panel">
      <div className="support-panel-header">
        <h2><i className="fas fa-headset"></i> Support Management</h2>
      </div>

      <div className="support-panel-container">
        <div className="tickets-sidebar">
          <div className="sidebar-header">
            <input
              type="text"
              className="search-tickets"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            {['all', 'open', 'in-progress', 'resolved', 'closed'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                <i className={`fas ${getStatusIcon(status)}`}></i>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="tickets-list-sidebar">
            {filteredTickets.length === 0 ? (
              <div className="no-tickets-sidebar">
                <i className="fas fa-inbox"></i>
                <p>No tickets found</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket._id}
                  className={`ticket-item-sidebar ${
                    selectedTicket?._id === ticket._id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className="ticket-item-header">
                    <span className={`status-dot ${getStatusColor(ticket.status)}`}></span>
                    <h4>{ticket.subject}</h4>
                  </div>
                  <p className="ticket-item-user">
                    <i className="fas fa-user"></i> {ticket.userName}
                  </p>
                  <p className="ticket-item-preview">
                    {ticket.problemDetail.substring(0, 50)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ticket-detail-panel">
          {selectedTicket ? (
            <>
              <div className="detail-panel-header">
                <div className="detail-title">
                  <h3><i className="fas fa-ticket-alt"></i> {selectedTicket.subject}</h3>
                  <span className={`ticket-status ${getStatusColor(selectedTicket.status)}`}>
                    <i className={`fas ${getStatusIcon(selectedTicket.status)}`}></i>
                    {selectedTicket.status}
                  </span>
                </div>
                <button
                  className="delete-ticket-btn"
                  onClick={handleDeleteTicket}
                  title="Delete ticket"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>

              <div className="detail-user-info">
                <div className="info-item">
                  <i className="fas fa-user"></i>
                  <div>
                    <span className="label">User</span>
                    <span className="value">{selectedTicket.userName}</span>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <span className="label">Email</span>
                    <span className="value">{selectedTicket.userEmail}</span>
                  </div>
                </div>
                <div className="info-item">
                  <i className="far fa-calendar-alt"></i>
                  <div>
                    <span className="label">Created</span>
                    <span className="value">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTicket.images && selectedTicket.images.length > 0 && (
                <div className="detail-images">
                  <h4><i className="fas fa-images"></i> Attached Images</h4>
                  <div className="images-grid">
                    {selectedTicket.images.map((image, index) => (
                      <a
                        key={index}
                        href={`${BACKEND_URL}/uploads/${image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="image-thumbnail"
                      >
                        <img src={`${BACKEND_URL}/uploads/${image}`} alt={`Attachment ${index + 1}`} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="chat-area">
                <div className="chat-messages-admin">
                  {selectedTicket.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message-admin ${msg.sender === 'user' ? 'user-message' : 'admin-message'}`}
                    >
                      <div className="message-header-admin">
                        <span className="sender-badge">
                          <i className={`fas ${msg.sender === 'user' ? 'fa-user' : 'fa-user-shield'}`}></i>
                          {msg.sender === 'user' ? 'User' : 'You'}
                        </span>
                        <span className="time-badge">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="message-content-admin">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="status-selector">
                  <label><i className="fas fa-flag"></i> Change Status:</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="status-select"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <form className="reply-form" onSubmit={handleSendReply}>
                  <textarea
                    className="reply-input"
                    placeholder="Type your solution or response..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={loading}
                    rows="4"
                  />
                  <button
                    type="submit"
                    className="send-reply-btn"
                    disabled={loading || !reply.trim()}
                  >
                    <i className="fas fa-paper-plane"></i>
                    {loading ? ' Sending...' : ' Send Reply'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-ticket-selected">
              <i className="fas fa-envelope-open"></i>
              <p>Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPanel;