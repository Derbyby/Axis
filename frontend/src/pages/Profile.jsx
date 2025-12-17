import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/api';
import '../styles/Profile.css'; // Asegúrate de actualizar este CSS en el siguiente paso

function Profile() {
    const { user, logout, updateUserLocal } = useAuth();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado para el MODAL (Edición completa)
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: ''
    });

    // Estado para la EDICIÓN RÁPIDA DE NOMBRE (El lápiz ✎)
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    // Cargar datos del usuario en el formulario cuando cambia el usuario
    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // --- LÓGICA DE GAMIFICACIÓN ---
    const currentPoints = user?.puntos || 0;
    const level = Math.floor(currentPoints / 100) + 1;
    const pointsInCurrentLevel = currentPoints % 100;
    const progressPercent = (pointsInCurrentLevel / 100) * 100;

    const badges = [
        { id: 1, icon: '🚀', name: 'Primeros Pasos', desc: 'Creaste tu cuenta', unlocked: true },
        { id: 2, icon: '🔥', name: 'En Racha', desc: 'Racha de 3 días', unlocked: (user?.racha >= 3) },
        { id: 3, icon: '💯', name: 'Centurión', desc: 'Conseguiste 100 puntos', unlocked: (currentPoints >= 100) },
        { id: 4, icon: '🧘', name: 'Mente Zen', desc: 'Completaste 5 Pomodoros', unlocked: false },
    ];

    // --- MANEJO DE CIERRE DE SESIÓN ---
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // --- MANEJO DE EDICIÓN RÁPIDA (NOMBRE) ---
    const startEditingName = () => {
        setTempName(user?.nombre || '');
        setIsEditingName(true);
    };

    const cancelEditingName = () => {
        setIsEditingName(false);
        setTempName('');
    };

    const saveName = async () => {
        if (!tempName.trim()) return;
        try {
            const updatedUser = await dataService.updateUser(user._id || user.id, { nombre: tempName });
            updateUserLocal(updatedUser);
            setIsEditingName(false);
        } catch (error) {
            console.error("Error al actualizar nombre", error);
            alert("Error al actualizar nombre");
        }
    };

    // --- MANEJO DEL MODAL (FORMULARIO COMPLETO) ---
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updatedUser = await dataService.updateUser(user._id || user.id, formData);
            updateUserLocal(updatedUser);
            
            setIsEditing(false); // Cerramos modal
            alert("Perfil actualizado correctamente");
        } catch (error) {
            console.error(error);
            alert("Error al guardar perfil");
        } finally {
            setIsLoading(false);
        }
    };
    // ---------------------------------------------

    const userInitials = user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : "US";

    return (
        <div className="profile-container">
            {/* Navegación */}
            <div className="profile-nav">
                <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
            </div>

            <div className="profile-card">
                {/* CABECERA DEL PERFIL (FOTO + NOMBRE) */}
                <div className="profile-header-center" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div className="profile-avatar-large" style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2a9d8f', color: 'white',
                        fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto'
                    }}>
                        {userInitials}
                    </div>

                    <div className="name-container">
                        {isEditingName ? (
                            <div className="inline-edit-box" style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                <input 
                                    type="text" 
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="name-input"
                                    autoFocus
                                    style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                                />
                                <button onClick={saveName} className="btn-icon save" title="Guardar">✓</button>
                                <button onClick={cancelEditingName} className="btn-icon cancel" title="Cancelar">✕</button>
                            </div>
                        ) : (
                            <h1 className="profile-name">
                                {user?.nombre || 'Usuario'}
                                <span onClick={startEditingName} className="edit-pen" title="Editar nombre" style={{ cursor: 'pointer', marginLeft: '10px', fontSize: '1rem', color: '#888' }}>
                                    ✎
                                </span>
                            </h1>
                        )}
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{user?.email}</p>
                    </div>
                </div>

                {/* BARRA DE EXPERIENCIA */}
                <div className="xp-section">
                    <div className="xp-info">
                        <span>Nivel <strong>{level}</strong></span>
                        <span className="xp-values">{pointsInCurrentLevel} / 100 XP</span>
                    </div>
                    <div className="xp-bar-bg">
                        <div
                            className="xp-bar-fill"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="xp-next">Faltan {100 - pointsInCurrentLevel} puntos para el nivel {level + 1}</p>
                </div>

                {/* ESTADÍSTICAS */}
                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-emoji">💎</span>
                        <h3>{currentPoints}</h3>
                        <p>Puntos Totales</p>
                    </div>
                    <div className="stat-box">
                        <span className="stat-emoji">🔥</span>
                        <h3>{user?.racha || 0}</h3>
                        <p>Días de Racha</p>
                    </div>
                    <div className="stat-box">
                        <span className="stat-emoji">📅</span>
                        <h3>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</h3>
                        <p>Miembro desde</p>
                    </div>
                </div>

                <hr className="divider" />

                {/* MEDALLAS */}
                <div className="badges-section">
                    <h2>Mis Medallas</h2>
                    <div className="badges-grid">
                        {badges.map(badge => (
                            <div key={badge.id} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                                <div className="badge-icon">{badge.icon}</div>
                                <div className="badge-info">
                                    <h4>{badge.name}</h4>
                                    <p>{badge.desc}</p>
                                </div>
                                {!badge.unlocked && <div className="lock-overlay">🔒</div>}
                            </div>
                        ))}
                    </div>
                </div>

                <hr className="divider" />

                {/* ACCIONES */}
                <div className="account-actions">
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>⚙️ Editar Perfil Completo</button>
                    <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            </div>

            {/* MODAL DE EDICIÓN - VENTANA EMERGENTE */}
            {isEditing && (
                <div className="modal-overlay"> {/* Fondo oscuro que cubre toda la pantalla */}
                    <div className="modal"> {/* El contenedor de la ventana emergente */}
                        <h2>Editar Perfil</h2>
                        <form onSubmit={handleSaveProfile}>
                            <label>
                                Nombre
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isLoading} className="btn-primary">
                                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;