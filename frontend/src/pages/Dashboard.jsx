import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    // --- HOOKS DE AUTENTICACIÓN ---
    const { user, updateUserLocal } = useAuth(); 
    const navigate = useNavigate();

    // --- ESTADOS DE DATOS ---
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]); 
    
    // [NUEVO] Estado para solicitudes de amistad
    const [friendRequests, setFriendRequests] = useState([]); 

    // --- ESTADOS DE UI ---
    const [showNotifications, setShowNotifications] = useState(false); // [NUEVO] Panel notificaciones
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE FORMULARIOS ---
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [frecuencia, setFrecuencia] = useState('Diario'); 
    const [diasSeleccionados, setDiasSeleccionados] = useState([]); 
    const [showHabitForm, setShowHabitForm] = useState(false); 
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Media');

    // --- ESTADO PARA PUNTOS LOCALES ---
    const [puntosSesion, setPuntosSesion] = useState(0);

    // --- CÁLCULO DE NIVEL ---
    const totalPoints = (user?.puntos || 0) + puntosSesion;
    const userLevel = Math.floor(totalPoints / 100) + 1;

    // --- SINCRONIZAR PUNTOS ---
    const syncUserPoints = async (pointsChange) => {
        if (!user || !user._id) return;
        try {
            const newPoints = user.puntos + pointsChange;
            const updatedUser = await dataService.updateUser(user._id, { puntos: newPoints });
            updateUserLocal(updatedUser); 
            setPuntosSesion(0);
        } catch (error) {
            console.error("Error sincronizando puntos:", error);
        }
    }

    // --- 1. EFECTO PARA CARGAR DATOS ---
    // --- 1. EFECTO PARA CARGAR DATOS (Y SINCRONIZAR PUNTOS) ---
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Preparamos las peticiones
                const promises = [
                    dataService.getTasks(),
                    dataService.getHabits(),
                    dataService.getFriendRequests()
                ];

                // 2. Si tenemos usuario, pedimos también sus stats actualizados
                if (user && user._id) {
                    promises.push(dataService.getUserStats(user._id));
                }

                // 3. Esperamos todas las respuestas
                const results = await Promise.all(promises);
                
                const loadedTasks = results[0];
                const loadedHabits = results[1];
                const loadedRequests = results[2];
                const userStats = results[3]; // Aquí vienen los puntos reales (155)

                // 4. Guardamos datos en el estado
                setTasks(loadedTasks);
                setHabits(loadedHabits);
                setFriendRequests(loadedRequests);

                // 5. ¡CORRECCIÓN DE PUNTOS! Actualizamos el usuario local
                if (userStats) {
                    // Fusionamos lo que teníamos con los nuevos puntos
                    updateUserLocal({ ...user, puntos: userStats.puntos, racha: userStats.racha });
                }

            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []); // Se ejecuta al cargar la página

    // --- CRUD TAREAS ---
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
        } catch (error) { console.error("Error al crear:", error); }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('¿Borrar esta tarea?')) {
            try {
                await dataService.deleteTask(id);
                setTasks(prev => prev.filter(t => t._id !== id));
            } catch (error) { console.error("Error al eliminar tarea:", error); }
        }
    };

    // --- CRUD HÁBITOS ---
    const handleAddHabit = async (e) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;
        try {
            const habitData = { 
                nombre: newHabitTitle,
                frecuencia: frecuencia,
                diasMeta: frecuencia === 'Personalizada' ? diasSeleccionados : [] 
            };
            const savedHabitResponse = await dataService.createHabit(habitData);
            
            const newHabitForState = {
                ...savedHabitResponse,
                completed: false, 
                rachaActual: 0,
            };
            setHabits([...habits, newHabitForState]);
            setNewHabitTitle('');
            setFrecuencia('Diario');
            setDiasSeleccionados([]);
            setShowHabitForm(false);
        } catch (error) {
            console.error("Error al crear hábito:", error);
            alert("No se pudo guardar el hábito.");
        }
    };

    const handleDeleteHabit = async (id) => { 
        if (window.confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
            try {
                await dataService.deleteHabit(id);
                setHabits(prev => prev.filter(h => h._id !== id));
            } catch (error) { console.error("Error eliminando hábito:", error); }
        }
    };

    // Helper para seleccionar días
    const toggleDia = (diaIndex) => {
        if (diasSeleccionados.includes(diaIndex)) {
            setDiasSeleccionados(diasSeleccionados.filter(d => d !== diaIndex));
        } else {
            setDiasSeleccionados([...diasSeleccionados, diaIndex]);
        }
    };

    // --- HELPERS PRIORIDAD ---
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

    // --- TOGGLES (Check/Uncheck) ---
    const toggleTask = async (id) => { 
        const taskFound = tasks.find(t => t._id === id);
        if(!taskFound) return;
        
        const isCompleting = !taskFound.completed;
        const points = getPointsByPriority(taskFound.prioridad || 'Media');
        const pointsChange = isCompleting ? points : -points;
        
        setTasks(prevTasks => prevTasks.map(task => {
                if (task._id === id) return { ...task, completed: isCompleting };
                return task;
            })
        );
        setPuntosSesion(prev => prev + pointsChange);

        try {
            const updatedTaskResponse = await dataService.updateTask(id, { completed: isCompleting });
            if (updatedTaskResponse.userStats) {
                updateUserLocal(updatedTaskResponse.userStats);
                setPuntosSesion(0);
            } else {
                await syncUserPoints(pointsChange);
            }
        } catch (error) {
            console.error("Error actualizando tarea", error);
            setTasks(prevTasks => prevTasks.map(t => t._id === id ? { ...t, completed: !isCompleting } : t));
            setPuntosSesion(prev => prev - pointsChange);
            alert("Error al actualizar tarea.");
        }
    };

    const toggleHabit = async (id) => { 
        const habitFound = habits.find(h => h._id === id); 
        if (!habitFound) return;

        const newCompleted = !habitFound.completed;
        const points = 5; 
        const pointsChange = newCompleted ? points : -points;
        
        setHabits(prevHabits => prevHabits.map(habit => {
                if (habit._id === id) {
                    return { 
                        ...habit, 
                        completed: newCompleted,
                        rachaActual: newCompleted ? habit.rachaActual + 1 : habit.rachaActual 
                    };
                }
                return habit;
            })
        );
        setPuntosSesion(prev => prev + pointsChange);

        try {
            const updatedHabitResponse = await dataService.updateHabit(id, { completed: newCompleted });
            if (updatedHabitResponse.userStats) {
                updateUserLocal(updatedHabitResponse.userStats);
                setPuntosSesion(0);
            } else {
                await syncUserPoints(pointsChange);
            }
            // Actualizar racha real del backend
            setHabits(prev => prev.map(h => 
                h._id === id ? { ...h, rachaActual: updatedHabitResponse.rachaActual || h.rachaActual } : h
            ));
        } catch (error) {
            console.error("Error actualizando hábito:", error);
            setHabits(prevHabits => prevHabits.map(h => h._id === id ? { ...h, completed: !newCompleted } : h));
            setPuntosSesion(prev => prev - pointsChange);
            alert("Error al actualizar hábito.");
        }
    };

    // --- POMODORO ---
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

    // --- [NUEVO] CÁLCULO DE NOTIFICACIONES ---
    const hoyIndex = new Date().getDay(); 
    const horaActual = new Date().getHours();
    const esTarde = horaActual >= 18; // 6:00 PM o más tarde

    const habitosPendientes = habits.filter(h => {
        if (h.completed) return false;
        if (h.frecuencia === 'Diario') return true;
        if (h.frecuencia === 'Semanal') return true; 
        if (h.frecuencia === 'Personalizada' && h.diasMeta?.includes(hoyIndex)) return true;
        return false;
    }).length;

    const tareasPendientes = tasks.filter(t => !t.completed).length;
    const solicitudesPendientes = friendRequests.length;
    const totalNotificaciones = habitosPendientes + tareasPendientes + solicitudesPendientes;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Hola, {user?.nombre || 'Viajero'} 👋</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <p className="date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <span style={{
                            backgroundColor: '#FFD700', color: '#000', padding: '2px 8px',
                            borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem'
                        }}>
                            Nvl {userLevel}
                        </span>
                    </div>
                </div>

                {/* --- HEADER ACTIONS: COMUNIDAD - NOTIFICACIONES - PERFIL --- */}
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    
                    {/* 1. COMUNIDAD */}
                    <button 
                        onClick={() => navigate('/community')}
                        className="btn-community"
                        
                    >
                        🏆 Comunidad
                    </button>

                    {/* 2. [NUEVO] NOTIFICACIONES */}
                    <div className="notification-container">
                        <button 
                            className="notification-btn" 
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            🔔
                            {totalNotificaciones > 0 && (
                                <span className="badge">{totalNotificaciones}</span>
                            )}
                        </button>

                        {/* Menú Desplegable */}
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <h3>Notificaciones {esTarde ? '🌙' : '☀️'}</h3>
                                {totalNotificaciones === 0 ? (
                                    <p style={{ color: '#888', padding: '10px' }}>¡Todo al día! 🎉</p>
                                ) : (
                                    <>
                                        {/* Mensaje de Tarde */}
                                        {esTarde && (habitosPendientes > 0 || tareasPendientes > 0) && (
                                            <div style={{ padding: '8px', background: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '10px', fontSize: '0.85rem' }}>
                                                ⚠️ <strong>¡Cierra el día!</strong> Completa tus pendientes antes de dormir.
                                            </div>
                                        )}

                                        {/* Solicitudes */}
                                        {solicitudesPendientes > 0 && (
                                            <div className="notification-item" onClick={() => navigate('/community')} style={{ cursor: 'pointer', background: '#e6fffa' }}>
                                                📩 Tienes <strong>{solicitudesPendientes}</strong> solicitud(es) de amistad.
                                            </div>
                                        )}

                                        {/* Hábitos */}
                                        {habitosPendientes > 0 && (
                                            <div className="notification-item">
                                                💪 Te faltan <strong>{habitosPendientes}</strong> hábitos hoy.
                                            </div>
                                        )}
                                        {/* Tareas */}
                                        {tareasPendientes > 0 && (
                                            <div className="notification-item">
                                                📝 Tienes <strong>{tareasPendientes}</strong> tareas pendientes.
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. PERFIL */}
                    <Link to="/profile" className="profile-link" title="Ir a Perfil">
                        <div className="profile-btn">{userInitials}</div>
                    </Link>
                </div>
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

                    {/* FORMULARIO AGREGAR HÁBITO (ESTILO ORIGINAL) */}
                    <div>
                        <input
                            className='habit-input'
                            type="text"
                            placeholder="Nuevo hábito..."
                            value={newHabitTitle}
                            onChange={(e) => setNewHabitTitle(e.target.value)}
                        />

                        {/* Selector de Frecuencia */}
                        <div className='frecuency-selector'>
                            {['Diario', 'Semanal', 'Personalizada'].map(tipo => (
                                <button
                                    key={tipo}
                                    type="button"
                                    onClick={() => setFrecuencia(tipo)}
                                    style={{
                                        padding: '5px 10px', borderRadius: '20px', border: 'none',
                                        fontSize: '0.8rem', cursor: 'pointer',
                                        backgroundColor: frecuencia === tipo ? '#6a994e' : '#e0e0e0',
                                        color: frecuencia === tipo ? 'white' : '#333', fontWeight: 'bold'
                                    }}
                                >
                                    {tipo}
                                </button>
                            ))}
                        </div>

                        {/* Selector de Días (Solo si es Personalizada) */}
                        {frecuencia === 'Personalizada' && (
                            <div className="days-selector">
                                {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((letra, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleDia(index)}
                                        style={{
                                            width: '30px', height: '30px', borderRadius: '50%',
                                            border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                            backgroundColor: diasSeleccionados.includes(index) ? '#fbbf6bff' : '#eee',
                                            color: diasSeleccionados.includes(index) ? 'white' : '#555',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        {letra}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleAddHabit}
                            className='btn-habit'
                        >
                            + Crear Hábito
                        </button>
                    </div>

                    {/* LISTA DE HÁBITOS */}
                    <div className="habits-list" style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', paddingRight: '5px' }}>
                        {habits.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>Agrega un hábito para empezar</p>
                        ) : (
                            habits.map(habit => (
                                <div key={habit._id} className="habit-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: habit.completed ? '#e8f5e9' : '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', flexShrink: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={habit.completed}
                                            onChange={() => toggleHabit(habit._id)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ textDecoration: habit.completed ? 'line-through' : 'none', color: habit.completed ? '#888' : '#333', fontWeight: '500', fontSize: '1rem' }}>
                                                {habit.nombre}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                                                {habit.frecuencia === 'Personalizada' && habit.diasMeta?.length > 0
                                                    ? habit.diasMeta.map(d => ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][d]).join(', ')
                                                    : habit.frecuencia || 'Diario'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#ff9f1c' }}>🔥 {habit.rachaActual || 0}</span>
                                        <button onClick={() => handleDeleteHabit(habit._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }} title="Eliminar hábito">🗑️</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', textAlign: 'center' }}>+5 pts por hábito</p>
                </div>
            </div>

            {/* Tareas del Día */}
            <div className="dashboard-grid">
                <div className="card tasks-card">
                    <h2>Tareas de Hoy</h2>
                    <form onSubmit={handleCreateTask} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
                        <input className="task-input" type="text" placeholder="Nueva tarea..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value) } />
                        <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} style={{ flex: '1', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#f9f9f9', fontSize: '0.95rem', outline: 'none' }}>
                            <option value="Baja">🟢 Baja</option>
                            <option value="Media">🟠 Media</option>
                            <option value="Alta">🔴 Alta</option>
                        </select>
                        <button type="submit" style={{ backgroundColor: '#6A994E', color: 'white', border: 'none', borderRadius: '8px', width: '45px', height: '45px', padding: '12px', aspectRatio: '1 / 1', lineHeight: '1', flexShrink: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </form>

                    <div className="tasks-list">
                        {tasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}><p style={{ fontSize: '1.2rem' }}>🎉</p><p>¡No tienes tareas pendientes!</p></div>
                        ) : (
                            [...tasks].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)).map(task => (
                                <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`} style={{ borderLeft: `5px solid ${getPriorityColor(task.prioridad || 'Media')}` }}>
                                    <div className="task-checkbox">
                                        <input type="checkbox" checked={task.completed || false} onChange={() => toggleTask(task._id)} id={`task-${task._id}`} />
                                        <label htmlFor={`task-${task._id}`}></label>
                                    </div>
                                    <div className="task-content">
                                        <p className="task-title">{task.titulo}</p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span className={`task-category category-${task.category || 'trabajo'}`}>{task.category || 'General'}</span>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#eee', color: '#555' }}>{task.prioridad || 'Media'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                        {!task.completed && (<div style={{ fontSize: '0.8rem', color: '#6A994E', fontWeight: 'bold' }}>+{getPointsByPriority(task.prioridad || 'Media')} pts</div>)}
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6, color: '#e63946' }} title="Eliminar tarea">🗑️</button>
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