// components/SupportButton.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/SupportButton.css';

const SupportButton = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTicketsList, setShowTicketsList] = useState(false);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/support/tickets`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
        
        // Count tickets with admin replies that came after user's last message
        const unread = data.tickets.filter(ticket => {
          if (ticket.messages.length > 1) {
            const lastMessage = ticket.messages[ticket.messages.length - 1];
            return lastMessage.sender === 'admin';
          }
          return false;
        }).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleClick = () => {
    setShowTicketsList(!showTicketsList);
  };

  const handleTicketClick = (ticketId) => {
    setShowTicketsList(false);
    navigate(`/support/${ticketId}`);
  };

  const handleNewTicket = () => {
    setShowTicketsList(false);
    navigate('/support');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-open';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return 'fa-envelope-open';
      case 'in-progress': return 'fa-spinner';
      case 'resolved': return 'fa-check-circle';
      case 'closed': return 'fa-times-circle';
      default: return 'fa-envelope-open';
    }
  };

  return (
    <div className="support-button-container">
      <button 
        className="support-button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <i className="fas fa-comment-dots"></i>
        {unreadCount > 0 && (
          <span className="support-badge">{unreadCount}</span>
        )}
      </button>
      
      {showTooltip && !showTicketsList && (
        <div className="support-tooltip">Need Help?</div>
      )}

      {showTicketsList && (
        <div className="support-tickets-popup">
          <div className="popup-header">
            <h3><i className="fas fa-ticket-alt"></i> Your Support Tickets</h3>
            <button className="close-popup" onClick={() => setShowTicketsList(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <button className="new-ticket-popup-btn" onClick={handleNewTicket}>
            <i className="fas fa-plus"></i> Create New Ticket
          </button>

          <div className="popup-tickets-list">
            {tickets.length === 0 ? (
              <div className="no-tickets-popup">
                <i className="fas fa-inbox"></i>
                <p>No support tickets yet</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div
                  key={ticket._id}
                  className="popup-ticket-item"
                  onClick={() => handleTicketClick(ticket._id)}
                >
                  <div className="popup-ticket-header">
                    <span className="popup-ticket-subject">{ticket.subject}</span>
                    <span className={`popup-ticket-status ${getStatusColor(ticket.status)}`}>
                      <i className={`fas ${getStatusIcon(ticket.status)}`}></i>
                    </span>
                  </div>
                  <div className="popup-ticket-preview">
                    {ticket.problemDetail.substring(0, 60)}...
                  </div>
                  <div className="popup-ticket-footer">
                    <span className="popup-ticket-date">
                      <i className="far fa-calendar-alt"></i>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <span className="popup-ticket-messages">
                      <i className="far fa-comments"></i>
                      {ticket.messages.length}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportButton;