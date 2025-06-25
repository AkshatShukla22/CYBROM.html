import React from 'react';
import Home from './Home';
import Insert from './Insert';
import Pagination from './Pagination';
import Update from './Update';
import Search from './Search';
import { Link, Outlet } from 'react-router-dom';

const Layout04 = () => {
  return (
    <>
      <Link to={"Home"}>Home</Link> | 
      <Link to={"Insert"}>Insert</Link> |
      <Link to={"Pagination"}>Display</Link> |
      <Link to={"Update"}>Update</Link> |
      <Link to={"Search"}>Search</Link> |
      <hr />

      <Outlet />
      
      <hr />
      <h4>All rights are reserved to me.</h4> 

    </>
  );
}

export default Layout04;
