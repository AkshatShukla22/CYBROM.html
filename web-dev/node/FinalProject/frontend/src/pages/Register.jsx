import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (registerData.username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting...');
        setRegisterData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Animated Background Elements */}
      <div className="register-bg-shapes">
        <div className="register-shape register-shape-1"></div>
        <div className="register-shape register-shape-2"></div>
        <div className="register-shape register-shape-3"></div>
      </div>

      <div className="register-card">
        <div className="register-header">
          <h1>Respawn Hub</h1>
          <p>Create your gaming account</p>
        </div>

        {error && (
          <div className="register-alert-message register-alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="register-alert-message register-alert-success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </div>
        )}

        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-form-group">
            <label>
              <i className="fas fa-user"></i>
              Username
            </label>
            <div className="register-input-wrapper">
              <input
                className="register-form-input"
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div className="register-form-group">
            <label>
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <div className="register-input-wrapper">
              <input
                className="register-form-input"
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="register-form-group">
            <label>
              <i className="fas fa-lock"></i>
              Password
            </label>
            <div className="register-input-wrapper">
              <input
                className="register-form-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={registerData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
              />
              <button
                className="register-password-toggle-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="register-form-group">
            <label>
              <i className="fas fa-shield-alt"></i>
              Confirm Password
            </label>
            <div className="register-input-wrapper">
              <input
                className="register-form-input"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button className="register-submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?
            <button className="register-login-btn" onClick={() => navigate('/login')}>
              <i className="fas fa-sign-in-alt"></i>
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;