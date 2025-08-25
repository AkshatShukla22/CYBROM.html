import React  from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h1>Welcome</h1>
      <p>Email</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
