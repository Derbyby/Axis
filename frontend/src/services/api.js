const API_URL = 'http://64.181.213.97:5000/api' 

// Función helper para hacer peticiones
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición')
  }

  return data
}

// Servicio de autenticación
export const authService = {
  // Registrar nuevo usuario
  register: async (nombre, email, password) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password })
    })
  },

  // Login
  login: async (email, password) => {
    return apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Guardar token y usuario
  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  }
}

export default authService
