import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../utils/BackendURL';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('account');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('medicare-settings');
    return saved
      ? JSON.parse(saved)
      : {
          appointmentReminders: true,
          messageAlerts: true,
          compactCards: false,
          reduceMotion: false
        };
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
      } else {
        setError(data.message || 'Unable to load settings');
      }
    } catch (err) {
      console.error('Settings user fetch error:', err);
      setError('Network error while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(updated);
    localStorage.setItem('medicare-settings', JSON.stringify(updated));
    setStatusMessage('Preferences saved');
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setError('');
    setStatusMessage('');
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setError('');
    setStatusMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setError(data.message || 'Unable to update password');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError('Network error while updating password');
    } finally {
      setSavingPassword(false);
    }
  };

  const clearLocalSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <div className="settings-page">
      <section className="settings-hero">
        <div>
          <span className="settings-eyebrow">Account control</span>
          <h1>Settings</h1>
          <p>Manage your account security, notifications, display preferences, and session controls.</p>
        </div>
        <div className="settings-user-card">
          <div className="settings-user-icon">
            <i className={`fas ${currentUser?.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
          </div>
          <div>
            <strong>{currentUser?.name || 'MediCare User'}</strong>
            <span>{currentUser?.email}</span>
          </div>
        </div>
      </section>

      {(error || statusMessage) && (
        <div className={`settings-alert ${error ? 'settings-alert--error' : 'settings-alert--success'}`}>
          <i className={`fas ${error ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
          <span>{error || statusMessage}</span>
        </div>
      )}

      <section className="settings-shell">
        <aside className="settings-nav">
          {[
            { id: 'account', label: 'Account', icon: 'fa-id-card' },
            { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
            { id: 'preferences', label: 'Preferences', icon: 'fa-sliders-h' },
            { id: 'session', label: 'Session', icon: 'fa-power-off' }
          ].map((item) => (
            <button
              key={item.id}
              className={`settings-nav-btn ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {activeSection === 'account' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Account Details</h2>
                <button className="settings-action-btn" onClick={() => navigate('/profile')}>
                  <i className="fas fa-user-edit"></i>
                  Edit Profile
                </button>
              </div>
              <div className="settings-info-grid">
                <div>
                  <label>Name</label>
                  <strong>{currentUser?.name || 'N/A'}</strong>
                </div>
                <div>
                  <label>Email</label>
                  <strong>{currentUser?.email || 'N/A'}</strong>
                </div>
                <div>
                  <label>Role</label>
                  <strong>{currentUser?.userType === 'doctor' ? 'Doctor' : 'Patient'}</strong>
                </div>
                <div>
                  <label>Phone</label>
                  <strong>{currentUser?.phone || 'N/A'}</strong>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Password & Security</h2>
              </div>
              <form className="settings-form" onSubmit={submitPasswordChange}>
                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      minLength="6"
                      required
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      minLength="6"
                      required
                    />
                  </div>
                </div>
                <button className="settings-action-btn settings-action-btn--primary" disabled={savingPassword}>
                  <i className={`fas ${savingPassword ? 'fa-spinner fa-spin' : 'fa-lock'}`}></i>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Preferences</h2>
              </div>
              <div className="settings-toggle-list">
                {[
                  ['appointmentReminders', 'Appointment reminders', 'Show reminder prompts for upcoming appointments.'],
                  ['messageAlerts', 'Message alerts', 'Keep message alert indicators enabled.'],
                  ['compactCards', 'Compact doctor cards', 'Prefer denser card layouts where supported.'],
                  ['reduceMotion', 'Reduce motion', 'Minimize animated UI transitions where supported.']
                ].map(([key, title, description]) => (
                  <button key={key} className="settings-toggle-row" onClick={() => updatePreference(key)}>
                    <span>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    <span className={`settings-toggle ${preferences[key] ? 'active' : ''}`}>
                      <span></span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'session' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Session</h2>
              </div>
              <div className="settings-danger-card">
                <i className="fas fa-sign-out-alt"></i>
                <div>
                  <h3>Sign out of this device</h3>
                  <p>This clears your local session token and returns you to the login page.</p>
                </div>
                <button className="settings-danger-btn" onClick={clearLocalSession}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;
