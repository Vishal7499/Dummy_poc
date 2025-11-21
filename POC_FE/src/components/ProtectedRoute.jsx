import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Maintenance from '../Screens/Maintenance'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Check maintenance mode
  const maintenanceMode = localStorage.getItem('maintenanceMode') === 'true'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Block admin users from accessing normal routes - redirect to admin dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // If maintenance mode is enabled, show maintenance page (admins can still access)
  if (maintenanceMode) {
    return <Maintenance />
  }

  return children
}

export default ProtectedRoute
