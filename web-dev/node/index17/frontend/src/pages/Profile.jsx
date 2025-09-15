import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/BackendUrl';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState({
    profile: null,
    background: null
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const profileImageRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      // Initialize formData with proper structure
      setFormData({
        ...user,
        contactInfo: user.contactInfo || {
          phones: user.phone ? [{ number: user.phone, type: 'primary', isActive: true }] : [],
          emails: user.email ? [{ email: user.email, type: 'primary', isActive: true }] : []
        },
        practiceLocations: user.practiceLocations || (user.userType === 'doctor' ? [{
          name: 'Primary Practice',
          address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
          consultationFee: user.consultationFee || 500,
          patientsPerDay: 20,
          availableSlots: [],
          facilities: [],
          isActive: true
        }] : [])
      });
    }
  }, [user]);

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

  // Contact info handlers
  const handleContactInfoChange = (type, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [type]: prev.contactInfo[type].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const addContactInfo = (type) => {
    const maxCounts = { phones: 3, emails: 2 };
    const currentCount = formData.contactInfo?.[type]?.length || 0;
    
    if (currentCount >= maxCounts[type]) {
      setError(`Maximum ${maxCounts[type]} ${type} allowed`);
      return;
    }

    const newItem = type === 'phones' 
      ? { number: '', type: 'secondary', isActive: true }
      : { email: '', type: 'secondary', isActive: true };

    setFormData(prev => ({
      ...prev,
      contactInfo: {
        phones: prev.contactInfo?.phones || [],
        emails: prev.contactInfo?.emails || [],
        ...prev.contactInfo,
        [type]: [...(prev.contactInfo?.[type] || []), newItem]
      }
    }));
  };

  const removeContactInfo = (type, index) => {
    const items = formData.contactInfo?.[type] || [];
    if (items.length <= 1) {
      setError(`At least one ${type.slice(0, -1)} is required`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [type]: items.filter((_, i) => i !== index)
      }
    }));
  };

  // Practice location handlers
  const handlePracticeLocationChange = (locationIndex, field, value) => {
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        practiceLocations: prev.practiceLocations.map((location, i) => 
          i === locationIndex 
            ? { ...location, [parentField]: { ...location[parentField], [childField]: value } }
            : location
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        practiceLocations: prev.practiceLocations.map((location, i) => 
          i === locationIndex ? { ...location, [field]: value } : location
        )
      }));
    }
  };

  const handleTimeSlotChange = (locationIndex, slotIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      practiceLocations: prev.practiceLocations.map((location, i) => 
        i === locationIndex 
          ? {
              ...location,
              availableSlots: location.availableSlots.map((slot, j) => 
                j === slotIndex ? { ...slot, [field]: value } : slot
              )
            }
          : location
      )
    }));
  };

  const addTimeSlot = (locationIndex) => {
    setFormData(prev => ({
      ...prev,
      practiceLocations: prev.practiceLocations.map((location, i) => 
        i === locationIndex 
          ? {
              ...location,
              availableSlots: [
                ...location.availableSlots,
                { day: 'monday', startTime: '09:00', endTime: '17:00', isActive: true }
              ]
            }
          : location
      )
    }));
  };

  const removeTimeSlot = (locationIndex, slotIndex) => {
    setFormData(prev => ({
      ...prev,
      practiceLocations: prev.practiceLocations.map((location, i) => 
        i === locationIndex 
          ? {
              ...location,
              availableSlots: location.availableSlots.filter((_, j) => j !== slotIndex)
            }
          : location
      )
    }));
  };

  const addPracticeLocation = () => {
    setFormData(prev => ({
      ...prev,
      practiceLocations: [
        ...prev.practiceLocations,
        {
          name: '',
          address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
          consultationFee: 500,
          patientsPerDay: 20,
          availableSlots: [],
          facilities: [],
          isActive: true
        }
      ]
    }));
  };

  const removePracticeLocation = (locationIndex) => {
    if (formData.practiceLocations.length <= 1) {
      setError('At least one practice location is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      practiceLocations: prev.practiceLocations.filter((_, i) => i !== locationIndex)
    }));
  };

  const handleImageSelect = (type, file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      if (type === 'profile') {
        setProfileImageFile(file);
        setImagePreview(prev => ({
          ...prev,
          profile: URL.createObjectURL(file)
        }));
      } else if (type === 'background') {
        setBackgroundImageFile(file);
        setImagePreview(prev => ({
          ...prev,
          background: URL.createObjectURL(file)
        }));
      }
      setError('');
    }
  };

  const uploadImage = async (file, type) => {
    const formDataObj = new FormData();
    formDataObj.append('image', file);
    
    const token = localStorage.getItem('token');
    
    // Use specific endpoint for different image types
    const endpoint = type === 'background' 
      ? `${backendUrl}/api/auth/upload-image/background`
      : `${backendUrl}/api/auth/upload-image/profile`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataObj
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return await response.json();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploadingImage(true);
    
    try {
      const token = localStorage.getItem('token');
      let updatedFormData = { ...formData };

      // Upload profile image if selected
      if (profileImageFile) {
        const result = await uploadImage(profileImageFile, 'profile');
        updatedFormData.profileImage = result.imageUrl;
      }

      // Upload background image if selected (for doctors only)
      if (backgroundImageFile && user.userType === 'doctor') {
        const result = await uploadImage(backgroundImageFile, 'background');
        updatedFormData.backgroundImage = result.imageUrl;
      }

      const response = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsEditing(false);
        setError('');
        setProfileImageFile(null);
        setBackgroundImageFile(null);
        setImagePreview({ profile: null, background: null });
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const formatSpecialization = (specialization) => {
    if (!specialization) return 'General Physician';
    
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

  const timeSlotConflicts = (currentLocationIndex, slot) => {
    if (!formData.practiceLocations || !slot.isActive) return false;
    
    return formData.practiceLocations.some((location, index) => {
      if (index === currentLocationIndex) return false;
      
      return location.availableSlots.some(existingSlot => {
        if (!existingSlot.isActive || existingSlot.day !== slot.day) return false;
        
        const newStart = new Date(`2000-01-01 ${slot.startTime}`);
        const newEnd = new Date(`2000-01-01 ${slot.endTime}`);
        const existingStart = new Date(`2000-01-01 ${existingSlot.startTime}`);
        const existingEnd = new Date(`2000-01-01 ${existingSlot.endTime}`);
        
        return (newStart < existingEnd && newEnd > existingStart);
      });
    });
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-container">
        <div className="profile-error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>Unable to load profile</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Profile Header */}
      <div className="profile-page-header">
        <div className="profile-page-cover">
          <div className="profile-cover-image">
            {/* Background image display for doctors only */}
            {user.userType === 'doctor' && (
              <>
                {imagePreview.background ? (
                  <img 
                    src={imagePreview.background} 
                    alt="Background Preview" 
                    className="profile-background-img"
                  />
                ) : user.backgroundImage ? (
                  <img 
                    src={`${backendUrl}${user.backgroundImage}`} 
                    alt="Background" 
                    className="profile-background-img"
                    onError={(e) => {
                      console.error('Failed to load background image');
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="profile-cover-placeholder"></div>
                )}
                <div className="profile-cover-overlay"></div>
                {isEditing && (
                  <button 
                    className="profile-image-upload-btn background-upload"
                    onClick={() => backgroundImageRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <i className="fas fa-camera"></i>
                    Change Background
                  </button>
                )}
              </>
            )}
            {user.userType !== 'doctor' && (
              <>
                <div className="profile-cover-placeholder"></div>
                <div className="profile-cover-overlay"></div>
              </>
            )}
          </div>
        </div>
        
        <div className="profile-info-header">
          <div className="profile-page-avatar">
            <div className="profile-avatar-container">
              {imagePreview.profile ? (
                <img src={imagePreview.profile} alt="Profile Preview" />
              ) : user.profileImage ? (
                <img src={`${backendUrl}${user.profileImage}`} alt={user.name || 'User'} />
              ) : (
                <div className="profile-avatar-placeholder">
                  <i className={`fas ${user.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
                </div>
              )}
              {user.userType === 'doctor' && user.isVerified && (
                <div className="profile-verification-badge">
                  <i className="fas fa-check-circle"></i>
                </div>
              )}
              {isEditing && (
                <button 
                  className="profile-image-upload-btn profile-upload"
                  onClick={() => profileImageRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <i className="fas fa-camera"></i>
                </button>
              )}
            </div>
          </div>
          
          <div className="profile-basic-info">
            <h1 className="profile-page-name">
              {user.userType === 'doctor' ? 'Dr. ' : ''}{user.name || 'User'}
            </h1>
            {user.userType === 'doctor' ? (
              <div className="profile-doctor-title">
                <i className="fas fa-stethoscope"></i>
                <span>{formatSpecialization(user.specialization)}</span>
              </div>
            ) : (
              <div className="profile-user-title">
                <i className="fas fa-user"></i>
                <span>Patient</span>
              </div>
            )}
            
            <div className="profile-page-stats">
              {user.userType === 'doctor' ? (
                <>
                  <div className="profile-stat-item">
                    <i className="fas fa-calendar-check"></i>
                    <span>{user.totalAppointments || 0} Appointments</span>
                  </div>
                  <div className="profile-stat-item">
                    <i className="fas fa-star"></i>
                    <span>{user.ratings?.average || 0}/5 ({user.ratings?.count || 0} reviews)</span>
                  </div>
                  <div className="profile-stat-item">
                    <i className="fas fa-clock"></i>
                    <span>{user.experience || 0} years experience</span>
                  </div>
                  <div className="profile-stat-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{user.practiceLocations?.length || 0} Practice Locations</span>
                  </div>
                </>
              ) : (
                <div className="profile-stat-item">
                  <i className="fas fa-calendar"></i>
                  <span>Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-page-actions">
            <button 
              className="profile-btn profile-btn-primary"
              onClick={() => setIsEditing(!isEditing)}
              disabled={uploadingImage}
            >
              <i className="fas fa-edit"></i>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button 
              className="profile-btn profile-btn-secondary"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={profileImageRef}
        className="profile-hidden-input"
        accept="image/*"
        onChange={(e) => handleImageSelect('profile', e.target.files[0])}
      />
      {user.userType === 'doctor' && (
        <input
          type="file"
          ref={backgroundImageRef}
          className="profile-hidden-input"
          accept="image/*"
          onChange={(e) => handleImageSelect('background', e.target.files[0])}
        />
      )}

      {/* Profile Content */}
      <div className="profile-page-content">
        {user.userType === 'doctor' ? (
          // Doctor Profile Content
          <div className="profile-doctor-content">
            <div className="profile-info-cards">
              <div className="profile-info-card">
                <div className="profile-card-header">
                  <h3><i className="fas fa-user-md"></i> Professional Information</h3>
                </div>
                <div className="profile-card-content">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile}>
                      {error && (
                        <div className="profile-error-message">
                          <i className="fas fa-exclamation-circle"></i>
                          <span>{error}</span>
                        </div>
                      )}
                      
                      {/* Profile & Background Image Upload Section */}
                      <div className="profile-image-upload-section">
                        <h4>Profile Images</h4>
                        <div className="image-upload-grid">
                          <div className="image-upload-item">
                            <label>Profile Picture</label>
                            <div className="image-preview-container">
                              <div className="image-preview profile-preview">
                                {imagePreview.profile ? (
                                  <img src={imagePreview.profile} alt="Profile Preview" />
                                ) : user.profileImage ? (
                                  <img src={`${backendUrl}${user.profileImage}`} alt="Current Profile" />
                                ) : (
                                  <div className="image-preview-placeholder">
                                    <i className="fas fa-user"></i>
                                    <span>No Profile Image</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="profile-btn profile-btn-outline"
                              onClick={() => profileImageRef.current?.click()}
                              disabled={uploadingImage}
                            >
                              <i className="fas fa-upload"></i>
                              {profileImageFile ? 'Change Profile Picture' : 'Upload Profile Picture'}
                            </button>
                          </div>
                          
                          <div className="image-upload-item">
                            <label>Background Picture</label>
                            <div className="image-preview-container">
                              <div className="image-preview background-preview">
                                {imagePreview.background ? (
                                  <img src={imagePreview.background} alt="Background Preview" />
                                ) : user.backgroundImage ? (
                                  <img src={`${backendUrl}${user.backgroundImage}`} alt="Current Background" />
                                ) : (
                                  <div className="image-preview-placeholder">
                                    <i className="fas fa-image"></i>
                                    <span>No Background Image</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="profile-btn profile-btn-outline"
                              onClick={() => backgroundImageRef.current?.click()}
                              disabled={uploadingImage}
                            >
                              <i className="fas fa-upload"></i>
                              {backgroundImageFile ? 'Change Background Picture' : 'Upload Background Picture'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="profile-form-grid">
                        <div className="profile-form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="profile-form-group">
                          <label>Email (Read-only)</label>
                          <input
                            type="email"
                            value={formData.email || ''}
                            disabled
                            style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                          />
                        </div>
                        <div className="profile-form-group">
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
                        <div className="profile-form-group">
                          <label>Experience (Years)</label>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience || ''}
                            onChange={handleInputChange}
                            min="0"
                          />
                        </div>
                        <div className="profile-form-group">
                          <label>License Number (Read-only)</label>
                          <input
                            type="text"
                            value={formData.licenseNumber || ''}
                            disabled
                            style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                          />
                        </div>
                        <div className="profile-form-group profile-full-width">
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

                      {/* Contact Information Section */}
                      <div className="profile-contact-section">
                        <h4>Contact Information</h4>
                        
                        {/* Phone Numbers */}
                        <div className="contact-group">
                          <div className="contact-group-header">
                            <label>Phone Numbers</label>
                            <button
                              type="button"
                              className="profile-btn profile-btn-outline"
                              onClick={() => addContactInfo('phones')}
                              disabled={formData.contactInfo?.phones?.length >= 3}
                            >
                              <i className="fas fa-plus"></i>
                              Add Phone
                            </button>
                          </div>
                          {formData.contactInfo?.phones?.map((phone, index) => (
                            <div key={index} className="contact-item">
                              <input
                                type="tel"
                                placeholder="Phone number"
                                value={phone.number}
                                onChange={(e) => handleContactInfoChange('phones', index, 'number', e.target.value)}
                                required
                              />
                              <select
                                value={phone.type}
                                onChange={(e) => handleContactInfoChange('phones', index, 'type', e.target.value)}
                              >
                                <option value="primary">Primary</option>
                                <option value="secondary">Secondary</option>
                                <option value="emergency">Emergency</option>
                              </select>
                              {formData.contactInfo.phones.length > 1 && (
                                <button
                                  type="button"
                                  className="remove-btn"
                                  onClick={() => removeContactInfo('phones', index)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Email Addresses */}
                        <div className="contact-group">
                          <div className="contact-group-header">
                            <label>Email Addresses</label>
                            <button
                              type="button"
                              className="profile-btn profile-btn-outline"
                              onClick={() => addContactInfo('emails')}
                              disabled={formData.contactInfo?.emails?.length >= 2}
                            >
                              <i className="fas fa-plus"></i>
                              Add Email
                            </button>
                          </div>
                          {formData.contactInfo?.emails?.map((email, index) => (
                            <div key={index} className="contact-item">
                              <input
                                type="email"
                                placeholder="Email address"
                                value={email.email}
                                onChange={(e) => handleContactInfoChange('emails', index, 'email', e.target.value)}
                                required
                              />
                              <select
                                value={email.type}
                                onChange={(e) => handleContactInfoChange('emails', index, 'type', e.target.value)}
                              >
                                <option value="primary">Primary</option>
                                <option value="secondary">Secondary</option>
                              </select>
                              {formData.contactInfo.emails.length > 1 && (
                                <button
                                  type="button"
                                  className="remove-btn"
                                  onClick={() => removeContactInfo('emails', index)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Practice Locations Section */}
                      <div className="practice-locations-section">
                        <div className="section-header">
                          <h4>Practice Locations</h4>
                          <button
                            type="button"
                            className="profile-btn profile-btn-outline"
                            onClick={addPracticeLocation}
                          >
                            <i className="fas fa-plus"></i>
                            Add Location
                          </button>
                        </div>

                        {formData.practiceLocations?.map((location, locationIndex) => (
                          <div key={locationIndex} className="practice-location-card">
                            <div className="location-header">
                              <h5>Location {locationIndex + 1}</h5>
                              {formData.practiceLocations.length > 1 && (
                                <button
                                  type="button"
                                  className="remove-btn"
                                  onClick={() => removePracticeLocation(locationIndex)}
                                >
                                  <i className="fas fa-times"></i>
                                  Remove Location
                                </button>
                              )}
                            </div>

                            <div className="profile-form-grid">
                              <div className="profile-form-group">
                                <label>Practice Name</label>
                                <input
                                  type="text"
                                  value={location.name || ''}
                                  onChange={(e) => handlePracticeLocationChange(locationIndex, 'name', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="profile-form-group">
                                <label>Consultation Fee (₹)</label>
                                <input
                                  type="number"
                                  value={location.consultationFee || ''}
                                  onChange={(e) => handlePracticeLocationChange(locationIndex, 'consultationFee', parseInt(e.target.value))}
                                  min="0"
                                  required
                                />
                              </div>
                              <div className="profile-form-group">
                                <label>Patients Per Day</label>
                                <input
                                  type="number"
                                  value={location.patientsPerDay || ''}
                                  onChange={(e) => handlePracticeLocationChange(locationIndex, 'patientsPerDay', parseInt(e.target.value))}
                                  min="1"
                                  max="100"
                                  required
                                />
                              </div>
                              <div className="profile-form-group">
                                <label>Street Address</label>
                                <input
                                  type="text"
                                  value={location.address?.street || ''}
                                  onChange={(e) => handlePracticeLocationChange(locationIndex, 'address.street', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="profile-form-group">
                                <label>City</label>
                                <input
                                  type="text"
                                  value={location.address?.city || ''}
                                  onChange={(e) => handlePracticeLocationChange(locationIndex, 'address.city', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="profile-form-group">
                                <label>State</label>
                                <input
                                  type="text"
                                  value={location.address?.state || ''}
                                  onChange={(e) => handlePracticeLocationChange(locationIndex, 'address.state', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="profile-form-group">
                                <label>ZIP Code</label>
                                <input
                                  type="text"
                                  value={location.address?.zipCode || ''}
                                  onChange={(e) => handlePracticeLocationChange(locationIndex, 'address.zipCode', e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            {/* Available Time Slots */}
                            <div className="time-slots-section">
                              <div className="section-header">
                                <label>Available Time Slots</label>
                                <button
                                  type="button"
                                  className="profile-btn profile-btn-outline"
                                  onClick={() => addTimeSlot(locationIndex)}
                                >
                                  <i className="fas fa-plus"></i>
                                  Add Time Slot
                                </button>
                              </div>

                              {location.availableSlots?.map((slot, slotIndex) => {
                                const hasConflict = timeSlotConflicts(locationIndex, slot);
                                return (
                                  <div key={slotIndex} className={`time-slot-item ${hasConflict ? 'has-conflict' : ''}`}>
                                    <select
                                      value={slot.day}
                                      onChange={(e) => handleTimeSlotChange(locationIndex, slotIndex, 'day', e.target.value)}
                                    >
                                      <option value="monday">Monday</option>
                                      <option value="tuesday">Tuesday</option>
                                      <option value="wednesday">Wednesday</option>
                                      <option value="thursday">Thursday</option>
                                      <option value="friday">Friday</option>
                                      <option value="saturday">Saturday</option>
                                      <option value="sunday">Sunday</option>
                                    </select>
                                    <input
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) => handleTimeSlotChange(locationIndex, slotIndex, 'startTime', e.target.value)}
                                    />
                                    <span>to</span>
                                    <input
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) => handleTimeSlotChange(locationIndex, slotIndex, 'endTime', e.target.value)}
                                    />
                                    <label className="checkbox-label">
                                      <input
                                        type="checkbox"
                                        checked={slot.isActive}
                                        onChange={(e) => handleTimeSlotChange(locationIndex, slotIndex, 'isActive', e.target.checked)}
                                      />
                                      Active
                                    </label>
                                    <button
                                      type="button"
                                      className="remove-btn"
                                      onClick={() => removeTimeSlot(locationIndex, slotIndex)}
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                    {hasConflict && (
                                      <div className="conflict-warning">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        Time conflict with another location
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="profile-form-actions">
                        <button 
                          type="submit" 
                          className="profile-btn profile-btn-primary"
                          disabled={uploadingImage}
                        >
                          <i className={`fas ${uploadingImage ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                          {uploadingImage ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <label>Name</label>
                        <span>{user.name || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Email</label>
                        <span>{user.email || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Specialization</label>
                        <span>{formatSpecialization(user.specialization)}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Experience</label>
                        <span>{user.experience || 0} years</span>
                      </div>
                      <div className="profile-info-item">
                        <label>License Number</label>
                        <span>{user.licenseNumber || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item profile-full-width">
                        <label>About</label>
                        <p>{user.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information Display */}
              <div className="profile-info-card">
                <div className="profile-card-header">
                  <h3><i className="fas fa-address-card"></i> Contact Information</h3>
                </div>
                <div className="profile-card-content">
                  <div className="profile-contact-info">
                    {/* Phone Numbers */}
                    <div className="contact-section">
                      <h5>Phone Numbers</h5>
                      {user.contactInfo?.phones?.length > 0 ? (
                        user.contactInfo.phones.map((phone, index) => (
                          <div key={index} className="profile-contact-item">
                            <i className="fas fa-phone"></i>
                            <span>{phone.number} ({phone.type})</span>
                          </div>
                        ))
                      ) : (
                        <div className="profile-contact-item">
                          <i className="fas fa-phone"></i>
                          <span>{user.phone || 'N/A'}</span>
                        </div>
                      )}
                    </div>

                    {/* Email Addresses */}
                    <div className="contact-section">
                      <h5>Email Addresses</h5>
                      {user.contactInfo?.emails?.length > 0 ? (
                        user.contactInfo.emails.map((email, index) => (
                          <div key={index} className="profile-contact-item">
                            <i className="fas fa-envelope"></i>
                            <span>{email.email} ({email.type})</span>
                          </div>
                        ))
                      ) : (
                        <div className="profile-contact-item">
                          <i className="fas fa-envelope"></i>
                          <span>{user.email || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice Locations Display */}
              <div className="profile-info-card">
                <div className="profile-card-header">
                  <h3><i className="fas fa-map-marker-alt"></i> Practice Locations</h3>
                </div>
                <div className="profile-card-content">
                  {user.practiceLocations?.length > 0 ? (
                    user.practiceLocations.map((location, index) => (
                      <div key={index} className="location-display-card">
                        <h5>{location.name || `Location ${index + 1}`}</h5>
                        <div className="location-info">
                          <div className="location-address">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>
                              {[
                                location.address?.street,
                                location.address?.city,
                                location.address?.state,
                                location.address?.zipCode
                              ].filter(Boolean).join(', ') || 'Address not provided'}
                            </span>
                          </div>
                          <div className="location-details">
                            <div className="detail-item">
                              <i className="fas fa-rupee-sign"></i>
                              <span>₹{location.consultationFee || 'N/A'} consultation fee</span>
                            </div>
                            <div className="detail-item">
                              <i className="fas fa-users"></i>
                              <span>{location.patientsPerDay || 'N/A'} patients per day</span>
                            </div>
                          </div>
                          {location.availableSlots?.length > 0 && (
                            <div className="available-slots">
                              <h6>Available Hours:</h6>
                              {location.availableSlots.filter(slot => slot.isActive).map((slot, slotIndex) => (
                                <div key={slotIndex} className="slot-item">
                                  <span className="day">{slot.day.charAt(0).toUpperCase() + slot.day.slice(1)}:</span>
                                  <span className="time">{slot.startTime} - {slot.endTime}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="location-display-card">
                      <p>No practice locations configured</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Patient Profile Content
          <div className="profile-patient-content">
            <div className="profile-section">
              <div className="profile-section-header">
                <h3><i className="fas fa-user"></i> Personal Information</h3>
                <button 
                  className="profile-btn profile-btn-outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <i className="fas fa-edit"></i>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="profile-section-content">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                    {error && (
                      <div className="profile-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Profile Image Upload */}
                    <div className="profile-image-upload-section">
                      <h4>Profile Picture</h4>
                      <div className="image-preview-container">
                        <div className="image-preview profile-preview">
                          {imagePreview.profile ? (
                            <img src={imagePreview.profile} alt="Profile Preview" />
                          ) : user.profileImage ? (
                            <img src={`${backendUrl}${user.profileImage}`} alt="Current Profile" />
                          ) : (
                            <div className="image-preview-placeholder">
                              <i className="fas fa-user"></i>
                              <span>No Profile Image</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="profile-btn profile-btn-outline"
                        onClick={() => profileImageRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        <i className="fas fa-upload"></i>
                        {profileImageFile ? 'Change Profile Picture' : 'Upload Profile Picture'}
                      </button>
                    </div>

                    <div className="profile-form-grid">
                      <div className="profile-form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="profile-form-group">
                        <label>Email (Read-only)</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          disabled
                          style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                        />
                      </div>
                      <div className="profile-form-group">
                        <label>Primary Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="profile-form-group profile-full-width">
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
                    
                    <div className="profile-address-section">
                      <h4>Address</h4>
                      <div className="profile-form-grid">
                        <div className="profile-form-group">
                          <label>Street</label>
                          <input
                            type="text"
                            name="street"
                            value={formData.address?.street || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="profile-form-group">
                          <label>City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.address?.city || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="profile-form-group">
                          <label>State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.address?.state || ''}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="profile-form-group">
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
                    
                    <div className="profile-form-actions">
                      <button 
                        type="submit" 
                        className="profile-btn profile-btn-primary"
                        disabled={uploadingImage}
                      >
                        <i className={`fas ${uploadingImage ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                        {uploadingImage ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info-display">
                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <label>Name</label>
                        <span>{user.name || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Email</label>
                        <span>{user.email || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Phone</label>
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Member Since</label>
                        <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {user.bio && (
                        <div className="profile-info-item profile-full-width">
                          <label>About</label>
                          <p>{user.bio}</p>
                        </div>
                      )}
                    </div>
                    
                    {user.address && (user.address.street || user.address.city || user.address.state || user.address.zipCode) && (
                      <div className="profile-address-display">
                        <h4>Address</h4>
                        <div className="profile-address-text">
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