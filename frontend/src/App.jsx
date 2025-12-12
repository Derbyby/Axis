import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          {/* Ruta principal: Login */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Ruta de registro */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Ruta del Dashboard (donde verán sus hábitos) */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App