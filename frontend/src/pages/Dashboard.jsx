import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'; // Asegúrate de importar Link
import '../styles/Dashboard.css'

function Dashboard() {
    // 1. ESTADO DE TAREAS (SOLUCIÓN DEL ERROR)
    // Se inicializa con tareas de ejemplo.
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Terminar maquetación del Dashboard', completed: true, category: 'trabajo' },
        { id: 2, title: 'Investigar librería React-DND', completed: false, category: 'aprendizaje' },
        { id: 3, title: 'Escribir 500 palabras del reporte', completed: false, category: 'trabajo' },
        { id: 4, title: '30 minutos de ejercicio', completed: false, category: 'salud' },
        { id: 5, title: 'Llamar al cliente X para seguimiento', completed: true, category: 'trabajo' },
    ]);

    // 2. ESTADO DE POMODORO (Necesario para que el resto del código funcione)
    const WORK_TIME = 1500; // 25 minutos en segundos
    const BREAK_TIME = 300; // 5 minutos en segundos
    const LONG_BREAK_TIME = 900; // 15 minutos en segundos

    const [pomodoroTime, setPomodoroTime] = useState(WORK_TIME);
    const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
    const [pomodoroMode, setPomodoroMode] = useState('work'); // 'work' o 'break'
    const [cycleCount, setCycleCount] = useState(0);

    // Lógica de `toggleTask` (Necesaria para manejar la lista de tareas)
    const toggleTask = (id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    // Lógica del Temporizador (Necesaria para que useEffect y los botones funcionen)
    useEffect(() => {
        let interval = null;

        if (isPomodoroRunning && pomodoroTime > 0) {
            interval = setInterval(() => {
                setPomodoroTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (pomodoroTime === 0) {
            clearInterval(interval);
            
            // Lógica para cambiar de modo cuando el tiempo se agota
            if (pomodoroMode === 'work') {
                const newCycleCount = cycleCount + 1;
                setCycleCount(newCycleCount);
                if (newCycleCount % 4 === 0) {
                    setPomodoroMode('long-break');
                    setPomodoroTime(LONG_BREAK_TIME);
                } else {
                    setPomodoroMode('break');
                    setPomodoroTime(BREAK_TIME);
                }
            } else {
                setPomodoroMode('work');
                setPomodoroTime(WORK_TIME);
            }
            setIsPomodoroRunning(true); // Opcional: Iniciar automáticamente el siguiente modo
        }

        return () => clearInterval(interval);
    }, [isPomodoroRunning, pomodoroTime, pomodoroMode, cycleCount]);
    
    // -------------------------------------------------------------
    // ESTAS ERAN LAS LÍNEAS QUE CAUSABAN EL ERROR, AHORA FUNCIONAN:
    const completedCount = tasks.filter(t => t.completed).length
    const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    // -------------------------------------------------------------

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const resetPomodoro = () => {
        setIsPomodoroRunning(false)
        setPomodoroTime(WORK_TIME) // Usa la constante WORK_TIME
        setPomodoroMode('work')
        setCycleCount(0);
    }
    
    // Simulación de iniciales de usuario (ej. Juan Pérez = JP)
    const userInitials = "JP"; 

    return (
        // ... (El resto del código JSX es correcto) ...
        <div className="dashboard-container">
            {/* ... Todo el SVG, Header, Grid Principal, etc. ... */}

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

            {/* Grid Principal */}
            <div className="dashboard-grid">
                {/* Pomodoro Timer */}
                <div className="card pomodoro-card">
                    <h2>Pomodoro Timer</h2>
                    <div className={`timer ${pomodoroMode}`}>
                        <div className="timer-display">{formatTime(pomodoroTime)}</div>
                        <span className="timer-label">{pomodoroMode === 'work' ? 'Tiempo de Trabajo' : pomodoroMode === 'break' ? 'Descanso Corto' : 'Descanso Largo'}</span>
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
            
            {/* Tareas del Día */}
            <div className="card tasks-card">
                <h2>Tareas de Hoy</h2>
                <div className="tasks-list">
                    {/* El mapeo de tareas ya es correcto, solo se necesitaba la variable 'tasks' */}
                    {tasks.map(task => (
                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <div className="task-checkbox">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)} // Llama a la función 'toggleTask'
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
        </div>
    )
}

export default Dashboard