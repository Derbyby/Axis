const mongoose = require('mongoose');

const habitSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    nombre: { type: String, required: true }, // Ej: "Beber agua"
    categoria: { type: String, default: 'General' }, // Ej: Salud, Estudio
    
    // Configuración de frecuencia
    frecuencia: { 
        type: String, 
        enum: ['diario', 'semanal', 'personalizado'], 
        default: 'diario' 
    },
    
    // El corazón del calendario y las rachas (Punto 1)
    // Guardamos un arreglo con todas las fechas que se completó
    fechasCompletadas: [{ type: Date }], 
    
    rachaActual: { type: Number, default: 0 },
    rachaMasLarga: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);