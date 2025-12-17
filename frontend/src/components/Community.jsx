import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Community.css'; 

function Community() {
    const { user } = useAuth();
    
    // --- ESTADOS ---
    const [ranking, setRanking] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]); 
    const [friends, setFriends] = useState([]); 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]); 
    const [loading, setLoading] = useState(true);

    // --- CARGAR DATOS AL INICIO ---
    useEffect(() => {
        const loadData = async () => {
            try {
                // Hacemos 3 peticiones al mismo tiempo para ser rápidos
                const [rankingData, requestsData, friendsData] = await Promise.all([
                    dataService.getRanking().catch(err => []), // Si falla el ranking, no rompe lo demás
                    dataService.getFriendRequests(),
                    dataService.getFriends()
                ]);
                
                setRanking(rankingData || []);
                setFriendRequests(requestsData || []);
                setFriends(friendsData || []);
            } catch (error) {
                console.error("Error cargando datos sociales:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- 1. BUSCAR USUARIOS ---
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            const results = await dataService.searchUser(searchTerm.trim());
            setSearchResults(results);
        } catch (error) {
            console.error("Error al buscar:", error);
            alert("Error al buscar usuario");
        }
    };

    // --- 2. ENVIAR SOLICITUD ---
    const handleAddFriend = async (friendId) => {
        try {
            await dataService.sendFriendRequest(friendId);
            alert("¡Solicitud enviada! 📨");
            
            // Truco visual: Quitamos al usuario de la búsqueda para no darle click 2 veces
            setSearchResults(prev => prev.filter(u => u._id !== friendId));
        } catch (error) {
            alert(error.message || "No se pudo enviar solicitud");
        }
    };

    // --- 3. ACEPTAR SOLICITUD ---
    const handleAcceptRequest = async (requesterId) => {
        try {
            await dataService.acceptFriendRequest(requesterId);
            alert("¡Ahora son amigos! 🤝");
            
            // Actualizamos la pantalla sin recargar
            // 1. Buscamos quién era el amigo en la lista de solicitudes
            const newFriend = friendRequests.find(req => req._id === requesterId);
            
            // 2. Lo quitamos de pendientes
            setFriendRequests(prev => prev.filter(req => req._id !== requesterId));
            
            // 3. Lo agregamos a la lista de amigos
            if(newFriend) setFriends(prev => [...prev, newFriend]);

        } catch (error) {
            console.error("Error al aceptar:", error);
            alert("Error al aceptar solicitud");
        }
    };

    if (loading) return <div className="community-container"><h1>Cargando comunidad...</h1></div>;

    return (
        <div className="community-container">
            <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
            <h1 style={{ color: '#d97706' }}>Comunidad & Amigos</h1>

            <div className="community-grid-layout">
                
                {/* COLUMNA IZQUIERDA: Búsqueda y Solicitudes */}
                <div className="left-column">
                    
                    {/* SECCIÓN DE SOLICITUDES (Solo visible si hay pendientes) */}
                    {friendRequests.length > 0 && (
                        <div className="card requests-card">
                            <h2 style={{ color: '#d97706' }}>🔔 Solicitudes ({friendRequests.length})</h2>
                            <div className="requests-list">
                                {friendRequests.map(req => (
                                    <div key={req._id} className="request-item">
                                        <div>
                                            <strong>{req.nombre}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Nivel {req.nivel || 1}</div>
                                        </div>
                                        <button 
                                            onClick={() => handleAcceptRequest(req._id)}
                                            className="btn-accept"
                                        >
                                            Aceptar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN DE BÚSQUEDA */}
                    <div className="card search-card">
                        <h2>🔍 Buscar Amigos</h2>
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit">Buscar</button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="search-results-list">
                                {searchResults.map(resUser => (
                                    <div key={resUser._id} className="result-item">
                                        <div>
                                            <strong>{resUser.nombre}</strong>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{resUser.email}</div>
                                        </div>
                                        
                                        {/* Lógica inteligente de botones */}
                                        {friends.some(f => f._id === resUser._id) ? (
                                            <span className="badge-friend">✅ Amigo</span>
                                        ) : (
                                            <button onClick={() => handleAddFriend(resUser._id)} className="btn-add">
                                                + Agregar
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchTerm && searchResults.length === 0 && (
                            <p style={{ marginTop: '10px', color: '#888', textAlign: 'center' }}>No se encontraron usuarios.</p>
                        )}
                    </div>

                    {/* SECCIÓN: MIS AMIGOS */}
                    <div className="card friends-card">
                        <h2>👥 Mis Amigos ({friends.length})</h2>
                        {friends.length === 0 ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Aún no tienes amigos agregados.</p>
                        ) : (
                            <div className="friends-list">
                                {friends.map(friend => (
                                    <div key={friend._id} className="friend-item">
                                        <div className="friend-avatar">
                                            {friend.nombre.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="friend-info">
                                            <strong>{friend.nombre}</strong>
                                            <div className="friend-stats">
                                                <span>🔥 {friend.racha || 0}</span>
                                                <span>⭐ {friend.puntos || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Ranking */}
                <div className="right-column">
                    <div className="card ranking-card">
                        <h2>🏆 Top 10 Global</h2>
                        <div className="ranking-list">
                            {ranking.length > 0 ? (
                                ranking.map((item, index) => (
                                    <div key={item._id} className={`ranking-item rank-${index + 1}`}>
                                        <span className="rank-number">#{index + 1}</span>
                                        <div className="rank-user">
                                            <strong>{item.nombre}</strong>
                                            <small>{item.puntos} pts</small>
                                        </div>
                                        {index === 0 && <span>👑</span>}
                                        {index === 1 && <span>🥈</span>}
                                        {index === 2 && <span>🥉</span>}
                                    </div>
                                ))
                            ) : (
                                <p>Cargando ranking...</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Community;