import React from 'react';
import Home from './Home';
import About from './About';
import ContactUs from './ContactUs';
import Insert from './Insert';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Link to={"Home"}>Home</Link> | 
      <Link to={"About"}>About us</Link> | 
      <Link to={"ContactUs"}>Contact us</Link> | 
      <Link to={"Support"}>Support</Link>
      <Link to={"Insert"}>Insert</Link>
      <hr />
      <Outlet />
      <hr />
      <h4>All rights are reserved to me.</h4> 

    </>
  );
}

export default Layout;
