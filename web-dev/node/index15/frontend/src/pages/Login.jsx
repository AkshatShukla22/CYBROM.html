import { useState } from 'react';
import BackendUrl from '../utils/BackendUrl';
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import "../styles/Login.css"; 

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      let api = `${BackendUrl}user/login`;
      const response = await axios.post(api, form);

      console.log(response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        
        // Add success class for visual feedback
        const submitButton = document.querySelector('.login-form button');
        submitButton.classList.add('login-success');
        
        setTimeout(() => {
          navigate("/home");
        }, 500);
      } else {
        setErrors({ general: response.data.message || 'Login failed' });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* Floating background elements */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      
      <div className="login-card">
        <h2>Login</h2>
        
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={form.email} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className={errors.email ? 'login-error' : form.email ? 'login-success' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className={errors.password ? 'login-error' : form.password ? 'login-success' : ''}
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        
        <p>Don't have an account? <Link to="/register">Create Account</Link></p>
      </div>
    </div>
  )
}

export default Login;