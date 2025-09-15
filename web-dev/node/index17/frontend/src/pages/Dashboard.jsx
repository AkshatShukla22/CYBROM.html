import React, { useState, useEffect } from 'react';
import backendUrl from '../utils/BackendURl';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [stats, setStats] = useState({
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    total: 0
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.userType === 'doctor') {
      fetchAppointments();
    }
  }, [currentUser, filter]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view dashboard');
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
        setError('Please login to view dashboard');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Please login to view dashboard');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = '/api/appointments/doctor/appointments';
      
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
        calculateStats(data.data.appointments);
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

  const calculateStats = (appointmentsList) => {
    const scheduled = appointmentsList.filter(app => app.status === 'scheduled').length;
    const confirmed = appointmentsList.filter(app => app.status === 'confirmed').length;
    const completed = appointmentsList.filter(app => app.status === 'completed').length;
    
    setStats({
      scheduled,
      confirmed,
      completed,
      total: appointmentsList.length
    });
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
      <div className="dashboard-page-wrapper">
        <div className="dashboard-loading-container">
          <div className="dashboard-loading-spinner">
            <i className="fas fa-spinner"></i>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is not a doctor, redirect or show error
  if (currentUser?.userType !== 'doctor') {
    return (
      <div className="dashboard-page-wrapper">
        <div className="access-denied-container">
          <h2>Access Denied</h2>
          <p>This dashboard is only accessible to doctors.</p>
          <button onClick={() => window.location.href = '/'} className="go-home-btn">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page-wrapper">
      {/* Header */}
      <div className="dashboard-main-header">
        <div className="dashboard-header-content">
          <h1>Doctor Dashboard</h1>
          <p>Welcome, Dr. {currentUser?.name}! Manage your patient appointments and consultations.</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="dashboard-error-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="dashboard-close-alert">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card total-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="dashboard-stat-card scheduled-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.scheduled}</h3>
            <p>Scheduled</p>
          </div>
        </div>
        <div className="dashboard-stat-card confirmed-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="dashboard-stat-card completed-card">
          <div className="stat-icon">
            <i className="fas fa-check-double"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="dashboard-filter-section">
        <div className="dashboard-filter-tabs">
          <button 
            className={`dashboard-filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`dashboard-filter-tab ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button 
            className={`dashboard-filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`dashboard-filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={`dashboard-filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`dashboard-filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="dashboard-appointments-list">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment._id} className="dashboard-appointment-card">
              <div className="dashboard-appointment-header">
                <div className="dashboard-appointment-info">
                  <h3>Patient: {appointment.patientName}</h3>
                  <p className="dashboard-location-info">
                    <i className="fas fa-map-marker-alt"></i>
                    {appointment.locationName}
                  </p>
                </div>
                <div className={`dashboard-status-badge ${getStatusColor(appointment.status)}`}>
                  <i className={getStatusIcon(appointment.status)}></i>
                  <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                </div>
              </div>

              <div className="dashboard-appointment-details">
                <div className="dashboard-appointment-datetime">
                  <div className="dashboard-detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="dashboard-detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{formatTime(appointment.timeSlot)}</span>
                  </div>
                  <div className="dashboard-detail-item">
                    <i className="fas fa-list-ol"></i>
                    <span>Queue #{appointment.queueNumber}</span>
                  </div>
                  <div className="dashboard-detail-item">
                    <i className="fas fa-rupee-sign"></i>
                    <span>₹{appointment.consultationFee}</span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="dashboard-symptoms-section">
                    <h4>Symptoms:</h4>
                    <p>{appointment.symptoms}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="dashboard-notes-section">
                    <h4>Notes:</h4>
                    <p>{appointment.notes}</p>
                  </div>
                )}

                {appointment.cancellationReason && (
                  <div className="dashboard-cancellation-section">
                    <h4>Cancellation Reason:</h4>
                    <p>{appointment.cancellationReason}</p>
                    <small>Cancelled by: {appointment.cancelledBy}</small>
                  </div>
                )}
              </div>

              <div className="dashboard-appointment-actions">
                {appointment.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                      className="dashboard-action-btn confirm-btn"
                    >
                      <i className="fas fa-check"></i>
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(appointment._id, 'in-progress')}
                      className="dashboard-action-btn progress-btn"
                    >
                      <i className="fas fa-play"></i>
                      Start Consultation
                    </button>
                  </>
                )}

                {appointment.status === 'confirmed' && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment._id, 'in-progress')}
                    className="dashboard-action-btn progress-btn"
                  >
                    <i className="fas fa-play"></i>
                    Start Consultation
                  </button>
                )}

                {appointment.status === 'in-progress' && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                    className="dashboard-action-btn complete-btn"
                  >
                    <i className="fas fa-check-double"></i>
                    Mark Complete
                  </button>
                )}

                {canCancelAppointment(appointment) && (
                  <button 
                    onClick={() => handleCancelAppointment(appointment._id)}
                    disabled={cancellingId === appointment._id}
                    className="dashboard-action-btn cancel-btn"
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
                  className="dashboard-action-btn view-btn"
                >
                  <i className="fas fa-eye"></i>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="dashboard-no-appointments">
            <i className="fas fa-calendar-times"></i>
            <h3>No appointments found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any patient appointments yet."
                : `No ${filter} appointments found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;