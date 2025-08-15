import React from 'react';
import Home from './Home';
import About from './About';
import ContactUs from './ContactUs';
import Insert from './Insert';
import Display from './Display';
import Update02 from './Update02';
import Update from './Update';
import Search from './Search';
import { Link, Outlet } from 'react-router-dom';

const Layout03 = () => {
  return (
    <>
      <Link to={"Home"}>Home</Link> | 
      <Link to={"About"}>About us</Link> | 
      <Link to={"ContactUs"}>Contact us</Link> | 
      <Link to={"Support"}>Support</Link> | 
      <Link to={"Insert"}>Insert</Link> |
      <Link to={"Display"}>Display</Link> |
      <Link to={"Update"}>Update</Link> |
      <Link to={"Search"}>Search</Link> |
      <Link to={"Update02"}>Update02</Link> |
      <hr />

      <Outlet />
      
      <hr />
      <h4>All rights are reserved to me.</h4> 

    </>
  );
}

export default Layout03;
