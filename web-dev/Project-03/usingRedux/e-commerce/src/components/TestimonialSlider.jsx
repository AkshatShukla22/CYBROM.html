import React, { useState, useEffect } from 'react';
import '../style/testimonial.css'

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b9c3a5e3?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      review: 'Amazing experience! The MacBook Pro I ordered arrived quickly and in perfect condition. Great customer service!',
      product: 'MacBook Pro 14-inch'
    },
    {
      id: 2,
      name: 'Rahul Gupta',
      role: 'Designer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      review: 'Love the variety of products and competitive prices. The Nike shoes I bought are exactly as described.',
      product: 'Nike Air Max 270'
    },
    {
      id: 3,
      name: 'Anjali Patel',
      role: 'Marketing Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 4,
      review: 'Excellent service and fast delivery. The iPhone 15 Pro works perfectly. Will definitely shop again!',
      product: 'iPhone 15 Pro'
    },
    {
      id: 4,
      name: 'Vikram Singh',
      role: 'Student',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      review: 'Best place to buy electronics! The Dell XPS 13 is perfect for my studies. Great customer support too.',
      product: 'Dell XPS 13'
    },
    {
      id: 5,
      name: 'Meera Reddy',
      role: 'Photographer',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      review: 'The Canon EOS R5 is a dream camera! Professional quality and the ordering process was smooth.',
      product: 'Canon EOS R5'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  return (
    <section className="testimonial-slider">
      <div className="section-header">
        <h2>What Our Customers Say</h2>
        <p>Real reviews from real customers</p>
      </div>

      <div className="testimonial-container">
        <button className="testimonial-nav prev" onClick={goToPrevious}>
          ❮
        </button>

        <div className="testimonial-content">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <img 
                src={testimonials[currentIndex].image} 
                alt={testimonials[currentIndex].name}
                className="customer-image"
              />
              <div className="customer-info">
                <h4 className="customer-name">{testimonials[currentIndex].name}</h4>
                <p className="customer-role">{testimonials[currentIndex].role}</p>
                <div className="rating">
                  {renderStars(testimonials[currentIndex].rating)}
                </div>
              </div>
            </div>
            
            <div className="testimonial-body">
              <p className="review-text">"{testimonials[currentIndex].review}"</p>
              <div className="product-bought">
                <span>Purchased: {testimonials[currentIndex].product}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="testimonial-nav next" onClick={goToNext}>
          ❯
        </button>
      </div>

      <div className="testimonial-indicators">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      <div className="testimonial-stats">
        <div className="stat-item">
          <span className="stat-number">4.8</span>
          <span className="stat-label">Average Rating</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">2,500+</span>
          <span className="stat-label">Happy Customers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">98%</span>
          <span className="stat-label">Satisfaction Rate</span>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider