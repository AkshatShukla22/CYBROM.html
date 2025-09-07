// pages/Home.jsx - Fixed version with proper styling
import React from 'react';

const Home = () => {
  return (
    <div style={{
      paddingTop: '100px',  
      minHeight: '100vh',
      background: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#0f172a',
          marginBottom: '1rem',
          fontWeight: '700'
        }}>
          Welcome to MediCare
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#64748b',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          Your trusted healthcare partner. Book appointments with top doctors, 
          access medical services, and take control of your health journey.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          <button style={{
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Book Appointment
          </button>
          <button style={{
            background: 'transparent',
            color: '#2563eb',
            border: '2px solid #2563eb',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Find Doctors
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;