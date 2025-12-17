import React, { useState } from 'react';
import { dataService } from '../services/api'; // <--- CORRECCIÓN: Usamos dataService
import { Link } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // Usamos la nueva función que creamos en api.js
            await dataService.forgotPassword(email);
            setMessage('Si el correo existe, recibirás un enlace de recuperación en unos momentos.');
        } catch (err) {
            // Por seguridad, a veces es mejor mostrar el mismo mensaje, 
            // pero para depurar mostraremos el error real si existe.
            console.error(err);
            setError('Hubo un problema al enviar la solicitud. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'Segoe UI, sans-serif' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Recuperar Cuenta</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>Ingresa tu correo y te enviaremos instrucciones.</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Ingresa tu correo" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>

                {message && <div style={{ marginTop: '15px', padding: '10px', background: '#e6fffa', color: '#047857', borderRadius: '5px', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
                
                {error && <div style={{ marginTop: '15px', padding: '10px', background: '#fff5f5', color: '#c53030', borderRadius: '5px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '600' }}>Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;