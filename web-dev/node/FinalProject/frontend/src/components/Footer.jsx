import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <footer className="footer">
        <div className="footer-container">
          {/* Footer Top */}
          <div className="footer-top">
            <div className="footer-section">
              <div className="footer-brand">
                <i className="fas fa-ring"></i>
                <h3>Respawn Hub</h3>
              </div>
              <p className="footer-description">
                Rise, Tarnished — your journey awaits
              </p>
              <div className="social-links">
                <a href="#facebook" className="social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#twitter" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#instagram" className="social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#youtube" className="social-link">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#news">News</a></li>
                <li><a href="#deals">Special Deals</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#returns">Returns</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Account</h4>
              <ul className="footer-links">
                <li><a href="#profile">My Profile</a></li>
                <li><a href="#orders">Order History</a></li>
                <li><a href="#wishlist">Wishlist</a></li>
                <li><a href="#settings">Settings</a></li>
              </ul>
            </div>

            <div className="footer-section newsletter">
              <h4>Stay Updated</h4>
              <p>Subscribe to get the latest news and exclusive offers</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email" />
                <button>
                  <i className="fas fa-envelope"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; 2025 Respawn Hub. All rights reserved.</p>
            </div>
            <div className="footer-bottom-right">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="footer-bg-element element-1"></div>
        <div className="footer-bg-element element-2"></div>
        <div className="footer-bg-element element-3"></div>
      </footer>
      
    </>
  );
}

export default Footer;