import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/Home" className="nav-link">Home</Link>
      <Link to="/Insert" className="nav-link">Insert</Link>
      <Link to="/Display" className="nav-link">Display</Link>
      <Link to="/Update" className="nav-link">Update</Link>
      <Link to="/Search" className="nav-link">Search</Link>
      <Link to="/TotalTYQ" className="nav-link">Total TYQ</Link>
    </nav>
  );
}

export default Navbar;
