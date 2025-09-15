import React from 'react';
import '../styles/DashboardPatients.css';

const DashboardPatients = ({
  appointments,
  stats,
  filter,
  setFilter,
  cancellingId,
  handleCancelAppointment,
  handleUpdateStatus
}) => {

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

  return (
    <div className="patients-container">
      {/* Stats Cards */}
      <div className="patients-stats-grid">
        <div className="patients-stat-card total-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="patients-stat-card scheduled-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.scheduled}</h3>
            <p>Scheduled</p>
          </div>
        </div>
        <div className="patients-stat-card confirmed-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="patients-stat-card completed-card">
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
      <div className="patients-filter-section">
        <div className="patients-filter-tabs">
          <button 
            className={`patients-filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`patients-filter-tab ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button 
            className={`patients-filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`patients-filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={`patients-filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`patients-filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="patients-appointments-list">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment._id} className="patients-appointment-card">
              <div className="patients-appointment-header">
                <div className="patients-appointment-info">
                  <h3>Patient: {appointment.patientName}</h3>
                  <p className="patients-location-info">
                    <i className="fas fa-map-marker-alt"></i>
                    {appointment.locationName}
                  </p>
                </div>
                <div className={`patients-status-badge ${getStatusColor(appointment.status)}`}>
                  <i className={getStatusIcon(appointment.status)}></i>
                  <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                </div>
              </div>

              <div className="patients-appointment-details">
                <div className="patients-appointment-datetime">
                  <div className="patients-detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="patients-detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{formatTime(appointment.timeSlot)}</span>
                  </div>
                  <div className="patients-detail-item">
                    <i className="fas fa-list-ol"></i>
                    <span>Queue #{appointment.queueNumber}</span>
                  </div>
                  <div className="patients-detail-item">
                    <i className="fas fa-rupee-sign"></i>
                    <span>₹{appointment.consultationFee}</span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="patients-symptoms-section">
                    <h4>Symptoms:</h4>
                    <p>{appointment.symptoms}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="patients-notes-section">
                    <h4>Notes:</h4>
                    <p>{appointment.notes}</p>
                  </div>
                )}

                {appointment.cancellationReason && (
                  <div className="patients-cancellation-section">
                    <h4>Cancellation Reason:</h4>
                    <p>{appointment.cancellationReason}</p>
                    <small>Cancelled by: {appointment.cancelledBy}</small>
                  </div>
                )}
              </div>

              <div className="patients-appointment-actions">
                {appointment.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                      className="patients-action-btn confirm-btn"
                    >
                      <i className="fas fa-check"></i>
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(appointment._id, 'in-progress')}
                      className="patients-action-btn progress-btn"
                    >
                      <i className="fas fa-play"></i>
                      Start Consultation
                    </button>
                  </>
                )}

                {appointment.status === 'confirmed' && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment._id, 'in-progress')}
                    className="patients-action-btn progress-btn"
                  >
                    <i className="fas fa-play"></i>
                    Start Consultation
                  </button>
                )}

                {appointment.status === 'in-progress' && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                    className="patients-action-btn complete-btn"
                  >
                    <i className="fas fa-check-double"></i>
                    Mark Complete
                  </button>
                )}

                {canCancelAppointment(appointment) && (
                  <button 
                    onClick={() => handleCancelAppointment(appointment._id)}
                    disabled={cancellingId === appointment._id}
                    className="patients-action-btn cancel-btn"
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
                  className="patients-action-btn view-btn"
                >
                  <i className="fas fa-eye"></i>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="patients-no-appointments">
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

export default DashboardPatients;