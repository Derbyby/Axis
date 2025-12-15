const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // CORRECCIÓN 1: Usamos 'titulo' (Español) para coincidir con tu Frontend y Ruta
    titulo: { type: String, required: true }, 
    
    descripcion: { type: String },
    
    prioridad: { 
        type: String, 
        enum: ['Alta', 'Media', 'Baja'], 
        default: 'Media' 
    },
    
    fechaLimite: { type: Date },
    
    // CORRECCIÓN 2: Usamos 'completed' (Inglés) para coincidir con React y los checkbox
    completed: { type: Boolean, default: false },
    
    esRecurrente: { type: Boolean, default: false },
    patronRecurrencia: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);