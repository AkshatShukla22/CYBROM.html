import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedAdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/verify', {
          withCredentials: true
        });
        
        console.log('Admin verification response:', response.data);
        
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          
          if (response.data.user.isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            console.warn('User is authenticated but not an admin');
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            Verifying Admin Access...
          </div>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in at all - redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Logged in but not admin - show access denied or redirect to home
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>Access Denied</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          You do not have administrator privileges to access this page.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;