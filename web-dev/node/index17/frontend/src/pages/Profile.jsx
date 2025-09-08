import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/BackendURl';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setFormData(data.user);
      } else {
        setError(data.message || 'Failed to fetch profile');
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsEditing(false);
        setError('');
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Profile update error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const formatSpecialization = (specialization) => {
    const specializations = {
      'cardiology': 'Cardiologist',
      'dermatology': 'Dermatologist', 
      'neurology': 'Neurologist',
      'pediatrics': 'Pediatrician',
      'orthopedics': 'Orthopedic Surgeon',
      'psychiatry': 'Psychiatrist',
      'general': 'General Physician',
      'other': 'Specialist'
    };
    return specializations[specialization] || specialization;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>Unable to load profile</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          <div className="cover-image">
            <div className="cover-overlay"></div>
          </div>
        </div>
        
        <div className="profile-info-header">
          <div className="profile-avatar">
            <div className="avatar-container">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  <i className={`fas ${user.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
                </div>
              )}
              {user.userType === 'doctor' && user.isVerified && (
                <div className="verification-badge">
                  <i className="fas fa-check-circle"></i>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-basic-info">
            <h1 className="profile-name">
              {user.userType === 'doctor' ? 'Dr. ' : ''}{user.name}
            </h1>
            {user.userType === 'doctor' ? (
              <div className="doctor-title">
                <i className="fas fa-stethoscope"></i>
                <span>{formatSpecialization(user.specialization)}</span>
              </div>
            ) : (
              <div className="user-title">
                <i className="fas fa-user"></i>
                <span>Patient</span>
              </div>
            )}
            
            <div className="profile-stats">
              {user.userType === 'doctor' ? (
                <>
                  <div className="stat-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>{user.totalAppointments || 0} Appointments</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-star"></i>
                    <span>{user.ratings?.average || 0}/5 ({user.ratings?.count || 0} reviews)</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-clock"></i>
                    <span>{user.experience} years experience</span>
                  </div>
                </>
              ) : (
                <div className="stat-item">
                  <i className="fas fa-calendar"></i>
                  <span>Member since {new Date(user.createdAt).getFullYear()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              <i className="fas fa-edit"></i>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {user.userType === 'doctor' ? (
          // Doctor Profile Content
          <>
            <div className="profile-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-info-circle"></i>
                Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <i className="fas fa-calendar"></i>
                Schedule
              </button>
              <button 
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="fas fa-cog"></i>
                Settings
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="info-cards">
                    <div className="info-card">
                      <div className="card-header">
                        <h3><i className="fas fa-user-md"></i> Professional Information</h3>
                      </div>
                      <div className="card-content">
                        {isEditing ? (
                          <form onSubmit={handleUpdateProfile}>
                            {error && (
                              <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>{error}</span>
                              </div>
                            )}
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Specialization</label>
                                <select
                                  name="specialization"
                                  value={formData.specialization || ''}
                                  onChange={handleInputChange}
                                >
                                  <option value="cardiology">Cardiology</option>
                                  <option value="dermatology">Dermatology</option>
                                  <option value="neurology">Neurology</option>
                                  <option value="pediatrics">Pediatrics</option>
                                  <option value="orthopedics">Orthopedics</option>
                                  <option value="psychiatry">Psychiatry</option>
                                  <option value="general">General Medicine</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Experience (Years)</label>
                                <input
                                  type="number"
                                  name="experience"
                                  value={formData.experience || ''}
                                  onChange={handleInputChange}
                                  min="0"
                                />
                              </div>
                              <div className="form-group">
                                <label>Consultation Fee (₹)</label>
                                <input
                                  type="number"
                                  name="consultationFee"
                                  value={formData.consultationFee || ''}
                                  onChange={handleInputChange}
                                  min="0"
                                />
                              </div>
                              <div className="form-group full-width">
                                <label>Bio</label>
                                <textarea
                                  name="bio"
                                  value={formData.bio || ''}
                                  onChange={handleInputChange}
                                  placeholder="Tell patients about yourself..."
                                  rows="4"
                                ></textarea>
                              </div>
                            </div>
                            <div className="form-actions">
                              <button type="submit" className="btn btn-primary">
                                <i className="fas fa-save"></i>
                                Save Changes
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Specialization</label>
                              <span>{formatSpecialization(user.specialization)}</span>
                            </div>
                            <div className="info-item">
                              <label>Experience</label>
                              <span>{user.experience} years</span>
                            </div>
                            <div className="info-item">
                              <label>License Number</label>
                              <span>{user.licenseNumber}</span>
                            </div>
                            <div className="info-item">
                              <label>Consultation Fee</label>
                              <span>₹{user.consultationFee}</span>
                            </div>
                            <div className="info-item full-width">
                              <label>About</label>
                              <p>{user.bio || 'No bio available'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="card-header">
                        <h3><i className="fas fa-address-card"></i> Contact Information</h3>
                      </div>
                      <div className="card-content">
                        <div className="contact-info">
                          <div className="contact-item">
                            <i className="fas fa-envelope"></i>
                            <span>{user.email}</span>
                          </div>
                          <div className="contact-item">
                            <i className="fas fa-phone"></i>
                            <span>{user.phone}</span>
                          </div>
                          <div className="contact-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>
                              {user.address ? 
                                `${user.address.city}, ${user.address.state}` : 
                                'Address not provided'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="schedule-tab">
                  <div className="schedule-card">
                    <div className="card-header">
                      <h3><i className="fas fa-clock"></i> Available Schedule</h3>
                    </div>
                    <div className="card-content">
                      <p>Schedule management will be implemented here</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="settings-tab">
                  <div className="settings-card">
                    <div className="card-header">
                      <h3><i className="fas fa-cog"></i> Account Settings</h3>
                    </div>
                    <div className="card-content">
                      <p>Settings panel will be implemented here</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Patient Profile Content
          <div className="patient-profile">
            <div className="profile-section">
              <div className="section-header">
                <h3><i className="fas fa-user"></i> Personal Information</h3>
                <button 
                  className="btn btn-outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <i className="fas fa-edit"></i>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="section-content">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="edit-form">
                    {error && (
                      <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio || ''}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="address-section">
                      <h4>Address</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Street</label>
                          <input
                            type="text"
                            name="street"
                            value={formData.address?.street || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.address?.city || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.address?.state || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>ZIP Code</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.address?.zipCode || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save"></i>
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="info-display">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name</label>
                        <span>{user.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span>{user.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Phone</label>
                        <span>{user.phone}</span>
                      </div>
                      <div className="info-item">
                        <label>Member Since</label>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      {user.bio && (
                        <div className="info-item full-width">
                          <label>About</label>
                          <p>{user.bio}</p>
                        </div>
                      )}
                    </div>
                    
                    {user.address && (
                      <div className="address-display">
                        <h4>Address</h4>
                        <div className="address-text">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>
                            {[
                              user.address.street,
                              user.address.city,
                              user.address.state,
                              user.address.zipCode
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;