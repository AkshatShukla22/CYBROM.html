import React from 'react';
import backendUrl from '../utils/BackendURl';
import '../styles/DoctorCard.css';

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

  // Get cities from practice locations
  const getCities = () => {
    const cities = [];
    
    // Check practice locations first (new structure)
    if (doctor.practiceLocations && doctor.practiceLocations.length > 0) {
      doctor.practiceLocations.forEach(location => {
        if (location.isActive !== false && location.address?.city) {
          cities.push(location.address.city);
        }
      });
    }
    
    // Fallback to legacy address structure
    if (cities.length === 0 && doctor.address?.city) {
      cities.push(doctor.address.city);
    }
    
    // Remove duplicates and return
    const uniqueCities = [...new Set(cities)];
    
    if (uniqueCities.length === 0) {
      return 'Not specified';
    } else if (uniqueCities.length === 1) {
      return uniqueCities[0];
    } else if (uniqueCities.length <= 3) {
      return uniqueCities.join(', ');
    } else {
      return `${uniqueCities.slice(0, 2).join(', ')} +${uniqueCities.length - 2} more`;
    }
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

          {/* Location - Fixed to handle multiple practice locations */}
          <div className="detail-item">
            <i className="fas fa-map-marker-alt detail-icon"></i>
            <span>City: {getCities()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;