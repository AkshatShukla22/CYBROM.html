import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (loginData.email === 'admin@gmail.com' && loginData.password === 'admin') {
      setSuccess('Admin login successful! Redirecting...');
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        setLoginData({ email: '', password: '' });
        
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Grid Background */}
      <div className="grid-background"></div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Respawn Hub</h1>
          <p>Welcome back! Login to continue</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert-message alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert-message alert-success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <div className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <input
                className="form-input"
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <button
                className="password-toggle-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button className="submit-btn" onClick={handleLogin} disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Login
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?
            <button className="register-btn" onClick={() => navigate('/register')}>
              <i className="fas fa-user-plus"></i>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;