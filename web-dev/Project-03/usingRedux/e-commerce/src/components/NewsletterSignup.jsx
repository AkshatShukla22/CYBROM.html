import React, { useState } from 'react';
import '../style/newsletter.css';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the email to your backend
      console.log('Newsletter subscription:', email);
      
      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubscribed(false);
    setError('');
    setEmail('');
  };

  return (
    <section className="newsletter-signup">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <div className="newsletter-header">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for exclusive offers and latest updates</p>
          </div>

          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`email-input ${error ? 'error' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="subscribe-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h3>Thank you for subscribing!</h3>
              <p>You'll receive our latest updates and exclusive offers.</p>
              <button onClick={handleReset} className="reset-btn">
                Subscribe Another Email
              </button>
            </div>
          )}

          <div className="newsletter-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">🎁</span>
              <span>Exclusive Offers</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📱</span>
              <span>New Product Alerts</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span>Special Discounts</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📧</span>
              <span>Weekly Updates</span>
            </div>
          </div>

          <div className="newsletter-footer">
            <p>Join 10,000+ subscribers who love our products</p>
            <div className="social-proof">
              <span className="subscriber-count">10,247 subscribers</span>
              <div className="subscriber-avatars">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b9c3a5e3?w=30&h=30&fit=crop&crop=face" alt="Subscriber" />
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face" alt="Subscriber" />
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face" alt="Subscriber" />
                <span className="more-subscribers">+10K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;