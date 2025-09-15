import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Doctors from './pages/Doctors'
import Messages from './pages/Messages'
import DoctorProfileView from './pages/DoctorProfileView'
import AppointmentBooking from './pages/AppointmentBooking'
import AppointmentsList from './pages/AppointmentsList'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/doctor/:doctorId' element={<DoctorProfileView />} />
            <Route path='/book-appointment/:doctorId' element={<AppointmentBooking />} />
            <Route path='/appointments' element={<AppointmentsList />} />
            <Route path='/dashboard' element={<Dashboard />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App