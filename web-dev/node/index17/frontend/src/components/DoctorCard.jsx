import React from 'react';
import '../styles/DoctorCard.css';
import backendUrl from '../utils/BackendURl';

const DoctorCard = ({ doctor, onClick }) => {
  // Check if doctor has profile image
  const hasProfileImage = doctor.profileImage && doctor.profileImage.trim() !== '';
  
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

  // Generate rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fas fa-star star filled"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt star half"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star star empty"></i>);
      }
    }
    
    return stars;
  };

  return (
    <div className="doctor-card" onClick={onClick}>
      {/* Doctor Image */}
      <div className="doctor-image">
        {hasProfileImage ? (
          <img 
            src={`${backendUrl}${doctor.profileImage}`}
            alt={doctor.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('no-image');
            }}
          />
        ) : (
          <div className="doctor-icon-placeholder">
            <i className="fas fa-user-md"></i>
          </div>
        )}
      </div>
      
      {/* Doctor Information */}
      <div className="doctor-info">
        <h3 className="doctor-name">Dr. {doctor.name}</h3>
        <p className="specialization">{formatSpecialization(doctor.specialization)}</p>
        
        {/* Rating */}
        <div className="rating">
          <div className="stars">
            {renderRatingStars(doctor.ratings?.average || 0)}
          </div>
          <span className="rating-text">
            {doctor.ratings?.average ? doctor.ratings.average.toFixed(1) : '0.0'}
          </span>
        </div>

        {/* Doctor Details */}
        <div className="doctor-details">
          {/* Experience */}
          <div className="detail-item">
            <i className="fas fa-graduation-cap detail-icon"></i>
            <span>Experience: {doctor.experience || 'N/A'} years</span>
          </div>

          {/* Location */}
          <div className="detail-item">
            <i className="fas fa-map-marker-alt detail-icon"></i>
            <span>City: {doctor.address?.city || doctor.city || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;