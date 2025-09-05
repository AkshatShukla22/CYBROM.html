import React from 'react';
import Header from './Header.jsx';
import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';

const Layout = () => {
  return (
    <>
      <Header />

      <Outlet />
      
      <Footer />
    </>
  );
}

export default Layout;
