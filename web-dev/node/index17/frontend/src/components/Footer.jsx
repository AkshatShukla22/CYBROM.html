// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Main Footer Content */}
        <div className="footer__main">
          {/* Company Info */}
          <div className="footer__section footer__section--about">
            <div className="footer__logo">
              <div className="logo__icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <span className="logo__text">MediCare</span>
            </div>
            <p className="footer__description">
              Providing exceptional healthcare services with compassion, innovation, and excellence. 
              Your health is our priority, and we're here to serve you 24/7.
            </p>
            <div className="footer__social">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__title">
              <i className="fas fa-link"></i>
              Quick Links
            </h4>
            <ul className="footer__links">
              <li><Link to="/" className="footer__link">Home</Link></li>
              <li><Link to="/about" className="footer__link">About Us</Link></li>
              <li><Link to="/services" className="footer__link">Services</Link></li>
              <li><Link to="/doctors" className="footer__link">Our Doctors</Link></li>
              <li><Link to="/appointments" className="footer__link">Book Appointment</Link></li>
              <li><Link to="/contact" className="footer__link">Contact</Link></li>
            </ul>
          </div>

          {/* Medical Services */}
          <div className="footer__section">
            <h4 className="footer__title">
              <i className="fas fa-stethoscope"></i>
              Medical Services
            </h4>
            <ul className="footer__links">
              <li><a href="#" className="footer__link">Emergency Care</a></li>
              <li><a href="#" className="footer__link">Cardiology</a></li>
              <li><a href="#" className="footer__link">Neurology</a></li>
              <li><a href="#" className="footer__link">Pediatrics</a></li>
              <li><a href="#" className="footer__link">Orthopedics</a></li>
              <li><a href="#" className="footer__link">Radiology</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer__section">
            <h4 className="footer__title">
              <i className="fas fa-phone-alt"></i>
              Contact Info
            </h4>
            <div className="footer__contact">
              <div className="footer-contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <strong>Address</strong>
                  <p>123 Medical Center Drive<br />Health City, HC 12345</p>
                </div>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <strong>Phone</strong>
                  <p>+91 12345 67890<br />Emergency: 100</p>
                </div>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <strong>Email</strong>
                  <p>info@medicare.com<br />appointments@medicare.com</p>
                </div>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <strong>Hours</strong>
                  <p>Mon-Fri: 8AM-8PM<br />Sat-Sun: 9AM-5PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="footer__newsletter">
          <div className="newsletter__content">
            <h3 className="newsletter__title">
              <i className="fas fa-envelope-open-text"></i>
              Stay Updated with Health Tips
            </h3>
            <p className="newsletter__description">
              Subscribe to our newsletter for the latest health news, tips, and medical updates.
            </p>
          </div>
          <form className="newsletter__form">
            <div className="newsletter__input-group">
              <input 
                type="email" 
                className="newsletter__input" 
                placeholder="Enter your email address"
                required
              />
              <button type="submit" className="newsletter__btn">
                <i className="fas fa-paper-plane"></i>
                Subscribe
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Footer */}
        <div className="footer__bottom">
          <div className="footer__bottom-content">
            <div className="footer__copyright">
              <p>&copy; 2024 MediCare Health Services. All rights reserved.</p>
            </div>
            <div className="footer__legal">
              <a href="#" className="legal-link">Privacy Policy</a>
              <a href="#" className="legal-link">Terms of Service</a>
              <a href="#" className="legal-link">Cookie Policy</a>
              <a href="#" className="legal-link">HIPAA Compliance</a>
            </div>
            <div className="footer__certifications">
              <div className="certification">
                <i className="fas fa-shield-alt"></i>
                <span>HIPAA Compliant</span>
              </div>
              <div className="certification">
                <i className="fas fa-certificate"></i>
                <span>JCI Accredited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {/* <button 
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <i className="fas fa-chevron-up"></i>
      </button> */}
    </footer>
  );
};

export default Footer;