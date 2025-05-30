import React from 'react';
import { Link, Outlet} from 'react-router-dom';
import Home from './Home';
import About from './About';
import ContactUs from './ContactUs';

const Layout = () => {
  return (
    <>
      <Link to="Home">Home| </Link>
      <Link to="About">About us| </Link>
      <Link to="ContactUs">Contact us| </Link>
      <hr />
      <Outlet />
      <hr />
      <h6>All right reserved to me.</h6>
    </>
  );
}

export default Layout;
