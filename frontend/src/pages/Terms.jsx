import React from 'react';
import { Link } from 'react-router-dom';

function Terms() {
    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Términos y Condiciones de Axis</h1>
            <p>Última actualización: Diciembre 2025</p>
            <hr />
            <h3>1. Uso de Datos</h3>
            <p>En Axis, nos tomamos tu privacidad en serio. Tus datos (correo, hábitos, tareas) se guardan en nuestra base de datos segura y no se comparten con terceros.</p>
            
            <h3>2. Responsabilidad</h3>
            <p>Axis es una herramienta de autogestión. No nos hacemos responsables si olvidas papear a tus alumnos por no revisar la app.</p>

            <Link to="/register" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#4F46E5', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                Volver al Registro
            </Link>
        </div>
    );
}

export default Terms;