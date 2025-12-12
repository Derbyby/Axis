const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Gamificación (Punto 4 de tu lista)
    puntos: { type: Number, default: 0 },
    nivel: { type: Number, default: 1 },

    // Personalización (Punto 5 de tu lista)
    preferencias: {
        tema: { type: String, enum: ['claro', 'oscuro'], default: 'claro' },
        colorPrincipal: { type: String, default: '#blue' } // Opcional
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);