// backend/models/user.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    nombre: { type: String, required: true }, //
    email: { type: String, required: true, unique: true }, //
    password: { type: String, required: true }, //
    
    // Gamificación
    puntos: { type: Number, default: 0 }, //
    nivel: { type: Number, default: 1 }, //

    // --- NUEVO: Rachas Globales ---
    racha: { type: Number, default: 0 },
    ultimaCompletada: { type: Date, default: null },
    // -----------------------------

    // Lista de Amigos
    friends: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    friendRequests: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    
    preferencias: {
        tema: { type: String, enum: ['claro', 'oscuro'], default: 'claro' } //
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);