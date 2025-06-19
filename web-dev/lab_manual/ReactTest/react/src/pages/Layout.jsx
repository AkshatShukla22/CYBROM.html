import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Layout = () => {
  return (
    <>
      <Navbar />
      <hr />
      <Outlet />
      <hr  />
      <h4>All Righhts are reserved to me.</h4>
    </>
  );
}

export default Layout;
