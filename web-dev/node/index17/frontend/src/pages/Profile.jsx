import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/BackendURl';
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

  const handleImageSelect = (type, file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
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
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    
    // Use the specific endpoint for each image type
    const endpoint = type === 'profile' 
      ? `${backendUrl}/api/auth/upload-image/profile`
      : `${backendUrl}/api/auth/upload-image/background`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return await response.json();
  };

  const handleImageUpload = async (type) => {
    const file = type === 'profile' ? profileImageFile : backgroundImageFile;
    if (!file) return null;

    setUploadingImage(true);
    try {
      const result = await uploadImage(file, type);
      return result.imageUrl;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploadingImage(true);
    
    try {
      const token = localStorage.getItem('token');
      let updatedFormData = { ...formData };

      // Upload profile image if selected
      if (profileImageFile) {
        const profileImageUrl = await handleImageUpload('profile');
        if (profileImageUrl) {
          updatedFormData.profileImage = profileImageUrl;
        }
      }

      // Upload background image if selected
      if (backgroundImageFile) {
        const backgroundImageUrl = await handleImageUpload('background');
        if (backgroundImageUrl) {
          updatedFormData.backgroundImage = backgroundImageUrl;
        }
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
        // Update localStorage
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
            {/* Background image display - check both user background and preview */}
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
                  console.error('Failed to load background image. Details:', {
                    backendUrl,
                    backgroundImagePath: user.backgroundImage,
                    fullUrl: `${backendUrl}${user.backgroundImage}`,
                    userObject: user
                  });
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Background image loaded successfully:', {
                    backendUrl,
                    backgroundImagePath: user.backgroundImage,
                    fullUrl: `${backendUrl}${user.backgroundImage}`
                  });
                }}
              />
            ) : (
              <div className="profile-cover-placeholder"></div>
            )}
            <div className="profile-cover-overlay"></div>
            {user.userType === 'doctor' && isEditing && (
              <button 
                className="profile-image-upload-btn background-upload"
                onClick={() => backgroundImageRef.current?.click()}
                disabled={uploadingImage}
              >
                <i className="fas fa-camera"></i>
                Change Background
              </button>
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
              {user.userType === 'doctor' && isEditing && (
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
      <input
        type="file"
        ref={backgroundImageRef}
        className="profile-hidden-input"
        accept="image/*"
        onChange={(e) => handleImageSelect('background', e.target.files[0])}
      />

      {/* Profile Content */}
      <div className="profile-page-content">
        {user.userType === 'doctor' ? (
          // Doctor Profile Content - Only Overview
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
                      
                      {/* Image Upload Section */}
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
                          <label>Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            required
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
                          <label>Consultation Fee (₹)</label>
                          <input
                            type="number"
                            name="consultationFee"
                            value={formData.consultationFee || ''}
                            onChange={handleInputChange}
                            min="0"
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
                      <div className="profile-info-item">
                        <label>Consultation Fee</label>
                        <span>₹{user.consultationFee || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item profile-full-width">
                        <label>About</label>
                        <p>{user.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-info-card">
                <div className="profile-card-header">
                  <h3><i className="fas fa-address-card"></i> Contact Information</h3>
                </div>
                <div className="profile-card-content">
                  <div className="profile-contact-info">
                    <div className="profile-contact-item">
                      <i className="fas fa-envelope"></i>
                      <span>{user.email || 'N/A'}</span>
                    </div>
                    <div className="profile-contact-item">
                      <i className="fas fa-phone"></i>
                      <span>{user.phone || 'N/A'}</span>
                    </div>
                    <div className="profile-contact-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>
                        {user.address && (user.address.city || user.address.state) ? 
                          `${user.address.city || ''}, ${user.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') : 
                          'Address not provided'
                        }
                      </span>
                    </div>
                  </div>
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
                        <label>Phone Number</label>
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