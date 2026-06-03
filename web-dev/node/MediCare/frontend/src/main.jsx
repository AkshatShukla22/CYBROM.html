import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SocketProvider } from './contexts/SocketContext.jsx';
import App from './App.jsx'
import './styles/DesignSystem.css'
import './styles/Performance.css'

createRoot(document.getElementById('root')).render(
  <SocketProvider>
    <App />
  </SocketProvider>,
)
