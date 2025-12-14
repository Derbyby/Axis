import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <--- 1. Importamos el contexto del usuario
import { dataService } from '../services/api';     // <--- 2. Importamos el servicio de datos
import '../styles/Dashboard.css';

function Dashboard() {
    // --- HOOKS DE AUTENTICACIÓN ---
    const { user } = useAuth(); // Obtenemos el usuario real (con nombre, puntos, etc.)

    // --- ESTADOS DE DATOS REALES ---
    const [tasks, setTasks] = useState([]); // Empieza vacío, no con datos falsos
    // --- ESTADO PARA LA NUEVA TAREA ---
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // --- FUNCIÓN PARA CREAR TAREA ---
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const nuevaTarea = await dataService.createTask({
                titulo: newTaskTitle,
                prioridad: 'Media'
            });
            // Agregamos la nueva tarea a la lista que ya vemos
            setTasks([...tasks, nuevaTarea]);
            setNewTaskTitle(''); // Limpiamos el input
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };
    
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DEL POMODORO (Lógica de Yess intacta) ---
    const WORK_TIME = 1500;
    const BREAK_TIME = 300;
    const LONG_BREAK_TIME = 900;
    const [pomodoroTime, setPomodoroTime] = useState(WORK_TIME);
    const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
    const [pomodoroMode, setPomodoroMode] = useState('work');
    const [cycleCount, setCycleCount] = useState(0);

    // --- 3. EFECTO PARA CARGAR DATOS REALES DE MONGODB ---
    useEffect(() => {
        const loadData = async () => {
            try {
                // Pedimos las tareas al backend
                const misTareas = await dataService.getTasks();
                setTasks(misTareas);
            } catch (error) {
                console.error("Error cargando tareas:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Lógica para marcar tarea (Por ahora solo visual, falta endpoint en backend para 'update')
    const toggleTask = (id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task._id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    // --- LÓGICA DEL POMODORO (Intacta) ---
    useEffect(() => {
        let interval = null;
        if (isPomodoroRunning && pomodoroTime > 0) {
            interval = setInterval(() => setPomodoroTime(prev => prev - 1), 1000);
        } else if (pomodoroTime === 0) {
            clearInterval(interval);
            if (pomodoroMode === 'work') {
                const newCount = cycleCount + 1;
                setCycleCount(newCount);
                if (newCount % 4 === 0) {
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
            setIsPomodoroRunning(true);
        }
        return () => clearInterval(interval);
    }, [isPomodoroRunning, pomodoroTime, pomodoroMode, cycleCount]);

    // Cálculos de progreso
    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resetPomodoro = () => {
        setIsPomodoroRunning(false);
        setPomodoroTime(WORK_TIME);
        setPomodoroMode('work');
        setCycleCount(0);
    };

    // Obtener iniciales reales del usuario
    const userInitials = user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : "US";

    if (loading) return <div className="dashboard-container"><h1>Cargando tus datos...</h1></div>;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    {/* 4. NOMBRE REAL DEL USUARIO */}
                    <h1>Hola, {user?.nombre || 'Viajero'} 👋</h1>
                    <p className="date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <Link to="/profile" className="profile-link" title="Ir a Perfil">
                    <div className="profile-btn">
                        {userInitials}
                    </div>
                </Link>
            </div>

            {/* Stats Rápidos (CONECTADOS AL USUARIO REAL) */}
            <div className="quick-stats">
                <div className="stat-card">
                    <span className="stat-icon">🔥</span>
                    <div>
                        {/* Como aún no calculamos racha en backend, usamos un placeholder o 0 */}
                        <p className="stat-value">{user?.racha || 0}</p>
                        <p className="stat-name">Racha Actual</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⭐</span>
                    <div>
                        {/* 5. PUNTOS REALES DE LA BASE DE DATOS */}
                        <p className="stat-value">{user?.puntos || 0}</p>
                        <p className="stat-name">Puntos Totales</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📊</span>
                    <div>
                        <p className="stat-value">{Math.round(progressPercentage)}%</p>
                        <p className="stat-name">Cumplimiento</p>
                    </div>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="dashboard-grid">
                {/* Pomodoro (Igual) */}
                <div className="card pomodoro-card">
                    <h2>Pomodoro Timer</h2>
                    <div className={`timer ${pomodoroMode}`}>
                        <div className="timer-display">{formatTime(pomodoroTime)}</div>
                        <span className="timer-label">
                            {pomodoroMode === 'work' ? 'Tiempo de Trabajo' : 'Tiempo de Descanso'}
                        </span>
                    </div>
                    <div className="timer-controls">
                        <button className="btn-primary" onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}>
                            {isPomodoroRunning ? '⏸ Pausar' : '▶ Iniciar'}
                        </button>
                        <button className="btn-secondary" onClick={resetPomodoro}>
                            ↻ Reiniciar
                        </button>
                    </div>
                </div>

                {/* Progreso del Día (Visualmente igual, datos dinámicos) */}
                <div className="card progress-card">
                    <h2>Progreso del Día</h2>
                    <div className="progress-content">
                        <div className="progress-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="progress-background" />
                                <circle 
                                    cx="50" cy="50" r="45" className="progress-fill"
                                    style={{ strokeDasharray: `${(progressPercentage / 100) * 283} 283` }}
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

                {/* --- FORMULARIO --- */}
                <form onSubmit={handleCreateTask} style={{ 
                    marginBottom: '20px', 
                    display: 'flex', 
                    gap: '10px', 
                    alignItems: 'center',
                    width: '100%' // Asegura que el formulario ocupe todo el ancho disponible
                }}>
                    <input 
                        type="text" 
                        placeholder="Escribe aquí tu tarea..." 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        style={{
                            flex: '1',                // Intenta ocupar el espacio sobrante
                            minWidth: '200px',        // OBLIGATORIO: Mínimo 200px de ancho
                            padding: '12px',
                            borderRadius: '8px',
                            border: '2px solid #6A994E', // Borde verde para verlo bien
                            backgroundColor: '#FFFFFF',  // Fondo blanco puro
                            color: '#000000',            // Letra negra pura
                            fontSize: '16px',
                            outline: 'none'              // Quita el borde azul predeterminado
                        }}
                    />
                    <button 
                        type="submit" 
                        style={{
                            width: 'auto',            // OBLIGATORIO: Que solo ocupe lo necesario
                            flexShrink: '0',          // OBLIGATORIO: Prohibido encogerse o estirarse de más
                            backgroundColor: '#6A994E',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}
                    >
                        + Agregar
                    </button>
                </form>

                <div className="tasks-list">
                    {/* --- AQUÍ ESTÁ LA CONDICIÓN PARA EL MENSAJE --- */}
                    {tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            <p style={{ fontSize: '1.2rem' }}>🎉</p>
                            <p>¡No tienes tareas pendientes!</p>
                            <small>Agrega una arriba para empezar.</small>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                <div className="task-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={task.completed || false}
                                        onChange={() => toggleTask(task._id)}
                                        id={`task-${task._id}`}
                                    />
                                    <label htmlFor={`task-${task._id}`}></label>
                                </div>
                                <div className="task-content">
                                    <p className="task-title">{task.titulo}</p>
                                    <span className={`task-category category-${task.category || 'trabajo'}`}>
                                        {task.category || 'General'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;