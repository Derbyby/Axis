import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/api'; // <--- Usamos dataService

function ResetPassword() {
    const { token } = useParams(); 
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Llamamos a la función del servicio
            await dataService.resetPassword(token, password);
            
            alert('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Error: El enlace es inválido o ha expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'Segoe UI, sans-serif' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Nueva Contraseña</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="password" 
                        placeholder="Escribe tu nueva contraseña" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength="6"
                        style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;