const express = require('express');
const router = express.Router();
const Habit = require('../models/habit'); 
const User = require('../models/user.js');
const { protect } = require('../middleware/authMiddleware');

// 1. OBTENER MIS HÁBITOS (GET /api/habits)
router.get('/', protect, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(habits);
    } catch (error) {
        console.error("Error al obtener hábitos:", error);
        res.status(500).json({ message: 'Error al obtener hábitos', error: error.message });
    }
});

// 2. AGREGAR NUEVO HÁBITO (POST /api/habits)
router.post('/', protect, async (req, res) => {
    try {
        console.log("Creando hábito:", req.body);

        const newHabit = new Habit({
            user: req.user.id,
            nombre: req.body.nombre,
            
            // --- CORRECCIÓN CRÍTICA 1 ---
            frecuencia: req.body.frecuencia || 'diario', 
            
            categoria: req.body.categoria || 'General',
            completed: false,
            fechasCompletadas: [],
            rachaActual: 0,
            rachaMaxima: 0
        });

        const savedHabit = await newHabit.save();
        res.status(201).json(savedHabit);
    } catch (error) {
        console.error("ERROR BACKEND HÁBITOS:", error.message);
        res.status(400).json({ message: 'Error al crear hábito', error: error.message });
    }
});

// 3. ACTUALIZAR (CHECK) Y GAMIFICACIÓN (PUT /api/habits/:id)
router.put('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Hábito no encontrado' });
        }

        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // Lógica de cambio de estado (Check/Uncheck)
        if (req.body.completed !== undefined) {
            const wasCompleted = habit.completed;
            const isNowCompleted = req.body.completed;
            
            habit.completed = isNowCompleted;

            // --- CORRECCIÓN CRÍTICA 2 ---
            // Antes guardabas el número en 'habit.frecuencia' (que es texto).
            // AHORA guardamos en 'habit.rachaActual' (que es número).
            
            if (isNowCompleted && !wasCompleted) {
                // SUMAR (Check)
                habit.rachaActual = (habit.rachaActual || 0) + 1;
                
                // Actualizar récord de racha
                if (habit.rachaActual > (habit.rachaMaxima || 0)) {
                    habit.rachaMaxima = habit.rachaActual;
                }

                // Sumar PUNTOS al usuario
                await User.findByIdAndUpdate(req.user.id, { $inc: { puntos: 5 } });
            
            } else if (!isNowCompleted && wasCompleted) {
                // RESTAR (Uncheck - error humano)
                habit.rachaActual = Math.max(0, (habit.rachaActual || 0) - 1);
                
                // Restar PUNTOS
                await User.findByIdAndUpdate(req.user.id, { $inc: { puntos: -5 } });
            }
        }

        // Si quisieras editar el texto del hábito o la frecuencia real
        if (req.body.nombre) habit.nombre = req.body.nombre;
        if (req.body.frecuencia) habit.frecuencia = req.body.frecuencia;

        await habit.save();
        res.status(200).json(habit);

    } catch (error) {
        console.error("Error al actualizar hábito:", error);
        res.status(500).json({ message: 'Error al actualizar hábito', error: error.message });
    }
});

// 4. ELIMINAR HÁBITO (DELETE /api/habits/:id)
router.delete('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) return res.status(404).json({ message: 'No encontrado' });
        if (habit.user.toString() !== req.user.id) return res.status(401).json({ message: 'No autorizado' });

        await habit.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        console.error("Error al borrar hábito:", error);
        res.status(500).json({ message: 'Error al borrar hábito' });
    }
});

module.exports = router;