// src/components/Community.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Community.css'; // Crear este archivo CSS

function Community() {
    const { user } = useAuth();
    const [ranking, setRanking] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar el ranking al inicio
        const loadRanking = async () => {
            try {
                const data = await dataService.getRanking();
                setRanking(data);
            } catch (error) {
                console.error("Error al cargar ranking:", error);
            } finally {
                setLoading(false);
            }
        };
        loadRanking();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchResult(null);
        if (!searchTerm.trim()) return;

        try {
            const result = await dataService.searchUser(searchTerm.trim());
            setSearchResult(result);
        } catch (error) {
            console.error("Error al buscar usuario:", error);
            setSearchResult({ message: error.message });
        }
    };

    const handleAddFriend = (friendId) => {
        alert(`Implementar lógica para enviar solicitud a ${friendId}`);
        // Aquí llamarías a dataService.addFriend(friendId) si existiera.
    };
    
    // Si no está cargando, muestra la interfaz.
    if (loading) return <div className="community-container"><h1>Cargando comunidad...</h1></div>;

    return (
        <div className="community-container">
            <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
            <h1>Comunidad & Ranking</h1>

            {/* SECCIÓN DE BÚSQUEDA */}
            <div className="card search-card">
                <h2>Buscar Amigos</h2>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="email"
                        placeholder="Email del amigo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        required
                    />
                    <button type="submit">Buscar</button>
                </form>

                {searchResult && (
                    <div className="search-result">
                        {searchResult.message ? (
                            <p style={{ color: 'red' }}>{searchResult.message}</p>
                        ) : (
                            <div className="result-card">
                                <div>
                                    <h4>{searchResult.nombre} (Nvl {searchResult.nivel || '?'})</h4>
                                    <p>{searchResult.email}</p>
                                </div>
                                <button onClick={() => handleAddFriend(searchResult._id)}>
                                    + Agregar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SECCIÓN DE RANKING */}
            <div className="card ranking-card">
                <h2>🏆 Top 10 Global (Puntos)</h2>
                <div className="ranking-list">
                    {ranking.length > 0 ? (
                        ranking.map((item, index) => (
                            <div key={item._id} className="ranking-item">
                                <span className="rank-number">{index + 1}.</span>
                                <span className="rank-name">{item.nombre}</span>
                                <span className="rank-points">⭐ {item.puntos}</span>
                            </div>
                        ))
                    ) : (
                        <p>No hay datos de ranking disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Community;