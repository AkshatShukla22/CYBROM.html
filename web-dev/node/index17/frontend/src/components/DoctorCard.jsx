import React from 'react';
import '../styles/DoctorCard.css';

const DoctorCard = ({ doctor, onClick, userLocation }) => {
  // Default profile image if none exists
  const defaultImage = '/api/placeholder/150/150';
  
  // Calculate if doctor is in same city as user
  const isLocal = doctor.address?.city?.toLowerCase() === userLocation?.toLowerCase();
  
  // Format specialization
  const formatSpecialization = (spec) => {
    const specializations = {
      'cardiology': 'Cardiologist',
      'dermatology': 'Dermatologist',
      'neurology': 'Neurologist',
      'pediatrics': 'Pediatrician',
      'orthopedics': 'Orthopedic Surgeon',
      'psychiatry': 'Psychiatrist',
      'general': 'General Practitioner',
      'other': 'Specialist'
    };
    return specializations[spec] || spec;
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'Location not specified';
    
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  // Generate rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    
    return stars;
  };

  return (
    <div className="doctor-card" onClick={onClick}>
      {/* Card Header */}
      <div className="card-header">
        <div className="doctor-image">
          <img 
            src={doctor.profileImage ? `http://localhost:8000${doctor.profileImage}` : defaultImage}
            alt={doctor.name}
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
          
          {/* Online/Available status */}
          <div className="status-indicator">
            <span className="status-dot available"></span>
          </div>
          
          {/* Local badge */}
          {isLocal && (
            <div className="local-badge">
              <span>📍 Local</span>
            </div>
          )}
        </div>
        
        <div className="doctor-basic-info">
          <h3 className="doctor-name">Dr. {doctor.name}</h3>
          <p className="specialization">{formatSpecialization(doctor.specialization)}</p>
          
          {/* Rating */}
          <div className="rating">
            <div className="stars">
              {renderRatingStars(doctor.ratings?.average || 0)}
            </div>
            <span className="rating-text">
              {doctor.ratings?.average ? doctor.ratings.average.toFixed(1) : '0.0'}
              {doctor.ratings?.count > 0 && (
                <span className="rating-count">({doctor.ratings.count})</span>
              )}
            </span>
          </div>
        </div>

        {/* Verified badge */}
        {doctor.isVerified && (
          <div className="verified-badge">
            <span>✓ Verified</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Experience */}
        <div className="info-item">
          <span className="icon">🎓</span>
          <div className="info-content">
            <span className="label">Experience</span>
            <span className="value">{doctor.experience} years</span>
          </div>
        </div>

        {/* Location */}
        <div className="info-item">
          <span className="icon">📍</span>
          <div className="info-content">
            <span className="label">Location</span>
            <span className="value">{formatAddress(doctor.address)}</span>
          </div>
        </div>

        {/* Consultation Fee */}
        <div className="info-item">
          <span className="icon">💰</span>
          <div className="info-content">
            <span className="label">Consultation Fee</span>
            <span className="value">₹{doctor.consultationFee || 'Not specified'}</span>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="info-item">
          <span className="icon">👥</span>
          <div className="info-content">
            <span className="label">Patients Treated</span>
            <span className="value">{doctor.totalAppointments || 0}+</span>
          </div>
        </div>

        {/* Bio Preview */}
        {doctor.bio && (
          <div className="bio-preview">
            <p>{doctor.bio.length > 100 ? `${doctor.bio.substring(0, 100)}...` : doctor.bio}</p>
          </div>
        )}

        {/* Available Slots Preview */}
        {doctor.availableSlots && doctor.availableSlots.length > 0 && (
          <div className="availability-preview">
            <span className="label">Available:</span>
            <div className="time-slots">
              {doctor.availableSlots.slice(0, 3).map((slot, index) => (
                <span key={index} className="time-slot">
                  {slot.day}: {slot.startTime}-{slot.endTime}
                </span>
              ))}
              {doctor.availableSlots.length > 3 && (
                <span className="more-slots">+{doctor.availableSlots.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="action-buttons">
          <button className="btn-secondary">
            📞 Call Now
          </button>
          <button className="btn-primary">
            📅 Book Appointment
          </button>
        </div>
        
        <div className="quick-actions">
          <button className="quick-action" title="Add to Favorites">
            ♡
          </button>
          <button className="quick-action" title="Share">
            📤
          </button>
          <button className="quick-action" title="More Info">
            ℹ️
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="hover-overlay">
        <div className="hover-content">
          <p>Click to view full profile</p>
          <div className="hover-stats">
            <div className="stat">
              <span className="number">{doctor.ratings?.average?.toFixed(1) || '0.0'}</span>
              <span className="label">Rating</span>
            </div>
            <div className="stat">
              <span className="number">{doctor.experience}</span>
              <span className="label">Years</span>
            </div>
            <div className="stat">
              <span className="number">{doctor.totalAppointments || 0}</span>
              <span className="label">Patients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;