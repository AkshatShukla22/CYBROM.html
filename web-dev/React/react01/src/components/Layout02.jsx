import React from 'react';
import {Outlet} from 'react-router-dom';
import Nav02 from './Nav02';
import Footer02 from './Footer02';

const Layout02 = () => {
  return (
    <>
      <Nav02 />
      <Outlet />
      <Footer02 />
    </>
  );
}

export default Layout02;
