import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Importación de Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Community from './components/Community';
import Profile from './pages/Profile';

// --- COMPONENTE DE PROTECCIÓN ---
// Este "guardia" verifica si hay usuario. Si no, te manda al login.
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;

    if (!user) {
        // Si no hay usuario, redirigir al login
        return <Navigate to="/login" />;
    }

    // Si hay usuario, dejar pasar
    return children;
};

function App() {
    return (
        <AuthProvider>
            {/* <NotificationProvider> */}
                <Router>
                    <Routes>
                        {/* =========================================
                        ZONA PÚBLICA (Accesible sin login)
                       ========================================= */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* =========================================
                        ZONA PRIVADA (Requiere login)
                       ========================================= */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />


                        {/* =========================================
                        REDIRECCIONES
                       ========================================= */}
                        {/* Si entran a la raíz "/", mandar al Dashboard (o al login si no hay sesión) */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />

                        {/* Si escriben cualquier ruta loca, mandar al Login */}
                        <Route path="*" element={<Navigate to="/login" />} />

                    </Routes>
                </Router>
            {/* </NotificationProvider> */}
        </AuthProvider>
    );
}

export default App;