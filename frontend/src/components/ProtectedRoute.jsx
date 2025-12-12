import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return isAuthenticated ? children : <Navigate to="/" />
}

export default ProtectedRoute
