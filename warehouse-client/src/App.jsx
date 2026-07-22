import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SectorBoardPage from './pages/SectorBoardPage'
import ProductsPage from './pages/ProductsPage'
import InboundOrdersPage from './pages/InboundOrdersPage'
import MessagesPage from './pages/MessagesPage'
import UsersPage from './pages/UsersPage'
import DeliveryAssignModal from './components/DeliveryAssignModal'
import MyTasksPage from './pages/MyTasksPage'
import OutboundOrdersPage from './pages/OutboundOrdersPage'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { isLoggedIn, role } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" />
  if (role !== 'Admin') return <Navigate to="/dashboard" />
  return children
}

function NonWorkerRoute({ children }) {
  const { isLoggedIn, role } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" />
  if (role === 'Worker') return <Navigate to="/my-tasks" />
  return children
}

export default function App() {
  return (
    <div>
      <DeliveryAssignModal />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <NonWorkerRoute><DashboardPage /></NonWorkerRoute>
        } />
        <Route path="/sectors/:id" element={
          <NonWorkerRoute><SectorBoardPage /></NonWorkerRoute>
        } />
        <Route path="/sectors/:id/products" element={
          <ProtectedRoute><ProductsPage /></ProtectedRoute>
        } />
        <Route path="/inbound-orders" element={
          <ProtectedRoute><InboundOrdersPage /></ProtectedRoute>
        } />
        <Route path="/outbound-orders" element={
          <NonWorkerRoute><OutboundOrdersPage /></NonWorkerRoute>
        } />
        <Route path="/my-tasks" element={
          <ProtectedRoute><MyTasksPage /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />
        <Route path="/users" element={
          <AdminRoute><UsersPage /></AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}