const mongoose = require('mongoose');

const habitSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nombre: {
        type: String,
        required: [true, 'Por favor escribe el nombre del hábito']
    },
    // --- NUEVOS CAMPOS ---
    frecuencia: {
        type: String,
        enum: ['Diario', 'Semanal', 'Personalizada'],
        default: 'Diario'
    },
    diasMeta: {
        type: [Number], // 0=Domingo, 1=Lunes, ... 6=Sábado
        default: []     // Solo se usa si es Personalizada
    },
    ultimaCompletada: {
        type: Date, // Guardamos la fecha exacta del último check
        default: null
    },
    // ---------------------
    completed: { type: Boolean, default: false },
    categoria: { type: String, default: 'General' },
    rachaActual: { type: Number, default: 0 },
    rachaMaxima: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);