import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SectorBoardPage from './pages/SectorBoardPage'
import MessagesPage from './pages/MessagesPage'
import UsersPage from './pages/UsersPage'

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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/sectors/:id" element={
        <ProtectedRoute><SectorBoardPage /></ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute><MessagesPage /></ProtectedRoute>
      } />
      <Route path="/users" element={
        <AdminRoute><UsersPage /></AdminRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}