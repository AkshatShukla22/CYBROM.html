import React, { useState, useEffect } from 'react';
import DashboardPatients from '../components/DashboardPatients';
import DashboardAnalytics from '../components/DashboardAnalytics';
import backendUrl from '../utils/BackendUrl';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
          <p>Welcome, Dr. {currentUser?.name}! Manage your patient appointments and view analytics.</p>
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

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`dashboard-tab ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <i className="fas fa-users"></i>
          Patients
        </button>
        <button 
          className={`dashboard-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-bar"></i>
          Analytics
        </button>
      </div>

      {/* Tab Content */}
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
    </div>
  );
};

export default Dashboard;