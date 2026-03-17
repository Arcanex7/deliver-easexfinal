import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import BusinessDashboard from './pages/BusinessDashboard'
import AgentDashboard from './pages/AgentDashboard'
import TrackOrder from './pages/TrackOrder'
import StoreDirectory from './pages/StoreDirectory'
import StorePage from './pages/StorePage'
import StoreSetup from './pages/StoreSetup'
import PrivateRoute from './components/PrivateRoutes'
import Analytics from './pages/Analytics'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<StoreDirectory />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:orderNumber" element={<TrackOrder />} />
        <Route path="/store/:slug" element={<StorePage />} />
        <Route path="/business" element={
          <PrivateRoute role="business">
            <BusinessDashboard />
          </PrivateRoute>
        } />
        <Route path="/business/setup" element={
          <PrivateRoute role="business">
            <StoreSetup />
          </PrivateRoute>
        } />
        <Route path="/agent" element={
          <PrivateRoute role="agent">
            <AgentDashboard />
          </PrivateRoute>
        } />
        <Route path="/business/analytics" element={
  <PrivateRoute role="business">
    <Analytics />
  </PrivateRoute>
} />
      </Routes>
    </BrowserRouter>
  )
}

export default App