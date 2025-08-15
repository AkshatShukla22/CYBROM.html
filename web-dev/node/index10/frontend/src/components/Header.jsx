import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css'; // Assuming you have a CSS file for styles

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Nav className="justify-content-center navbar-custom">
      <Nav.Item>
        <Nav.Link as={Link} to="/home" className={isActive("/home") ? "active" : ""}>
          Home
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/insert" className={isActive("/insert") ? "active" : ""}>
          Insert
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/display" className={isActive("/display") ? "active" : ""}>
          Display
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/update" className={isActive("/update") ? "active" : ""}>
          Update
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/search" className={isActive("/search") ? "active" : ""}>
          Search
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default Header;
