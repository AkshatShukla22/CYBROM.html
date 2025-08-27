import axios from "axios";
import { useEffect, useState } from "react";
import BackendUrl from "../utils/BackendUrl";
import { useNavigate, Link } from "react-router-dom";
import UserDashboard from "../components/UserDashboard";

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

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Welcome</h1>
        <Link to="/login">
          <button style={{ padding: "10px 20px", fontSize: "16px" }}>
            Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <UserDashboard />
    </>
  );
}

export default Home;