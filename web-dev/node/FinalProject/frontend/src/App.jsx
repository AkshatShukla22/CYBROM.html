import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import News from './pages/News';
import Support from './pages/Support';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="news" element={<News />} />
          <Route path="support" element={<Support />} />
          <Route path="cart" element={<Cart />} />


        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
