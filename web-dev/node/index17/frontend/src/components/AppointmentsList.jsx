import React, { useState, useEffect } from 'react';
import backendUrl from '../utils/BackendURl';
// import '../styles/AppointmentsList.css';

const AppointmentsList = () => {
  
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser, filter]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view appointments');
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      } else {
        setError('Please login to view appointments');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Please login to view appointments');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = currentUser?.userType === 'doctor' 
        ? '/api/appointments/doctor/appointments'
        : '/api/appointments/patient/appointments';
      
      const queryParams = new URLSearchParams();
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }

      const response = await fetch(`${backendUrl}${endpoint}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAppointments(data.data.appointments);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Appointments fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    setCancellingId(appointmentId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancellationReason: reason || 'No reason provided'
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh appointments list
        fetchAppointments();
      } else {
        setError(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Cancel appointment error:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        fetchAppointments();
      } else {
        setError(data.message || 'Failed to update appointment status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Update status error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeSlot) => {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'status-scheduled',
      'confirmed': 'status-confirmed',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'no-show': 'status-no-show'
    };
    return colors[status] || 'status-default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'scheduled': 'fas fa-calendar-alt',
      'confirmed': 'fas fa-check-circle',
      'in-progress': 'fas fa-user-md',
      'completed': 'fas fa-check-double',
      'cancelled': 'fas fa-times-circle',
      'no-show': 'fas fa-user-slash'
    };
    return icons[status] || 'fas fa-question-circle';
  };

  const canCancelAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
    
    return appointment.status === 'scheduled' && hoursUntilAppointment > 2;
  };

  if (loading) {
    return (
      <div className="appointments-page-container">
        <div className="appointments-loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-page-container">
      {/* Header */}
      <div className="appointments-header">
        <div className="appointments-header-content">
          <h1>My Appointments</h1>
          <p>Manage your appointments and consultations</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="message-alert error-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-alert">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="appointments-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button 
            className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-info">
                  {currentUser?.userType === 'doctor' ? (
                    <h3>Patient: {appointment.patientName}</h3>
                  ) : (
                    <h3>Dr. {appointment.doctorName}</h3>
                  )}
                  <p className="appointment-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {appointment.locationName}
                  </p>
                </div>
                <div className={`appointment-status ${getStatusColor(appointment.status)}`}>
                  <i className={getStatusIcon(appointment.status)}></i>
                  <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                </div>
              </div>

              <div className="appointment-details">
                <div className="appointment-datetime">
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{formatTime(appointment.timeSlot)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-list-ol"></i>
                    <span>Queue #{appointment.queueNumber}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-rupee-sign"></i>
                    <span>₹{appointment.consultationFee}</span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="appointment-symptoms">
                    <h4>Symptoms:</h4>
                    <p>{appointment.symptoms}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="appointment-notes">
                    <h4>Notes:</h4>
                    <p>{appointment.notes}</p>
                  </div>
                )}

                {appointment.cancellationReason && (
                  <div className="appointment-cancellation">
                    <h4>Cancellation Reason:</h4>
                    <p>{appointment.cancellationReason}</p>
                    <small>Cancelled by: {appointment.cancelledBy}</small>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                {currentUser?.userType === 'doctor' && appointment.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                      className="action-btn confirm-btn"
                    >
                      <i className="fas fa-check"></i>
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(appointment._id, 'in-progress')}
                      className="action-btn progress-btn"
                    >
                      <i className="fas fa-play"></i>
                      Start Consultation
                    </button>
                  </>
                )}

                {currentUser?.userType === 'doctor' && appointment.status === 'in-progress' && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                    className="action-btn complete-btn"
                  >
                    <i className="fas fa-check-double"></i>
                    Mark Complete
                  </button>
                )}

                {canCancelAppointment(appointment) && (
                  <button 
                    onClick={() => handleCancelAppointment(appointment._id)}
                    disabled={cancellingId === appointment._id}
                    className="action-btn cancel-btn"
                  >
                    {cancellingId === appointment._id ? (
                      <span>
                        <i className="fas fa-spinner fa-spin"></i>
                        Cancelling...
                      </span>
                    ) : (
                      <span>
                        <i className="fas fa-times"></i>
                        Cancel
                      </span>
                    )}
                  </button>
                )}

                <button 
                  onClick={() => window.location.href = `/appointments/${appointment._id}`}
                  className="action-btn view-btn"
                >
                  <i className="fas fa-eye"></i>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-appointments-message">
            <i className="fas fa-calendar-times"></i>
            <h3>No appointments found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any appointments yet."
                : `No ${filter} appointments found.`
              }
            </p>
            {currentUser?.userType !== 'doctor' && (
              <button 
                onClick={() => window.location.href = '/doctors'}
                className="book-appointment-btn"
              >
                <i className="fas fa-calendar-plus"></i>
                Book New Appointment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;