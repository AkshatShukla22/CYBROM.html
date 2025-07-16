import React from 'react'
import "../style/footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>TechStore</h3>
          <p>Your one-stop shop for the latest technology and fashion.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Categories</h4>
          <ul>
            <li><a href="#electronics">Electronics</a></li>
            <li><a href="#audio">Audio</a></li>
            <li><a href="#fashion">Fashion</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>Email: info@techstore.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Address: 123 Tech Street, City, State 12345</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 TechStore. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer