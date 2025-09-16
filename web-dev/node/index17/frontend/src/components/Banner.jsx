import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Banner.css';

const Banner = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const slides = [
    {
      id: 1,
      title: "Book Your Doctor Appointment Online",
      subtitle: "Skip the wait! Schedule appointments with top-rated doctors in seconds. Available 24/7 for your convenience.",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1400&h=650&fit=crop",
      buttonText: "Book Now",
      action: "doctors"
    },
    {
      id: 2,
      title: "Expert Specialists at Your Service",
      subtitle: "Access to 500+ certified specialists across 40+ medical fields. Get the expert care you deserve.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1400&h=650&fit=crop",
      buttonText: "Find Specialist",
      action: "doctors"
    },
    {
      id: 3,
      title: "Emergency Care When You Need It",
      subtitle: "24/7 emergency medical services with immediate response. Your health emergency is our priority.",
      image: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=1400&h=650&fit=crop",
      buttonText: "Emergency Help",
      action: "emergency"
    },
    {
      id: 4,
      title: "Telemedicine & Virtual Consultations",
      subtitle: "Consult with doctors from home via video calls. Safe, convenient, and instant medical advice.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&h=650&fit=crop",
      buttonText: "Start Messaging",
      action: "messages"
    },
    {
      id: 5,
      title: "Complete Health Management",
      subtitle: "Track appointments, view reports, manage prescriptions. Your complete health companion in one place.",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1400&h=650&fit=crop",
      buttonText: "Manage Health",
      action: "services"
    }
  ];

  // Function to start the timer
  const startTimer = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start new interval
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);
  };

  // Function to reset timer
  const resetTimer = () => {
    startTimer();
  };

  // Initialize timer on mount
  useEffect(() => {
    startTimer();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slides.length]);

  // Handle button clicks based on slide action
  const handleButtonClick = (action) => {
    switch (action) {
      case 'doctors':
        navigate('/doctors');
        break;
      case 'emergency':
        const emergencySection = document.querySelector('.emergency-section');
        if (emergencySection) {
          emergencySection.scrollIntoView({ behavior: 'smooth' });
        } else {
          // If not on home page, navigate to home and then scroll
          navigate('/', { state: { scrollTo: 'emergency' } });
        }
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'services':
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          // If not on home page, navigate to home and then scroll
          navigate('/', { state: { scrollTo: 'services' } });
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetTimer(); // Reset timer when manually changing slides
  };

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
    resetTimer(); // Reset timer when manually changing slides
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
    resetTimer(); // Reset timer when manually changing slides
  };

  return (
    <>
      <div className="doctor-banner">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`banner-slide ${index === currentSlide ? 'slide-active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay"></div>
            <div className="floating-elements">
              <div className="floating-element"></div>
              <div className="floating-element"></div>
              <div className="floating-element"></div>
            </div>
            <div className="slide-content-wrapper">
              <div className="slide-text-content">
                <h1 className="slide-main-title">{slide.title}</h1>
                <p className="slide-description">{slide.subtitle}</p>
                <button 
                  className="slide-cta-button"
                  onClick={() => handleButtonClick(slide.action)}
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="banner-navigation">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`nav-dot ${index === currentSlide ? 'dot-active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        <button className="banner-arrow arrow-prev" onClick={prevSlide}>
          ←
        </button>
        <button className="banner-arrow arrow-next" onClick={nextSlide}>
          →
        </button>

        <div className="slide-progress">
          <div 
            className="progress-bar"
            style={{
              animation: `progressBar 5000ms linear infinite`,
              animationDelay: '0s'
            }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default Banner;