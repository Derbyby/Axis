import React, { useState } from 'react';
import { dataService } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Profile.css'; // Reutilizamos los estilos generales

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
            await dataService.forgotPassword(email);
            setMessage('Si el correo existe, recibirás un enlace de recuperación en unos momentos.');
        } catch (err) {
            console.error(err);
            setError('Hubo un problema al enviar la solicitud. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="profile-card" style={{ maxWidth: '400px', width: '100%', padding: '30px', textAlign: 'center' }}>
                <h2 className="profile-name" style={{ marginBottom: '10px' }}>Recuperar Cuenta</h2>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Ingresa tu correo y te enviaremos instrucciones.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="name-input"
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>

                {message && <div style={{ marginTop: '15px', padding: '10px', background: '#e6fffa', color: '#047857', borderRadius: '5px', fontSize: '0.9rem' }}>{message}</div>}
                {error && <div style={{ marginTop: '15px', padding: '10px', background: '#fff5f5', color: '#c53030', borderRadius: '5px', fontSize: '0.9rem' }}>{error}</div>}

                <div style={{ marginTop: '20px' }}>
                    <Link to="/login" className="back-link">← Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
