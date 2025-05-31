import React from 'react';
import {Link} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const Nav02 = () => {
  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand to="#home">Navbar</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="Home">Home</Nav.Link>
            <Nav.Link as={Link} to="About">About us</Nav.Link>
            <Nav.Link as={Link} to="ContactUs">Contact us</Nav.Link>
            <Nav.Link as={Link} to="Support">Support</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default Nav02;
