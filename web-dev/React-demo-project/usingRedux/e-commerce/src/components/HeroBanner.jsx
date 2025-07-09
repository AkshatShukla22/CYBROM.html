import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/heroBanner.css';

const HeroBanner = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: "Latest iPhone 15 Pro",
      subtitle: "Experience the future of mobile technology",
      description: "Starting at ₹99,900",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=400&fit=crop",
      cta: "Shop Now",
      category: "Electronics"
    },
    {
      id: 2,
      title: "MacBook Pro M2",
      subtitle: "Supercharged for pros",
      description: "From ₹1,65,900",
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=400&fit=crop",
      cta: "Explore",
      category: "Electronics"
    },
    {
      id: 3,
      title: "Fashion Collection",
      subtitle: "Discover your style",
      description: "Up to 50% off",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
      cta: "Shop Fashion",
      category: "Fashion"
    },
    {
      id: 4,
      title: "Audio Experience",
      subtitle: "Premium sound quality",
      description: "Starting at ₹20,700",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=400&fit=crop",
      cta: "Listen Now",
      category: "Audio"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleCTAClick = (category) => {
    navigate(`/?category=${category}`);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="hero-banner">
      <div className="banner-container">
        <div className="banner-slides">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="banner-overlay">
                <div className="banner-content">
                  <h1 className="banner-title">{banner.title}</h1>
                  <h2 className="banner-subtitle">{banner.subtitle}</h2>
                  <p className="banner-description">{banner.description}</p>
                  <button
                    className="banner-cta"
                    onClick={() => handleCTAClick(banner.category)}
                  >
                    {banner.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="banner-nav prev" onClick={goToPrevious}>
          ❮
        </button>
        <button className="banner-nav next" onClick={goToNext}>
          ❯
        </button>

        <div className="banner-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleSlideChange(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;