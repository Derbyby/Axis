import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar si hay usuario guardado al cargar
    const savedUser = authService.getCurrentUser()
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (token, userData) => {
    authService.setAuth(token, userData)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUserLocal = (newUserData) => {
    // Combina los datos actuales con los nuevos
    const updatedUser = { ...user, ...newUserData };

    // 1. Actualiza el estado de React
    setUser(updatedUser);

    // 2. Actualiza el almacenamiento local (persistencia)
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
