// pages/TicketDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/TicketDetailPage.css';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [ticket, setTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/support/tickets/${id}`, {
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.status === 403) {
        navigate('/support');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setTicket(data.ticket);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/support/tickets/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchTicket();
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
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

  if (loading && !ticket) {
    return (
      <div className="ticket-detail-page">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-page">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Ticket not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      <div className="ticket-detail-header">
        <button className="back-button" onClick={() => navigate('/support')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="ticket-info">
          <h1><i className="fas fa-ticket-alt"></i> {ticket.subject}</h1>
          <span className={`ticket-status ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="ticket-meta">
        <div className="meta-item">
          <i className="fas fa-user"></i>
          <span>{ticket.userName}</span>
        </div>
        <div className="meta-item">
          <i className="fas fa-envelope"></i>
          <span>{ticket.userEmail}</span>
        </div>
        <div className="meta-item">
          <i className="far fa-calendar-alt"></i>
          <span>{new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {ticket.images && ticket.images.length > 0 && (
        <div className="ticket-images">
          <h3><i className="fas fa-images"></i> Attached Images</h3>
          <div className="images-grid">
            {ticket.images.map((image, index) => (
              <a
                key={index}
                href={`${BACKEND_URL}/uploads/${image}`}
                target="_blank"
                rel="noopener noreferrer"
                className="image-link"
              >
                <img
                  src={`${BACKEND_URL}/uploads/${image}`}
                  alt={`Attachment ${index + 1}`}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {ticket.messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === 'user' ? 'message-user' : 'message-admin'}`}
            >
              <div className="message-header">
                <span className="message-sender">
                  <i className={`fas ${msg.sender === 'user' ? 'fa-user' : 'fa-user-shield'}`}></i>
                  {msg.sender === 'user' ? 'You' : 'Support Team'}
                </span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="message-content">
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {ticket.status !== 'closed' && (
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button type="submit" className="send-button" disabled={sending || !newMessage.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        )}

        {ticket.status === 'closed' && (
          <div className="ticket-closed-message">
            <i className="fas fa-lock"></i>
            <p>This ticket has been closed. Create a new ticket if you need further assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailPage;