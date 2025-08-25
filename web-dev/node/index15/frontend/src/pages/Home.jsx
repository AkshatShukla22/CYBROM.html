import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error("Invalid JSON in localStorage", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>Please log in first.</h2>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="welcome-card">
        <h1>Welcome, {user.username}!</h1>
        <div className="user-info">
          <p><strong>Name:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;