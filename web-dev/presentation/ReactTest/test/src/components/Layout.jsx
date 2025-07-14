import { Link, Outlet } from 'react-router-dom';
import '../style/layout.css';

const Layout = () => {
  return (
    <>
      <div className="navbar">
        <Link to="Home">Home</Link>
        <Link to="CounterApp">Counter App</Link>
        <Link to="ThemeChange">Theme Change App</Link>
        <Link to="ToDoList">To Do List App</Link>
        <Link to="ContactUs">Contact Us</Link>
      </div>

      <Outlet />

      <div className="footer">
        <h1>All rights are reserved to me.</h1>
      </div>
    </>
  );
};

export default Layout;
