const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    titulo: { type: String, required: true },
    descripcion: { type: String },
    
    // Prioridades (Punto 2: Alta, Media, Baja)
    prioridad: { 
        type: String, 
        enum: ['Alta', 'Media', 'Baja'], 
        default: 'Media' 
    },
    
    fechaLimite: { type: Date }, // Scheduling
    
    completado: { type: Boolean, default: false },
    
    // Opcional: Para tareas recurrentes
    esRecurrente: { type: Boolean, default: false },
    patronRecurrencia: { type: String } // Ej: "cada lunes"

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);