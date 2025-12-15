const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Gamificación
    puntos: { type: Number, default: 0 },
    nivel: { type: Number, default: 1 },

    // --- CAMPOS DE RACHA AÑADIDOS ---
    racha: { type: Number, default: 0 }, // Días de racha actual
    rachaMasLarga: { type: Number, default: 0 }, // Récord
    ultimaCompletada: { type: Date, default: null }, // Fecha de la última acción completada para calcular la racha
    // ---------------------------------

    // --- Lista de Amigos ---
    amigos: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    // -----------------------------

    preferencias: {
        tema: { type: String, enum: ['claro', 'oscuro'], default: 'claro' }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);