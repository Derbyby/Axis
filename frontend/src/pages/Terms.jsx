import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Terms.css';

function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="terms-container">
            <div className="terms-box">
                <header className="terms-header">
                    <h1>Términos y Condiciones</h1>
                    <p className="subtitle">Última actualización: Diciembre 2025</p>
                </header>

                <div className="terms-content">
                    <section>
                        <h2>1. Aceptación de los Términos</h2>
                        <p>Al crear una cuenta en <strong>Axis</strong>, aceptas cumplir con estos términos de servicio, todas las leyes y regulaciones aplicables.</p>
                    </section>

                    <section>
                        <h2>2. Uso del Servicio</h2>
                        <p>Axis es una plataforma diseñada para la gestión de hábitos y tareas personales. Te comprometes a usar la aplicación de manera responsable y a no realizar actividades que puedan comprometer la seguridad de otros usuarios.</p>
                    </section>

                    <section>
                        <h2>3. Privacidad y Datos</h2>
                        <p>Tu privacidad es nuestra prioridad. Los datos personales como nombre y correo electrónico se utilizan exclusivamente para la funcionalidad de la cuenta y no serán compartidos con terceros sin tu consentimiento.</p>
                    </section>

                    <section>
                        <h2>4. Responsabilidad</h2>
                        <p>Axis no se hace responsable por la pérdida de datos derivada de un uso inadecuado o fallos técnicos ajenos a nuestra infraestructura principal.</p>
                    </section>
                </div>

                <div className="terms-footer">
                    <button 
                        className="btn-back" 
                        onClick={() => navigate('/register')}
                    >
                        Volver al Registro
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TermsPage;