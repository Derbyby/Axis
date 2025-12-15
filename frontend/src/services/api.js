const API_URL = 'http://localhost:5000/api';

// Función helper para hacer peticiones
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
};

// Servicio de autenticación
export const authService = {
  register: async (nombre, email, password) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password })
    });
  },

  login: async (email, password) => {
    return apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export const dataService = {
  getHabits: async () => {
    return apiCall('/habits'); 
  },

  getTasks: async () => {
    return apiCall('/tasks');
  },

  checkHabit: async (id) => {
    return apiCall(`/habits/${id}/check`, { method: 'PUT' });
  },

  createTask: async (taskData) => {
    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }
};

export default authService;