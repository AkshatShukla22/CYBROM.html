import React, { useMemo, useState, useEffect } from 'react';
import backendUrl from '../utils/BackendURL';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/AppointmentsList.css';

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
      // Only fetch appointments for patients
      if (currentUser.userType !== 'doctor') {
        fetchAppointments();
      } else {
        setLoading(false);
      }
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
      const endpoint = '/api/appointments/patient/appointments';
      
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

  const appointmentStats = useMemo(() => {
    const counts = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});

    const upcoming = appointments
      .filter((appointment) => ['scheduled', 'confirmed', 'in-progress'].includes(appointment.status))
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

    const totalFees = appointments.reduce((sum, appointment) => {
      return sum + Number(appointment.consultationFee || 0);
    }, 0);

    return {
      total: appointments.length,
      scheduled: counts.scheduled || 0,
      confirmed: counts.confirmed || 0,
      completed: counts.completed || 0,
      cancelled: counts.cancelled || 0,
      upcoming,
      totalFees
    };
  }, [appointments]);

  const filterTabs = [
    { value: 'all', label: 'All', icon: 'fas fa-layer-group', count: appointmentStats.total },
    { value: 'scheduled', label: 'Scheduled', icon: 'fas fa-calendar-alt', count: appointmentStats.scheduled },
    { value: 'confirmed', label: 'Confirmed', icon: 'fas fa-check-circle', count: appointmentStats.confirmed },
    { value: 'completed', label: 'Completed', icon: 'fas fa-check-double', count: appointmentStats.completed },
    { value: 'cancelled', label: 'Cancelled', icon: 'fas fa-times-circle', count: appointmentStats.cancelled }
  ];

  if (loading) {
    return (
      <LoadingSpinner message="Loading appointments..." />
    );
  }

  // If user is a doctor, show empty state directing them to dashboard
  if (currentUser?.userType === 'doctor') {
    return (
      <div className="appointments-page-wrapper">
        <div className="appointments-main-header">
          <div className="appointments-header-content">
            <span className="appointments-eyebrow">Doctor portal</span>
            <h1>My Appointments</h1>
            <p>Manage your appointments and consultations</p>
          </div>
        </div>

        <div className="no-appointments-container">
          <i className="fas fa-user-md"></i>
          <h3>Doctor Portal</h3>
          <p>
            As a doctor, your appointment management is handled through the Dashboard.
          </p>
          <p>
            Please visit the Dashboard to manage patient appointments, confirm consultations, and handle your practice.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="book-new-appointment-btn"
          >
            <i className="fas fa-tachometer-alt"></i>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-page-wrapper">
      {/* Header */}
      <div className="appointments-main-header">
        <div className="appointments-header-content">
          <span className="appointments-eyebrow">Care schedule</span>
          <h1>My Appointments</h1>
          <p>Manage your appointments and consultations</p>
        </div>
        <div className="appointments-hero-card">
          <div>
            <span>Next Visit</span>
            <strong>
              {appointmentStats.upcoming
                ? formatDate(appointmentStats.upcoming.appointmentDate)
                : 'No upcoming visit'}
            </strong>
          </div>
          <i className="fas fa-calendar-check"></i>
        </div>
      </div>

      <div className="appointments-summary-grid">
        <div className="appointment-summary-card">
          <i className="fas fa-calendar-day"></i>
          <span>Total</span>
          <strong>{appointmentStats.total}</strong>
        </div>
        <div className="appointment-summary-card">
          <i className="fas fa-clock"></i>
          <span>Scheduled</span>
          <strong>{appointmentStats.scheduled}</strong>
        </div>
        <div className="appointment-summary-card">
          <i className="fas fa-check-double"></i>
          <span>Completed</span>
          <strong>{appointmentStats.completed}</strong>
        </div>
        <div className="appointment-summary-card">
          <i className="fas fa-rupee-sign"></i>
          <span>Total Fees</span>
          <strong>₹{appointmentStats.totalFees}</strong>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="appointments-error-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="appointments-close-alert">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="appointments-filter-section">
        <div className="appointments-filter-tabs">
          {filterTabs.map((tab) => (
            <button 
              key={tab.value}
              className={`appointments-filter-tab ${filter === tab.value ? 'active' : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
              <small>{tab.count}</small>
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-main-list">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-item-card">
              <div className="appointment-timeline-marker">
                <i className={getStatusIcon(appointment.status)}></i>
              </div>
              <div className="appointment-card-header">
                <div className="appointment-main-info">
                  <h3>Dr. {appointment.doctorName}</h3>
                  <p className="appointment-location-info">
                    <i className="fas fa-map-marker-alt"></i>
                    {appointment.locationName}
                  </p>
                </div>
                <div className={`appointment-status-badge ${getStatusColor(appointment.status)}`}>
                  <i className={getStatusIcon(appointment.status)}></i>
                  <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                </div>
              </div>

              <div className="appointment-card-details">
                <div className="appointment-datetime-info">
                  <div className="appointment-detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="appointment-detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{formatTime(appointment.timeSlot)}</span>
                  </div>
                  <div className="appointment-detail-item">
                    <i className="fas fa-list-ol"></i>
                    <span>Queue #{appointment.queueNumber}</span>
                  </div>
                  <div className="appointment-detail-item">
                    <i className="fas fa-rupee-sign"></i>
                    <span>₹{appointment.consultationFee}</span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="appointment-symptoms-section">
                    <h4>Symptoms:</h4>
                    <p>{appointment.symptoms}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="appointment-notes-section">
                    <h4>Notes:</h4>
                    <p>{appointment.notes}</p>
                  </div>
                )}

                {appointment.cancellationReason && (
                  <div className="appointment-cancellation-section">
                    <h4>Cancellation Reason:</h4>
                    <p>{appointment.cancellationReason}</p>
                    <small>Cancelled by: {appointment.cancelledBy}</small>
                  </div>
                )}
              </div>

              <div className="appointment-card-actions">
                {canCancelAppointment(appointment) && (
                  <button 
                    onClick={() => handleCancelAppointment(appointment._id)}
                    disabled={cancellingId === appointment._id}
                    className="appointment-action-btn cancel-action-btn"
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
                  className="appointment-action-btn view-action-btn"
                >
                  <i className="fas fa-eye"></i>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-appointments-container">
            <i className="fas fa-calendar-times"></i>
            <h3>No appointments found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any appointments yet."
                : `No ${filter} appointments found.`
              }
            </p>
            <button 
              onClick={() => window.location.href = '/doctors'}
              className="book-new-appointment-btn"
            >
              <i className="fas fa-calendar-plus"></i>
              Book New Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;
