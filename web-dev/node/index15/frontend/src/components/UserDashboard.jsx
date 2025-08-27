import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UserDashboard.css"; // Import your external CSS file

const UserDashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const useremail = localStorage.getItem("useremail");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("useremail");
    navigate("/login");
  };

  // Get first letter of username for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="home-container">
      {/* Floating particles */}
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      
      <div className="dashboard-card">
        {/* Avatar */}
        <div className="avatar-placeholder">
          {getInitials(username)}
        </div>
        
        <h1>Welcome, {username}!</h1>
        <p>Email: {useremail}</p>
        
        {/* Optional: Stats cards */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Status</h3>
            <div className="stat-value">Active</div>
          </div>
          <div className="stat-card">
            <h3>Sessions</h3>
            <div className="stat-value">1</div>
          </div>
        </div>
        
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default UserDashboard;