// pages/SupportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/SupportPage.css';
import SupportButton from '../components/SupportButton';

const SupportPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    subject: '',
    problemDetail: '',
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const submitData = new FormData();
    submitData.append('subject', formData.subject);
    submitData.append('problemDetail', formData.problemDetail);
    
    formData.images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      const response = await fetch(`${BACKEND_URL}/api/support/tickets`, {
        method: 'POST',
        credentials: 'include',
        body: submitData
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ticket created successfully!' });
        setFormData({ subject: '', problemDetail: '', images: [] });
        // Navigate to ticket detail page after creation
        setTimeout(() => {
          navigate(`/support/${data.ticket._id}`);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create ticket' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      console.error('Create ticket error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <SupportButton />
      <div className="support-header">
        <h1><i className="fas fa-headset"></i> Support Center</h1>
      </div>

      {message.text && (
        <div className={`support-message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      <div className="create-ticket-form">
        <h2><i className="fas fa-ticket-alt"></i> Create New Support Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <i className="fas fa-heading"></i> Subject
            </label>
            <input
              type="text"
              name="subject"
              className="form-input"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-align-left"></i> Problem Detail
            </label>
            <textarea
              name="problemDetail"
              className="form-textarea"
              placeholder="Describe your problem in detail..."
              value={formData.problemDetail}
              onChange={handleInputChange}
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-images"></i> Attach Images (Optional, max 5)
            </label>
            <input
              type="file"
              className="form-file-input"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {formData.images.length > 0 && (
              <div className="selected-files">
                <i className="fas fa-paperclip"></i> {formData.images.length} file(s) selected
              </div>
            )}
          </div>

          <button type="submit" className="submit-ticket-btn" disabled={loading}>
            <i className="fas fa-paper-plane"></i>
            {loading ? ' Submitting...' : ' Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;