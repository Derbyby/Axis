import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'; // Asegúrate de importar Link
import '../styles/Dashboard.css'

function Dashboard() {
    // ... (Tu estado y lógica de Pomodoro se mantienen igual) ...
    // ...

    const completedCount = tasks.filter(t => t.completed).length
    const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0; // Evitar división por cero

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const resetPomodoro = () => {
        setIsPomodoroRunning(false)
        setPomodoroTime(1500)
        setPomodoroMode('work')
    }
    
    // Simulación de iniciales de usuario (ej. Juan Pérez = JP)
    const userInitials = "JP"; 

    return (
        <div className="dashboard-container">
            {/* SVG Gradient para el círculo de progreso - Es importante tener esto en el HTML/JSX */}
            <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        {/* Nuevo color de gradiente sereno */}
                        <stop offset="0%" style={{stopColor:"#4a6c9a", stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor:"#37557a", stopOpacity:1}} />
                    </linearGradient>
                </defs>
            </svg>

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Bienvenido de vuelta 👋</h1>
                    <p className="date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                
                {/* ACCESO AL PERFIL MEJORADO */}
                <Link to="/profile" className="profile-link" title="Ir a Perfil">
                    <div className="profile-btn">
                        {userInitials} {/* Mostrar iniciales del usuario */}
                    </div>
                </Link>
            </div>

            {/* Grid Principal */}
            <div className="dashboard-grid">
                {/* ... (Resto de las tarjetas: Pomodoro, Progreso) ... */}
                {/* Las tarjetas Pomodoro y Progreso se mantienen iguales en JSX, pero toman los nuevos colores de CSS */}
                
                {/* Pomodoro Timer */}
                <div className="card pomodoro-card">
                    <h2>Pomodoro Timer</h2>
                    <div className={`timer ${pomodoroMode}`}>
                        <div className="timer-display">{formatTime(pomodoroTime)}</div>
                        <span className="timer-label">{pomodoroMode === 'work' ? 'Tiempo de Trabajo' : 'Descanso'}</span>
                    </div>
                    <div className="timer-controls">
                        <button 
                            className="btn-primary"
                            onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                        >
                            {isPomodoroRunning ? '⏸ Pausar' : '▶ Iniciar'}
                        </button>
                        <button 
                            className="btn-secondary"
                            onClick={resetPomodoro}
                        >
                            ↻ Reiniciar
                        </button>
                    </div>
                </div>

                {/* Progreso del Día */}
                <div className="card progress-card">
                    <h2>Progreso del Día</h2>
                    <div className="progress-content">
                        <div className="progress-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="progress-background" />
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    className="progress-fill"
                                    style={{
                                        // Usamos 2 * Math.PI * 45 ≈ 282.74
                                        strokeDasharray: `${(progressPercentage / 100) * 283} 283`
                                    }}
                                />
                            </svg>
                            <div className="progress-text">
                                <span className="percentage">{Math.round(progressPercentage)}%</span>
                                <span className="label">Completado</span>
                            </div>
                        </div>
                        <div className="progress-stats">
                            <div className="stat">
                                <span className="stat-number">{completedCount}</span>
                                <span className="stat-label">Completadas</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">{tasks.length - completedCount}</span>
                                <span className="stat-label">Pendientes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ... (Tareas del Día y Stats Rápidos se mantienen iguales en JSX) ... */}
            
            {/* Tareas del Día */}
            <div className="card tasks-card">
                <h2>Tareas de Hoy</h2>
                <div className="tasks-list">
                    {tasks.map(task => (
                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <div className="task-checkbox">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                    id={`task-${task.id}`}
                                />
                                <label htmlFor={`task-${task.id}`}></label>
                            </div>
                            <div className="task-content">
                                <p className="task-title">{task.title}</p>
                                <span className={`task-category category-${task.category}`}>
                                    {task.category}
                                </span>
                            </div>
                            <span className="task-badge">{task.completed ? '✓' : '○'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Rápidos */}
            <div className="quick-stats">
                <div className="stat-card">
                    <span className="stat-icon" role="img" aria-label="Racha">🔥</span>
                    <div>
                        <p className="stat-value">7</p>
                        <p className="stat-name">Racha Actual</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon" role="img" aria-label="Puntos">⭐</span>
                    <div>
                        <p className="stat-value">245</p>
                        <p className="stat-name">Puntos Totales</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon" role="img" aria-label="Cumplimiento">📊</span>
                    <div>
                        <p className="stat-value">89%</p>
                        <p className="stat-name">Cumplimiento</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard