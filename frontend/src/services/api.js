const API_URL = 'http://localhost:5000/api';

// --- 1. FUNCIÓN HELPER (Fetch Wrapper) ---
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      // Lanzamos error con el mensaje del backend o uno genérico
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// --- 2. SERVICIO DE AUTENTICACIÓN ---
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

// --- 3. SERVICIO DE DATOS (Tareas y Hábitos) ---
export const dataService = {

  // --- TAREAS ---
  getTasks: async () => {
    return apiCall('/tasks'); // GET por defecto
  },

  createTask: async (taskData) => {
    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  updateTask: async (id, data) => {
    return apiCall(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteTask: async (id) => {
    return apiCall(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  // --- HÁBITOS ---
  getHabits: async () => {
    return apiCall('/habits');
  },

  createHabit: async (habitData) => {
    return apiCall('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData)
    });
  },

  // Usamos PUT para actualizar (completar, cambiar título, racha, etc.)
  updateHabit: async (id, data) => {
    return apiCall(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteHabit: async (id) => {
    return apiCall(`/habits/${id}`, {
      method: 'DELETE'
    });
  },

  updateUser: async (id, userData) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  getRanking: async () => {
    return apiCall('/social/ranking');
  },

  searchUser: async (email) => {
    return apiCall(`/social/search?email=${email}`);
  },
};

export default authService;