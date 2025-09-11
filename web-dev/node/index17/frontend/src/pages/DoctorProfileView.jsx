import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import backendUrl from '../utils/BackendURl';

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

  useEffect(() => {
    if (doctorId) {
        fetchDoctorProfile();
        fetchCurrentUser();
    }
  }, [doctorId]);

    // Add a separate useEffect for fetching ratings when currentUser is loaded:
    useEffect(() => {
        if (doctorId) {
            fetchRatings();
        }
    }, [doctorId, currentUser]);

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
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
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
        const response = await fetch(`${backendUrl}/api/doctors/${doctorId}/ratings`, {
        headers: {
            'Content-Type': 'application/json'
        }
        });

        if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        
        // Check if current user has already rated (only if user is logged in)
        const token = localStorage.getItem('token');
        if (token && currentUser) {
            const currentUserRating = data.ratings?.find(r => r.userId === currentUser.id);
            if (currentUserRating) {
            setUserRating(currentUserRating.rating);
            setUserFeedback(currentUserRating.feedback || '');
            }
        }
        }
    } catch (error) {
        console.error('Error fetching ratings:', error);
    }
};

  const handleSubmitRating = async () => {
    if (!currentUser) {
      setError('Please login to submit a rating');
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
      const response = await fetch(`${backendUrl}/api/doctors/${doctorId}/ratings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: userRating,
          feedback: userFeedback.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh ratings and doctor profile to get updated average
        await fetchRatings();
        await fetchDoctorProfile();
        setError('');
      } else {
        setError(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Rating submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <i 
            key={i} 
            className="fas fa-star" 
            style={{ 
              color: '#ffd700', 
              cursor: interactive ? 'pointer' : 'default',
              fontSize: interactive ? '24px' : '16px'
            }}
            onClick={interactive ? () => setUserRating(i + 1) : undefined}
          ></i>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <i 
            key={i} 
            className="fas fa-star-half-alt" 
            style={{ 
              color: '#ffd700', 
              cursor: interactive ? 'pointer' : 'default',
              fontSize: interactive ? '24px' : '16px'
            }}
            onClick={interactive ? () => setUserRating(i + 1) : undefined}
          ></i>
        );
      } else {
        stars.push(
          <i 
            key={i} 
            className="far fa-star" 
            style={{ 
              color: interactive && i < userRating ? '#ffd700' : '#ddd', 
              cursor: interactive ? 'pointer' : 'default',
              fontSize: interactive ? '24px' : '16px'
            }}
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
      {/* Profile Header */}
      <div className="profile-page-header">
        <div className="profile-page-cover">
          <div className="profile-cover-image">
            {doctor.backgroundImage ? (
              <img 
                src={`${backendUrl}${doctor.backgroundImage}`} 
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
                <img src={`${backendUrl}${doctor.profileImage}`} alt={doctor.name || 'Doctor'} />
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
            <button className="profile-btn profile-btn-primary">
              <i className="fas fa-calendar-plus"></i>
              Book Appointment
            </button>
            <button className="profile-btn profile-btn-secondary">
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

            {/* Rating and Feedback Section */}
            <div className="profile-info-card">
              <div className="profile-card-header">
                <h3><i className="fas fa-star"></i> Ratings & Reviews</h3>
              </div>
              <div className="profile-card-content">
                
                {/* User Rating Form */}
                {currentUser && (
                  <div className="rating-form-section">
                    <h4>Rate this doctor</h4>
                    
                    {error && (
                      <div className="profile-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <div className="profile-form-group">
                      <label>Your Rating:</label>
                      <div className="rating-stars-input">
                        {renderStars(userRating, true)}
                      </div>
                    </div>
                    
                    <div className="profile-form-group profile-full-width">
                      <label>Your Feedback (Optional):</label>
                      <textarea
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        placeholder="Share your experience with this doctor..."
                        rows="4"
                      ></textarea>
                    </div>
                    
                    <button
                      onClick={handleSubmitRating}
                      disabled={isSubmitting || userRating === 0}
                      className="profile-btn profile-btn-primary"
                    >
                      <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                      {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                <div className="reviews-section">
                  <h4>Patient Reviews ({ratings.length})</h4>
                  
                  {ratings.length > 0 ? (
                    <div className="reviews-list">
                      {ratings.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <span className="reviewer-name">{review.userName || 'Anonymous'}</span>
                              <div className="review-rating">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                              {review.updatedAt > review.createdAt && ' (edited)'}
                            </span>
                          </div>
                          
                          {review.feedback && (
                            <p className="review-feedback">{review.feedback}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-reviews">No reviews yet. Be the first to review this doctor!</p>
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