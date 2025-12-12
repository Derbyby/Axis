# 🎯 Axis - Habit Tracker

Una aplicación web moderna para gestionar tus hábitos y tareas diarias con funcionalidad Pomodoro integrada.

## ✨ Características

- **Autenticación**: Registro e inicio de sesión seguro
- **Dashboard intuitivo**: Interfaz limpia y no saturada
- **Pomodoro Timer**: Técnica de productividad integrada (25 min trabajo + 5 min descanso)
- **Seguimiento de tareas**: Marca tus tareas completadas
- **Progreso visual**: Ve tu avance del día en tiempo real
- **Estadísticas**: Racha, puntos totales y cumplimiento
- **Responsive**: Funciona perfecto en móvil y desktop

## 🚀 Cómo empezar

### Requisitos
- Node.js (v14 o superior)
- npm o yarn

### Instalación

1. **Backend**
```bash
cd backend
npm install
npm start
# El servidor correrá en http://localhost:5000
```

2. **Frontend**
```bash
cd frontend
npm install
npm run dev
# La app correrá en http://localhost:5173
```

## 📋 Estructura

```
Axis/
├── backend/          # Servidor Express
│   ├── controllers/  # Lógica de negocio
│   ├── models/       # Esquemas de BD
│   ├── routes/       # Rutas API
│   └── middleware/   # Autenticación
├── frontend/         # App React
│   ├── src/
│   │   ├── pages/    # Componentes de páginas
│   │   ├── styles/   # CSS
│   │   ├── services/ # API calls
│   │   └── contexts/ # Estado global
```

## 🔑 Rutas de la API

### Autenticación
- `POST /api/users` - Registrar nuevo usuario
- `POST /api/users/login` - Login

## 🎨 Diseño

- **Colores**: Gradiente púrpura-azul para transmitir calma y motivación
- **Tipografía**: Segoe UI para mejor legibilidad
- **Espacios**: Márgenes generosos para no saturar

## 📝 Variables de Entorno

Backend (.env):
```
PORT=5000
MONGODB_URI=tu_conexion_mongodb
JWT_SECRET=tu_secreto_jwt
```

Frontend (.env):
```
VITE_API_URL=http://localhost:5000
```

## 💡 Funcionalidades Próximas

- [ ] Crear hábitos personalizados
- [ ] Integración con base de datos
- [ ] Notificaciones push
- [ ] Exportar reportes
- [ ] Modo oscuro

## 📄 Licencia

MIT
