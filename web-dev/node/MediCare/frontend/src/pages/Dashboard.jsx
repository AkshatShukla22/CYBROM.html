import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardPatients from '../components/DashboardPatients';
import DashboardAnalytics from '../components/DashboardAnalytics';
import backendUrl from '../utils/BackendURL';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');
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
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
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
        const appointmentsData = data.data?.appointments || data.appointments || [];
        setAppointments(appointmentsData);
        calculateStats(appointmentsData);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setAppointmentsLoading(false);
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

  const todayAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  }).length;

  const activeAppointments = appointments.filter((appointment) =>
    ['scheduled', 'confirmed', 'in-progress'].includes(appointment.status)
  ).length;

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const nextAppointment = [...appointments]
    .filter((appointment) => ['scheduled', 'confirmed', 'in-progress'].includes(appointment.status))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

  const formatCompactDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSlot = (appointment) => {
    if (!appointment?.timeSlot) return 'Time pending';
    return `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`;
  };

  if (loading) {
    return (
      <LoadingSpinner message="Loading dashboard..." />
    );
  }

  if (currentUser?.userType !== 'doctor') {
    return (
      <div className="dashboard-page-wrapper">
        <div className="access-denied-container">
          <div className="access-denied-icon">
            <i className="fas fa-user-shield"></i>
          </div>
          <span>Doctor workspace</span>
          <h2>Dashboard access is reserved for doctors.</h2>
          <p>Your patient profile is ready, but clinical tools live inside verified doctor accounts.</p>
          <Link to="/" className="go-home-btn">
            <i className="fas fa-home"></i>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page-wrapper">
      <section className="dashboard-hero">
        <div className="dashboard-hero__content">
          <span className="dashboard-eyebrow">
            <i className="fas fa-stethoscope"></i>
            Doctor Command Center
          </span>
          <h1>Welcome back, Dr. {currentUser?.name}</h1>
          <p>Track appointments, keep consultations moving, and review patient flow from one structured workspace.</p>
          <div className="dashboard-hero__actions">
            <Link to="/appointments" className="dashboard-primary-action">
              <i className="fas fa-calendar-check"></i>
              View Schedule
            </Link>
            <Link to="/messages" className="dashboard-secondary-action">
              <i className="fas fa-comment-medical"></i>
              Open Messages
            </Link>
          </div>
        </div>
        <div className="dashboard-live-panel">
          <div className="dashboard-live-card">
            <span>Next patient</span>
            <strong>{nextAppointment?.patientName || 'No active queue'}</strong>
            <p>
              {nextAppointment
                ? `${formatCompactDate(nextAppointment.appointmentDate)} · ${formatSlot(nextAppointment)}`
                : 'New appointments will appear here.'}
            </p>
          </div>
          <div className="dashboard-mini-grid">
            <div>
              <strong>{todayAppointments}</strong>
              <span>Today</span>
            </div>
            <div>
              <strong>{activeAppointments}</strong>
              <span>Active</span>
            </div>
            <div>
              <strong>{completionRate}%</strong>
              <span>Complete</span>
            </div>
          </div>
          {appointmentsLoading && (
            <div className="dashboard-sync">
              <i className="fas fa-circle-notch fa-spin"></i>
              Syncing dashboard
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="dashboard-error-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="dashboard-close-alert">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button 
          className={`dashboard-tab ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <i className="fas fa-users"></i>
          Patient Queue
        </button>
        <button 
          className={`dashboard-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-bar"></i>
          Analytics Studio
        </button>
      </div>

      <section className="dashboard-content-shell">
        {activeTab === 'patients' && (
          <DashboardPatients
            appointments={appointments}
            stats={stats}
            filter={filter}
            setFilter={setFilter}
            cancellingId={cancellingId}
            handleCancelAppointment={handleCancelAppointment}
            handleUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <DashboardAnalytics
            appointments={appointments}
            stats={stats}
          />
        )}
      </section>
    </div>
  );
};

export default Dashboard;
