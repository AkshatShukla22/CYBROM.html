import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import NewsPage from './pages/NewsPage';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import AdminGameDetails from './pages/AdminGameDetails';
import GameDetail from './pages/GameDetail';
import SupportPage from './pages/SupportPage';
import TicketDetailPage from './pages/TicketDetailPage';
import UserProfile from './pages/userProfile';
import ProtectedAdminRoute from './components/ProtectedAdminRoute'; // ADD THIS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="/support/:id" element={<TicketDetailPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="userprofile" element={<UserProfile />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="admin" 
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/game/:id" 
          element={
            <ProtectedAdminRoute>
              <AdminGameDetails />
            </ProtectedAdminRoute>
          } 
        />
        
        <Route path="*" element={<h1 style={{marginTop: '100px', textAlign: 'center'}}>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;

// i will start working on it from tomorrow.