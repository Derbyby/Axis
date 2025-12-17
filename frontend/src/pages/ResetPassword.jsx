import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/api';
import '../styles/ResetPassword.css';

function ResetPassword() {
    const { token } = useParams(); 
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dataService.resetPassword(token, password);
            alert('¡Contraseña actualizada con éxito!');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Error: El enlace es inválido o ha expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-box">
                <div className="reset-header">
                    <div className="logo-icon">✓</div>
                    <h2>Nueva Contraseña</h2>
                    <p className="subtitle">Asegura tu cuenta con una clave nueva</p>
                </div>

                <form onSubmit={handleSubmit} className="reset-form">
                    <div className="form-group">
                        <label>Contraseña Nueva</label>
                        <input 
                            type="password" 
                            placeholder="Mínimo 6 caracteres" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength="6"
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="reset-button"
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;