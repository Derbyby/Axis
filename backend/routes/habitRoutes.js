const express = require('express');
const router = express.Router();
const Habit = require('../models/habit'); // Asegúrate de tener el modelo Habit creado
const User = require('../models/user.js');
const { protect } = require('../middleware/authMiddleware');

// 1. OBTENER MIS HÁBITOS (GET /api/habits)
router.get('/', protect, async (req, res) => {
    try {
        // Buscamos SOLO los hábitos del usuario logueado
        const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener hábitos', error: error.message });
        console.error("Error al obtener hábitos:", error);
    }
});

// 2. AGREGAR NUEVO HÁBITO (POST /api/habits)
router.post('/', protect, async (req, res) => {
    try {
        console.log("Creando hábito:", req.body);

        const newHabit = new Habit({
            user: req.user.id,
            nombre: req.body.nombre,
            frecuencia: 0,
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
            console.error("Hábito no encontrado para ID:", req.params.id);
        }

        // Verificar autorización
        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado' });
            console.error("Usuario no autorizado para hábito ID:", req.params.id);
        }

        // Recibimos los datos del frontend (completed y streak)
        // Si el frontend ya calculó el streak, lo usamos. Si no, lo calculamos aquí.
        if (req.body.completed !== undefined) {
            const wasCompleted = habit.completed;
            const isNowCompleted = req.body.completed;
            
            habit.completed = isNowCompleted;

            // --- ZONA DE GAMIFICACIÓN ---
            if (isNowCompleted && !wasCompleted) {
                // 1. Sumar racha del hábito
                habit.frecuencia = (habit.streak || 0) + 1;
                
                // 2. Sumar PUNTOS al usuario (5 pts por hábito, según tu frontend)
                await User.findByIdAndUpdate(req.user.id, { $inc: { puntos: 5 } });
            
            } else if (!isNowCompleted && wasCompleted) {
                // Si se desmarca, restamos la racha y los puntos
                habit.frecuencia = Math.max(0, (habit.frecuencia || 0) - 1);
                await User.findByIdAndUpdate(req.user.id, { $inc: { puntos: -5 } });
            }
            
            // Si el frontend mandó el streak explícitamente, lo respetamos (opcional)
            if (req.body.frecuencia !== undefined) {
                habit.frecuencia = req.body.frecuencia;
            }
        }

        await habit.save();
        res.status(200).json(habit);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar hábito', error: error.message });
        console.error("Error al actualizar hábito:", error);
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
        res.status(500).json({ message: 'Error al borrar hábito' });
        console.error("Error al borrar hábito:", error);
    }
});

module.exports = router;