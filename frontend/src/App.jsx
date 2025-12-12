import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import { Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="container">
          <Routes>
            {/* Ruta principal: Login */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Ruta de registro */}
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Ruta del Dashboard (protegida) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App