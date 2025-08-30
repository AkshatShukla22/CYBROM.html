import axios from "axios";
import { useEffect, useState } from "react";
import BackendUrl from "../utils/BackendUrl";
import { useNavigate, Link } from "react-router-dom";
import UserDashboard from "../components/UserDashboard";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null means loading, true/false means authenticated/not
  let api = `${BackendUrl}user/userauth`;

  const userAuthenticate = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const response = await axios.post(api, null, { headers: { "x-auth-token": token } });
        console.log(response);

        localStorage.setItem("username", response.data.user.name);
        localStorage.setItem("useremail", response.data.user.email);
        setIsAuthenticated(true);
        // Remove navigate to dashboard, just show the dashboard component
      } catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }

  useEffect(() => {
    userAuthenticate();
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="loading-container">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="welcome-container">
        {/* Floating background elements */}
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        
        <div className="welcome-card">
          <h1 className="welcome-title">Welcome</h1>
          <Link to="/login" className="login-button">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <UserDashboard />
    </div>
  );
}

export default Home;