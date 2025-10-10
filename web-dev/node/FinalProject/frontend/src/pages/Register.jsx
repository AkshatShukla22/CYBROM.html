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
      <div className="register-card">
        <div className="register-header">
          <h1>Respawn Hub</h1>
          <p>Create a new account</p>
        </div>

        {error && (
          <div className="register-alert-message register-alert-error">
            {error}
          </div>
        )}
        {success && (
          <div className="register-alert-message register-alert-success">
            {success}
          </div>
        )}

        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-form-group">
            <label>Username</label>
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

          <div className="register-form-group">
            <label>Email</label>
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

          <div className="register-form-group">
            <label>Password</label>
            <div className="register-password-wrapper">
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
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="register-form-group">
            <label>Confirm Password</label>
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

          <button className="register-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <button className="register-login-btn" onClick={() => navigate('/login')}>
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;