// DoctorProfileView.jsx - Updated with Cloudinary support and messaging functionality
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import backendUrl from '../utils/BackendURl';
import '../styles/Rating.css';

const DoctorProfileView = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLoaded, setUserLoaded] = useState(false);
  const [hasUserRated, setHasUserRated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDoctorPopup, setShowDoctorPopup] = useState(false);
  const [originalUserRating, setOriginalUserRating] = useState(0);
  const [originalUserFeedback, setOriginalUserFeedback] = useState('');

  // Helper function to check if URL is a Cloudinary URL
  const isCloudinaryUrl = (url) => {
    return url && (url.startsWith('https://res.cloudinary.com') || url.startsWith('http://res.cloudinary.com'));
  };

  // Helper function to get correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's a Cloudinary URL, return as-is
    if (isCloudinaryUrl(imageUrl)) {
      return imageUrl;
    }
    
    // If it's a relative path (legacy), prepend backend URL
    return `${backendUrl}${imageUrl}`;
  };

  useEffect(() => {
    if (doctorId) {
        fetchDoctorProfile();
        fetchCurrentUser();
    }
  }, [doctorId]);

  // Separate useEffect for fetching ratings after user is loaded
  useEffect(() => {
      if (doctorId && userLoaded) {
          fetchRatings();
      }
  }, [doctorId, userLoaded]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
          console.log('Current user loaded:', data.user);
        } else {
          console.log('No valid token or user not authenticated');
        }
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    } finally {
      setUserLoaded(true);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/doctors/${doctorId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Doctor profile response:', data);

      if (response.ok) {
        setDoctor(data.doctor);
      } else {
        setError(data.message || 'Failed to fetch doctor profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Doctor profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
        console.log(`Fetching ratings for doctor ${doctorId}`);
        const response = await fetch(`${backendUrl}/api/doctors/${doctorId}/ratings`, {
        headers: {
            'Content-Type': 'application/json'
        }
        });

        if (response.ok) {
        const data = await response.json();
        console.log('Ratings response:', data);
        setRatings(data.ratings || []);
        
        // Check if current user has already rated (only if user is logged in)
        if (currentUser && data.ratings) {
            const currentUserRating = data.ratings.find(r => r.userId === currentUser.id);
            if (currentUserRating) {
            console.log('Found existing user rating:', currentUserRating);
            setUserRating(currentUserRating.rating);
            setUserFeedback(currentUserRating.feedback || '');
            setOriginalUserRating(currentUserRating.rating);
            setOriginalUserFeedback(currentUserRating.feedback || '');
            setHasUserRated(true);
            }
        }
        } else {
            console.error('Failed to fetch ratings:', response.status);
        }
    } catch (error) {
        console.error('Error fetching ratings:', error);
    }
  };

  const handleSubmitRating = async () => {
    console.log('Submit rating clicked');
    console.log('Current user:', currentUser);
    console.log('User rating:', userRating);
    
    if (!currentUser) {
      setError('Please login to submit a rating');
      return;
    }

    // Check if doctor is trying to rate their own profile
    if (currentUser.id === doctor.userId) {
      setShowDoctorPopup(true);
      setTimeout(() => setShowDoctorPopup(false), 4000);
      return;
    }

    if (userRating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const requestBody = {
        rating: userRating,
        feedback: userFeedback.trim()
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${backendUrl}/api/doctors/${doctorId}/ratings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Submit rating response:', data);

      if (response.ok) {
        // Refresh ratings and doctor profile to get updated average
        await fetchRatings();
        await fetchDoctorProfile();
        setError('');
        setIsEditing(false);
        setHasUserRated(true);
        setOriginalUserRating(userRating);
        setOriginalUserFeedback(userFeedback);
        console.log('Rating submitted successfully');
      } else {
        console.error('Rating submission failed:', data);
        setError(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFeedback = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUserRating(originalUserRating);
    setUserFeedback(originalUserFeedback);
    setError('');
  };

  // Navigate to appointment booking page
  const handleBookAppointment = () => {
    navigate(`/book-appointment/${doctorId}`);
  };

  // Navigate to messaging - UPDATED FUNCTION
  const handleSendMessage = () => {
    if (!currentUser) {
      setError('Please login to send messages');
      return;
    }
    
    // Check if user is trying to message themselves
    if (currentUser.id === doctorId) {
      setError('You cannot send messages to yourself');
      return;
    }
    
    // Navigate to chat with this doctor
    navigate(`/messages/${doctorId}`);
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

  const renderStars = (rating, interactive = false, size = 'medium') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    const sizeClass = size === 'large' ? 'rating-star-large' : size === 'small' ? 'rating-star-small' : 'rating-star-medium';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <i 
            key={i} 
            className={`fas fa-star ${sizeClass} ${interactive ? 'rating-star-interactive' : ''}`}
            onClick={interactive ? () => setUserRating(i + 1) : undefined}
          ></i>
        );
      } else {
        stars.push(
          <i 
            key={i} 
            className={`${interactive && i < userRating ? 'fas' : 'far'} fa-star ${sizeClass} ${interactive ? 'rating-star-interactive rating-star-empty' : 'rating-star-empty'}`}
            onClick={interactive ? () => setUserRating(i + 1) : undefined}
          ></i>
        );
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading doctor profile...</span>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="profile-page-container">
        <div className="profile-error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>Doctor profile not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Doctor Popup */}
      {showDoctorPopup && (
        <div className="rating-doctor-popup">
          <div className="rating-popup-content">
            <i className="fas fa-info-circle"></i>
            <span>Doctors cannot rate their own profile</span>
          </div>
        </div>
      )}

      {/* Profile Header - FIXED IMAGE DISPLAYS */}
      <div className="profile-page-header">
        <div className="profile-page-cover">
          <div className="profile-cover-image">
            {doctor.backgroundImage ? (
              <img 
                src={getImageUrl(doctor.backgroundImage)} 
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
          </div>
        </div>
        
        <div className="profile-info-header">
          <div className="profile-page-avatar">
            <div className="profile-avatar-container">
              {doctor.profileImage ? (
                <img src={getImageUrl(doctor.profileImage)} alt={doctor.name || 'Doctor'} />
              ) : (
                <div className="profile-avatar-placeholder">
                  <i className="fas fa-user-md"></i>
                </div>
              )}
              {doctor.isVerified && (
                <div className="profile-verification-badge">
                  <i className="fas fa-check-circle"></i>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-basic-info">
            <h1 className="profile-page-name">
              Dr. {doctor.name || 'Unknown'}
            </h1>
            <div className="profile-doctor-title">
              <i className="fas fa-stethoscope"></i>
              <span>{formatSpecialization(doctor.specialization)}</span>
            </div>
            
            <div className="profile-page-stats">
              <div className="profile-stat-item">
                <i className="fas fa-calendar-check"></i>
                <span>{doctor.totalAppointments || 0} Appointments</span>
              </div>
              <div className="profile-stat-item">
                <i className="fas fa-star"></i>
                <span>{doctor.ratings?.average || 0}/5 ({doctor.ratings?.count || 0} reviews)</span>
              </div>
              <div className="profile-stat-item">
                <i className="fas fa-clock"></i>
                <span>{doctor.experience || 0} years experience</span>
              </div>
              <div className="profile-stat-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{doctor.practiceLocations?.length || 0} Practice Locations</span>
              </div>
            </div>
          </div>
          
          <div className="profile-page-actions">
            <button className="profile-btn profile-btn-primary" onClick={handleBookAppointment}>
              <i className="fas fa-calendar-plus"></i>
              Book Appointment
            </button>
            <button className="profile-btn profile-btn-secondary" onClick={handleSendMessage}>
              <i className="fas fa-comment-medical"></i>
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-page-content">
        <div className="profile-doctor-content">
          <div className="profile-info-cards">
            
            {/* Professional Information */}
            <div className="profile-info-card">
              <div className="profile-card-header">
                <h3><i className="fas fa-user-md"></i> Professional Information</h3>
              </div>
              <div className="profile-card-content">
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <label>Name</label>
                    <span>{doctor.name || 'N/A'}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Email</label>
                    <span>{doctor.email || 'N/A'}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Specialization</label>
                    <span>{formatSpecialization(doctor.specialization)}</span>
                  </div>
                  <div className="profile-info-item">
                    <label>Experience</label>
                    <span>{doctor.experience || 0} years</span>
                  </div>
                  <div className="profile-info-item">
                    <label>License Number</label>
                    <span>{doctor.licenseNumber || 'N/A'}</span>
                  </div>
                  <div className="profile-info-item profile-full-width">
                    <label>About</label>
                    <p>{doctor.bio || 'No bio available'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="profile-info-card">
              <div className="profile-card-header">
                <h3><i className="fas fa-address-card"></i> Contact Information</h3>
              </div>
              <div className="profile-card-content">
                <div className="profile-contact-info">
                  <div className="contact-section">
                    <h5>Phone Numbers</h5>
                    {doctor.contactInfo?.phones?.length > 0 ? (
                      doctor.contactInfo.phones.map((phone, index) => (
                        <div key={index} className="profile-contact-item">
                          <i className="fas fa-phone"></i>
                          <span>{phone.number} ({phone.type})</span>
                        </div>
                      ))
                    ) : (
                      <div className="profile-contact-item">
                        <i className="fas fa-phone"></i>
                        <span>{doctor.phone || 'N/A'}</span>
                      </div>
                    )}
                  </div>

                  <div className="contact-section">
                    <h5>Email Addresses</h5>
                    {doctor.contactInfo?.emails?.length > 0 ? (
                      doctor.contactInfo.emails.map((email, index) => (
                        <div key={index} className="profile-contact-item">
                          <i className="fas fa-envelope"></i>
                          <span>{email.email} ({email.type})</span>
                        </div>
                      ))
                    ) : (
                      <div className="profile-contact-item">
                        <i className="fas fa-envelope"></i>
                        <span>{doctor.email || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Locations */}
            <div className="profile-info-card">
              <div className="profile-card-header">
                <h3><i className="fas fa-map-marker-alt"></i> Practice Locations</h3>
              </div>
              <div className="profile-card-content">
                {doctor.practiceLocations?.length > 0 ? (
                  doctor.practiceLocations.map((location, index) => (
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

            {/* Enhanced Rating and Feedback Section */}
            <div className="profile-info-card">
              <div className="profile-card-header">
                <h3><i className="fas fa-star"></i> Ratings & Reviews</h3>
              </div>
              <div className="profile-card-content">
                
                {/* Overall Rating Summary */}
                <div className="rating-summary-section">
                  <div className="rating-summary-main">
                    <div className="rating-summary-score">
                      <span className="rating-score-number">{doctor.ratings?.average || 0}</span>
                      <div className="rating-score-stars">
                        {renderStars(doctor.ratings?.average || 0, false, 'medium')}
                      </div>
                    </div>
                    <div className="rating-summary-info">
                      <span className="rating-total-count">{doctor.ratings?.count || 0} reviews</span>
                      <span className="rating-summary-text">Overall patient satisfaction</span>
                    </div>
                  </div>
                </div>

                {/* User Rating Form */}
                {currentUser && (
                  <div className="rating-user-section">
                    {!hasUserRated || isEditing ? (
                      <div className="rating-form-container">
                        <div className="rating-form-header">
                          <h4>
                            <i className="fas fa-edit"></i>
                            {hasUserRated ? 'Edit Your Review' : 'Rate This Doctor'}
                          </h4>
                        </div>
                        
                        {error && (
                          <div className="rating-error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{error}</span>
                          </div>
                        )}
                        
                        <div className="rating-form-body">
                          <div className="rating-stars-section">
                            <label>Your Rating:</label>
                            <div className="rating-stars-input">
                              {renderStars(userRating, true, 'large')}
                            </div>
                            <span className="rating-score-text">
                              {userRating === 0 ? 'Select a rating' : 
                               userRating === 1 ? 'Poor' :
                               userRating === 2 ? 'Fair' :
                               userRating === 3 ? 'Good' :
                               userRating === 4 ? 'Very Good' : 'Excellent'}
                            </span>
                          </div>
                          
                          <div className="rating-feedback-section">
                            <label>Share Your Experience:</label>
                            <textarea
                              className="rating-feedback-input"
                              value={userFeedback}
                              onChange={(e) => setUserFeedback(e.target.value)}
                              placeholder="Tell others about your experience with this doctor..."
                              rows="4"
                            />
                          </div>
                          
                          <div className="rating-form-actions">
                            <button
                              onClick={handleSubmitRating}
                              disabled={isSubmitting || userRating === 0}
                              className="rating-btn rating-btn-primary"
                            >
                              <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                              {isSubmitting ? 'Submitting...' : hasUserRated ? 'Update Review' : 'Submit Review'}
                            </button>
                            {isEditing && (
                              <button
                                onClick={handleCancelEdit}
                                className="rating-btn rating-btn-secondary"
                              >
                                <i className="fas fa-times"></i>
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rating-user-existing">
                        <div className="rating-existing-header">
                          <h4>
                            <i className="fas fa-check-circle"></i>
                            Your Review
                          </h4>
                          <button 
                            onClick={handleEditFeedback}
                            className="rating-edit-btn"
                          >
                            <i className="fas fa-edit"></i>
                            Edit My Feedback
                          </button>
                        </div>
                        <div className="rating-existing-content">
                          <div className="rating-existing-stars">
                            {renderStars(originalUserRating, false, 'medium')}
                            <span className="rating-existing-score">({originalUserRating}/5)</span>
                          </div>
                          {originalUserFeedback && (
                            <p className="rating-existing-feedback">{originalUserFeedback}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show login message if user is not logged in */}
                {!currentUser && userLoaded && (
                  <div className="rating-login-section">
                    <div className="rating-login-card">
                      <i className="fas fa-sign-in-alt"></i>
                      <div className="rating-login-content">
                        <h4>Login to Leave a Review</h4>
                        <p>Share your experience and help other patients make informed decisions</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List - FIXED IMAGE DISPLAYS */}
                <div className="rating-reviews-section">
                  <div className="rating-reviews-header">
                    <h4>
                      <i className="fas fa-comments"></i>
                      Patient Reviews ({ratings.length})
                    </h4>
                  </div>
                  
                  {ratings.length > 0 ? (
                    <div className="rating-reviews-list">
                      {ratings
                        .sort((a, b) => {
                          // Sort by updatedAt first (recently updated first), then by createdAt
                          const aTime = new Date(a.updatedAt > a.createdAt ? a.updatedAt : a.createdAt);
                          const bTime = new Date(b.updatedAt > b.createdAt ? b.updatedAt : b.createdAt);
                          return bTime - aTime;
                        })
                        .map((review, index) => (
                        <div key={index} className="rating-review-card">
                          <div className="rating-review-header">
                            <div className="rating-review-user">
                              <div className="rating-review-avatar">
                                {review.profileImage ? (
                                  <img 
                                    src={getImageUrl(review.profileImage)} 
                                    alt={review.userName || 'User'} 
                                    className="rating-review-avatar-img"
                                    onError={(e) => {
                                      console.log('Profile image failed to load:', getImageUrl(review.profileImage));
                                      // Hide the image and show the fallback icon
                                      e.target.style.display = 'none';
                                      const fallbackIcon = e.target.parentNode.querySelector('.rating-avatar-fallback');
                                      if (fallbackIcon) {
                                        fallbackIcon.style.display = 'block';
                                      }
                                    }}
                                  />
                                ) : null}
                                <i 
                                  className="fas fa-user-circle rating-avatar-fallback" 
                                  style={{display: review.profileImage ? 'none' : 'block'}}
                                ></i>
                              </div>
                              <div className="rating-review-user-info">
                                <span className="rating-review-username">{review.userName || 'Anonymous'}</span>
                                <div className="rating-review-stars">
                                  {renderStars(review.rating, false, 'small')}
                                </div>
                              </div>
                            </div>
                            <div className="rating-review-meta">
                              <span className="rating-review-date">
                                {new Date(review.updatedAt > review.createdAt ? review.updatedAt : review.createdAt).toLocaleDateString()}
                              </span>
                              {review.updatedAt > review.createdAt && (
                                <span className="rating-review-edited">
                                  <i className="fas fa-edit"></i>
                                  Edited
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {review.feedback && (
                            <div className="rating-review-content">
                              <p className="rating-review-feedback">{review.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rating-no-reviews">
                      <i className="fas fa-comments"></i>
                      <h4>No Reviews Yet</h4>
                      <p>Be the first to share your experience with this doctor!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileView;