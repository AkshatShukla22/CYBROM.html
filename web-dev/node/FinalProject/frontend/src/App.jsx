import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import NewsPage from './pages/NewsPage';
import Support from './pages/Support';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import AdminGameDetails from './pages/AdminGameDetails';
import GameDetail from './pages/GameDetail';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="support" element={<Support />} />
          <Route path="cart" element={<Cart />} />
          <Route path="/game/:id" element={<GameDetail />} />


        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="/admin/game/:id" element={<AdminGameDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
