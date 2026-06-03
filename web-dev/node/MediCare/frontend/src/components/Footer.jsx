// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__cta">
            <span className="footer__eyebrow">
              <i className="fas fa-shield-heart"></i>
              MediCare Network
            </span>
            <h2>Healthcare access that stays organized.</h2>
            <p>Find doctors, manage appointments, and keep patient conversations in one secure place.</p>
          </div>
          <div className="footer__actions">
            <Link to="/doctors" className="footer__primary-action">
              <i className="fas fa-user-md"></i>
              Find Doctors
            </Link>
            <Link to="/appointments" className="footer__secondary-action">
              <i className="fas fa-calendar-check"></i>
              Appointments
            </Link>
          </div>
        </div>

        <div className="footer__main">
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
              <a href="https://facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://x.com" className="social-link" aria-label="Twitter" target="_blank" rel="noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer__section">
            <h4 className="footer__title">
              <i className="fas fa-link"></i>
              Quick Links
            </h4>
            <ul className="footer__links">
              <li><Link to="/" className="footer__link">Home</Link></li>
              <li><Link to="/profile" className="footer__link">Profile</Link></li>
              <li><Link to="/doctors" className="footer__link">Our Doctors</Link></li>
              <li><Link to="/messages" className="footer__link">Messages</Link></li>
              <li><Link to="/appointments" className="footer__link">Appointments</Link></li>
              <li><Link to="/settings" className="footer__link">Settings</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h4 className="footer__title">
              <i className="fas fa-stethoscope"></i>
              Medical Services
            </h4>
            <ul className="footer__links">
              <li><Link to="/doctors?specialization=general" className="footer__link">General Care</Link></li>
              <li><Link to="/doctors?specialization=cardiology" className="footer__link">Cardiology</Link></li>
              <li><Link to="/doctors?specialization=neurology" className="footer__link">Neurology</Link></li>
              <li><Link to="/doctors?specialization=pediatrics" className="footer__link">Pediatrics</Link></li>
              <li><Link to="/doctors?specialization=orthopedics" className="footer__link">Orthopedics</Link></li>
              <li><Link to="/doctors?specialization=dermatology" className="footer__link">Dermatology</Link></li>
            </ul>
          </div>

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
          <form className="newsletter__form" onSubmit={(event) => event.preventDefault()}>
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

        <div className="footer__bottom">
          <div className="footer__bottom-content">
            <div className="footer__copyright">
              <p>&copy; 2026 MediCare Health Services. All rights reserved.</p>
            </div>
            <div className="footer__legal">
              <Link to="/settings" className="legal-link">Privacy Controls</Link>
              <Link to="/settings" className="legal-link">Terms</Link>
              <Link to="/settings" className="legal-link">Security</Link>
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
