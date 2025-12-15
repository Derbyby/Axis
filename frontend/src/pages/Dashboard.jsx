import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    // --- HOOKS DE AUTENTICACIÓN ---
    // [IMPORTANTE] Necesitamos updateUserLocal para sincronizar los puntos.
    const { user, updateUserLocal } = useAuth(); 

    // --- ESTADOS DE DATOS ---
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]); // Inicializado como vacío para cargar desde la API

    // --- ESTADOS DE FORMULARIOS ---
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Media');
    const [loading, setLoading] = useState(true);

    // --- ESTADO PARA PUNTOS LOCALES ---
    const [puntosSesion, setPuntosSesion] = useState(0);

    // --- CÁLCULO DE NIVEL ---
    const totalPoints = (user?.puntos || 0) + puntosSesion;
    const userLevel = Math.floor(totalPoints / 100) + 1;

    // --- NUEVA FUNCIÓN: SINCRONIZAR PUNTOS Y RACHA GLOBAL ---
    // Llama al backend para actualizar los puntos del usuario y su racha global.
    const syncUserPoints = async (pointsChange) => {
        if (!user || !user._id) return;

        try {
            // Calculamos los nuevos puntos totales y enviamos la actualización
            const newPoints = user.puntos + pointsChange;
            
            // Asumiendo que dataService.updateUser llama a PUT /api/users/:id que actualiza los puntos
            // y posiblemente la racha global.
            const updatedUser = await dataService.updateUser(user._id, { puntos: newPoints });

            // Actualiza el contexto/localStorage de React con el objeto completo
            updateUserLocal(updatedUser); 
            
            // Reinicia puntosSesion ya que los puntos están en user.puntos
            setPuntosSesion(0);

        } catch (error) {
            console.error("Error sincronizando puntos:", error);
            // El manejo de revertir la UI ya está en toggleTask/toggleHabit.
        }
    }


    // --- 1. EFECTO PARA CARGAR DATOS (TAREAS Y HÁBITOS) AL INICIO ---
    useEffect(() => {
        const loadData = async () => {
            try {
                // [CORRECCIÓN] Cargar Tareas y Hábitos del backend
                const [loadedTasks, loadedHabits] = await Promise.all([
                    dataService.getTasks(),
                    dataService.getHabits() 
                ]);
                
                setTasks(loadedTasks);
                setHabits(loadedHabits);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- FUNCIÓN PARA CREAR TAREA (CONECTADA A API) ---
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const nuevaTarea = await dataService.createTask({
                titulo: newTaskTitle,
                prioridad: newTaskPriority,
                category: 'General'
            });
            setTasks([...tasks, nuevaTarea]);
            setNewTaskTitle('');
            setNewTaskPriority('Media');
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };

    // --- FUNCIÓN PARA CREAR HÁBITO (CONECTADA A API) ---
    const handleAddHabit = async (e) => { // Debe ser async
        e.preventDefault();
        if (!newHabitTitle.trim()) return;

        try {
            // [CORRECCIÓN] Llama al backend con el campo 'nombre'
            const habitData = { nombre: newHabitTitle }; 
            const savedHabitResponse = await dataService.createHabit(habitData);

            // Ajustamos el objeto para el estado local, asumiendo campos de UI
            const newHabitForState = {
                ...savedHabitResponse,
                completed: false, // Asumimos que al crear no está completado hoy
                rachaActual: 0,   // Usamos el nombre del campo del esquema de Mongoose
            };
            
            setHabits([...habits, newHabitForState]);
            setNewHabitTitle('');
        } catch (error) {
            console.error("Error al crear hábito:", error);
            alert("No se pudo guardar el hábito.");
        }
    };

    // --- NUEVA FUNCIÓN: ELIMINAR HÁBITO (CONECTADA A API) ---
    const handleDeleteHabit = async (id) => { // Debe ser async
        if (window.confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
            try {
                // [CORRECCIÓN] Usamos el ID de Mongoose (_id) y llamamos al backend
                await dataService.deleteHabit(id);
                setHabits(prev => prev.filter(h => h._id !== id));
            } catch (error) {
                console.error("Error eliminando hábito:", error);
            }
        }
    };

    // --- NUEVA FUNCIÓN: ELIMINAR TAREA (CONECTADA A API) ---
    const handleDeleteTask = async (id) => {
        if (window.confirm('¿Borrar esta tarea?')) {
            try {
                await dataService.deleteTask(id);
                setTasks(prev => prev.filter(t => t._id !== id));
            } catch (error) {
                console.error("Error al eliminar tarea:", error);
            }
        }
    };

    // --- HELPERS (INTACTOS) ---
    const getPointsByPriority = (prioridad) => {
        switch (prioridad) {
            case 'Alta': return 30;
            case 'Media': return 20;
            case 'Baja': return 10;
            default: return 10;
        }
    };

    const getPriorityColor = (p) => {
        if (p === 'Alta') return '#e63946';
        if (p === 'Media') return '#f4a261';
        return '#2a9d8f';
    };

    // --- LOGICA MARCAR TAREA (CONECTADA A API) ---
    const toggleTask = async (id) => { // Debe ser async
        const taskFound = tasks.find(t => t._id === id);
        if(!taskFound) return;
        
        const isCompleting = !taskFound.completed;
        const points = getPointsByPriority(taskFound.prioridad || 'Media');
        const pointsChange = isCompleting ? points : -points;
        
        // Optimistic UI: Actualizar estado y puntos locales
        setTasks(prevTasks => prevTasks.map(task => {
                if (task._id === id) {
                    return { ...task, completed: isCompleting };
                }
                return task;
            })
        );
        setPuntosSesion(prev => prev + pointsChange);

        try {
            // 1. Llama al backend para actualizar la tarea
            const updatedTaskResponse = await dataService.updateTask(id, { completed: isCompleting });
            
            // 2. Sincroniza los puntos y racha global
            if (updatedTaskResponse.userStats) {
                updateUserLocal(updatedTaskResponse.userStats);
                setPuntosSesion(0); // Reinicia el buffer si la sincronización fue exitosa
            } else {
                await syncUserPoints(pointsChange);
            }

        } catch (error) {
            console.error("Error actualizando tarea", error);
            // Revertir UI y puntos de sesión si el backend falla
            setTasks(prevTasks => prevTasks.map(t => t._id === id ? { ...t, completed: !isCompleting } : t));
            setPuntosSesion(prev => prev - pointsChange);
            alert("Error al actualizar tarea.");
        }
    };

    // --- LOGICA MARCAR HÁBITO (CONECTADA A API) ---
    const toggleHabit = async (id) => { // Debe ser async
        const habitFound = habits.find(h => h._id === id); // Usamos _id
        if (!habitFound) return;

        const newCompleted = !habitFound.completed;
        const points = 5; 
        const pointsChange = newCompleted ? points : -points;
        
        // Optimistic UI: Actualizar estado y puntos locales
        setHabits(prevHabits => prevHabits.map(habit => {
                if (habit._id === id) {
                    return { 
                        ...habit, 
                        completed: newCompleted,
                        // El cálculo de racha REAL se hace en el backend, esto es solo UI
                        rachaActual: newCompleted ? habit.rachaActual + 1 : habit.rachaActual 
                    };
                }
                return habit;
            })
        );
        setPuntosSesion(prev => prev + pointsChange);

        try {
            // 1. Llama al backend para actualizar el hábito
            const updatedHabitResponse = await dataService.updateHabit(id, { completed: newCompleted });
            
            // 2. Sincroniza los puntos y racha global
            if (updatedHabitResponse.userStats) {
                updateUserLocal(updatedHabitResponse.userStats);
                setPuntosSesion(0);
            } else {
                await syncUserPoints(pointsChange);
            }

            // Opcional: Si el backend devolvió el objeto actualizado, lo usamos para la racha
            setHabits(prev => prev.map(h => 
                h._id === id ? { ...h, rachaActual: updatedHabitResponse.rachaActual || h.rachaActual } : h
            ));

        } catch (error) {
            console.error("Error actualizando hábito:", error);
            // Revertir UI y puntos de sesión si el backend falla
            setHabits(prevHabits => prevHabits.map(h => h._id === id ? { ...h, completed: !newCompleted } : h));
            setPuntosSesion(prev => prev - pointsChange);
            alert("Error al actualizar hábito.");
        }
    };


    // --- LÓGICA DEL POMODORO (INTACTA) ---
    const WORK_TIME = 1500;
    const BREAK_TIME = 300;
    const LONG_BREAK_TIME = 900;
    const [pomodoroTime, setPomodoroTime] = useState(WORK_TIME);
    const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
    const [pomodoroMode, setPomodoroMode] = useState('work');
    const [cycleCount, setCycleCount] = useState(0);

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

    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    
    const resetPomodoro = () => {
        setIsPomodoroRunning(false);
        setPomodoroTime(WORK_TIME);
        setPomodoroMode('work');
        setCycleCount(0);
    };

    const userInitials = user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : "US";

    if (loading) return <div className="dashboard-container"><h1>Cargando tus datos...</h1></div>;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Hola, {user?.nombre || 'Viajero'} 👋</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <p className="date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <span style={{
                            backgroundColor: '#FFD700',
                            color: '#000',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem'
                        }}>
                            Nvl {userLevel}
                        </span>
                    </div>
                </div>

                <Link to="/profile" className="profile-link" title="Ir a Perfil">
                    <div className="profile-btn">
                        {userInitials}
                    </div>
                </Link>
            </div>

            {/* Stats Rápidos */}
            <div className="quick-stats">
                <div className="stat-card">
                    <span className="stat-icon">🔥</span>
                    <div>
                        <p className="stat-value">{user?.racha || 0}</p>
                        <p className="stat-name">Racha Actual</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⭐</span>
                    <div>
                        <p className="stat-value">{totalPoints}</p>
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
                {/* Pomodoro */}
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

                {/* SECCIÓN: HÁBITOS */}
                <div className="card habits-card">
                    <h2>Hábitos Diarios</h2>

                    {/* FORMULARIO AGREGAR HÁBITO */}
                    <form onSubmit={handleAddHabit} style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: '15px',
                        marginBottom: '10px'
                    }}>
                        <input
                            type="text"
                            placeholder="Nuevo hábito..."
                            value={newHabitTitle}
                            onChange={(e) => setNewHabitTitle(e.target.value)}
                            style={{
                                flex: '1',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '0.95rem',
                                outline: 'none',
                                backgroundColor: '#ffffff',
                                color: '#333'
                            }}
                        />
                        <button type="submit" style={{
                            backgroundColor: '#2a9d8f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            width: '45px',
                            height: '45px',
                            flexShrink: 0,
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0'
                        }}>+</button>
                    </form>

                    {/* LISTA CON SCROLL */}
                    <div className="habits-list" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginTop: '15px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        paddingRight: '5px'
                    }}>
                        {habits.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>Agrega un hábito para empezar</p>
                        ) : (
                            habits.map(habit => (
                                <div key={habit._id} className="habit-item" style={{ // Usamos habit._id
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px',
                                    backgroundColor: habit.completed ? '#e8f5e9' : '#f9f9f9',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    flexShrink: 0
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={habit.completed}
                                            onChange={() => toggleHabit(habit._id)} // Usamos habit._id
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{
                                            textDecoration: habit.completed ? 'line-through' : 'none',
                                            color: habit.completed ? '#888' : '#333'
                                        }}>
                                            {habit.nombre || habit.title} {/* Usamos habit.nombre */}
                                        </span>
                                    </div>
                                    
                                    {/* CONTENEDOR DERECHO: Racha + Botón Borrar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#ff9f1c' }}>🔥 {habit.rachaActual || 0}</span>
                                        <button 
                                            onClick={() => handleDeleteHabit(habit._id)} // Usamos habit._id
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                opacity: 0.6
                                            }}
                                            title="Eliminar hábito"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', textAlign: 'center' }}>
                        +5 pts por hábito
                    </p>
                </div>
            </div>

            {/* Tareas del Día */}
            <div className="dashboard-grid">
                <div className="card tasks-card">
                    <h2>Tareas de Hoy</h2>

                    <form onSubmit={handleCreateTask} style={{
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        <input
                            type="text"
                            placeholder="Nueva tarea..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            style={{
                                flex: '2',
                                minWidth: '120px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '0.95rem',
                                outline: 'none',
                                backgroundColor: '#ffffff',
                                color: '#333'
                            }}
                        />
                        <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
                            style={{
                                flex: '1',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                cursor: 'pointer',
                                backgroundColor: '#f9f9f9',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        >
                            <option value="Baja">🟢 Baja</option>
                            <option value="Media">🟠 Media</option>
                            <option value="Alta">🔴 Alta</option>
                        </select>

                        <button type="submit" style={{
                            backgroundColor: '#6A994E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            width: '45px',
                            height: '45px',
                            padding: '12px',
                            aspectRatio: '1 / 1',
                            lineHeight: '1',
                            flexShrink: 0,
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>+</button>
                    </form>

                    <div className="tasks-list">
                        {tasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                <p style={{ fontSize: '1.2rem' }}>🎉</p>
                                <p>¡No tienes tareas pendientes!</p>
                            </div>
                        ) : (
                            [...tasks].sort((a, b) => {
                                if (a.completed === b.completed) return 0;
                                return a.completed ? 1 : -1;
                            }).map(task => (
                                <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}
                                    style={{ borderLeft: `5px solid ${getPriorityColor(task.prioridad || 'Media')}` }}>
                                    
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span className={`task-category category-${task.category || 'trabajo'}`}>
                                                {task.category || 'General'}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                backgroundColor: '#eee',
                                                color: '#555'
                                            }}>
                                                {task.prioridad || 'Media'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* CONTENEDOR DERECHO: Puntos + Botón Borrar */}
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'flex-end', 
                                        gap: '5px' 
                                    }}>
                                        {!task.completed && (
                                            <div style={{ fontSize: '0.8rem', color: '#6A994E', fontWeight: 'bold' }}>
                                                +{getPointsByPriority(task.prioridad || 'Media')} pts
                                            </div>
                                        )}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita que clickar en borrar marque la tarea
                                                handleDeleteTask(task._id);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                opacity: 0.6,
                                                color: '#e63946'
                                            }}
                                            title="Eliminar tarea"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;