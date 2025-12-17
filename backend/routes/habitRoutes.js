const express = require('express');
const router = express.Router();
const Habit = require('../models/habit'); 
const User = require('../models/user.js');
const { protect } = require('../middleware/authMiddleware');

// Función auxiliar para saber si es el mismo día
const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

// Función auxiliar para saber si es la misma semana (Lunes a Domingo)
const isSameWeek = (d1, d2) => {
    // Ajustamos al lunes previo de cada fecha
    const getMonday = (d) => {
        const date = new Date(d);
        const day = date.getDay(); 
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuste al lunes
        return new Date(date.setDate(diff)).setHours(0,0,0,0);
    }
    return getMonday(d1) === getMonday(d2);
};

// 1. OBTENER MIS HÁBITOS (CON AUTO-RESET)
router.get('/', protect, async (req, res) => {
    try {
        let habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
        const hoy = new Date();
        const diaSemanaHoy = hoy.getDay(); // 0-6

        // REVISAR SI HAY QUE RESETEAR ALGÚN HÁBITO
        const updates = habits.map(async (habit) => {
            if (!habit.completed || !habit.ultimaCompletada) return habit; // Si no está completado, no hay nada que resetear

            const ultimaFecha = new Date(habit.ultimaCompletada);
            let debeResetear = false;

            if (habit.frecuencia === 'Diario') {
                // Si la última vez no fue HOY, resetear
                if (!isSameDay(ultimaFecha, hoy)) debeResetear = true;
            } 
            else if (habit.frecuencia === 'Semanal') {
                // Si la última vez no fue ESTA SEMANA, resetear
                if (!isSameWeek(ultimaFecha, hoy)) debeResetear = true;
            } 
            else if (habit.frecuencia === 'Personalizada') {
                // Si es personalizada, se comporta como diario (se resetea al día siguiente)
                // Pero además, verificamos si HOY toca hacerlo.
                if (!isSameDay(ultimaFecha, hoy)) debeResetear = true;
            }

            if (debeResetear) {
                habit.completed = false;
                await habit.save(); // Guardamos el cambio en BD
            }
            return habit;
        });

        // Esperamos a que se revisen todos
        await Promise.all(updates);

        // Volvemos a pedir los hábitos ya limpios para enviarlos al front
        // (O podríamos devolver el array modificado, pero esto es más seguro)
        habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json(habits);
    } catch (error) {
        console.error("Error al obtener hábitos:", error);
        res.status(500).json({ message: 'Error al obtener hábitos', error: error.message });
    }
});

/// 2. AGREGAR NUEVO HÁBITO
router.post('/', protect, async (req, res) => {
    try {
        const newHabit = new Habit({
            user: req.user.id,
            nombre: req.body.nombre,
            // Guardamos la frecuencia que viene del front
            frecuencia: req.body.frecuencia || 'Diario',
            diasMeta: req.body.diasMeta || [], // Array de días si es personalizada
            completed: false,
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

        // --- LÓGICA DE CHECK/UNCHECK ---
        if (req.body.completed !== undefined) {
            const wasCompleted = habit.completed;
            const isNowCompleted = req.body.completed; // <--- ¡AQUÍ ESTÁ LA VARIABLE QUE FALTABA!
            
            habit.completed = isNowCompleted;

            if (isNowCompleted && !wasCompleted) {
                // --> SE MARCÓ COMO COMPLETADO (CHECK)
                habit.rachaActual = (habit.rachaActual || 0) + 1;
                habit.ultimaCompletada = new Date(); // Guardamos la fecha de hoy para el reinicio automático
                
                // Actualizar récord de racha
                if (habit.rachaActual > (habit.rachaMaxima || 0)) {
                    habit.rachaMaxima = habit.rachaActual;
                }

                // Sumar PUNTOS al usuario
                await User.findByIdAndUpdate(req.user.id, { $inc: { puntos: 5 } });
            
            } else if (!isNowCompleted && wasCompleted) {
                // --> SE DESMARCÓ (UNCHECK - Error humano)
                habit.rachaActual = Math.max(0, (habit.rachaActual || 0) - 1);
                
                // Restar PUNTOS
                await User.findByIdAndUpdate(req.user.id, { $inc: { puntos: -5 } });
            }
        }

        // Actualizar otros campos si vienen en la petición
        if (req.body.nombre) habit.nombre = req.body.nombre;
        if (req.body.frecuencia) habit.frecuencia = req.body.frecuencia;
        if (req.body.diasMeta) habit.diasMeta = req.body.diasMeta;

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