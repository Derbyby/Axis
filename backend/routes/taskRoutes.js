// backend/routes/taskRoutes.js

const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Asegúrate de que la ruta sea correcta
const User = require('../models/User'); // Asegúrate de que la ruta sea correcta

// 1. OBTENER TODAS LAS TAREAS DE UN USUARIO (GET /api/tasks/:userId)
// Usado por fetchData en el frontend
router.get('/:userId', async (req, res) => {
    try {
        // En una app real, usarías req.user.id (token de autenticación)
        const tasks = await Task.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tareas', error: error.message });
    }
});

// 2. AGREGAR UNA NUEVA TAREA (POST /api/tasks)
// Usado por handleNewTask en el frontend
router.post('/', async (req, res) => {
    try {
        // req.body debe contener: user, titulo, prioridad, etc.
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear tarea', error: error.message });
    }
});

// 3. ACTUALIZAR TAREA Y MANEJAR GAMIFICACIÓN (PATCH /api/tasks/toggle/:taskId)
// Usado por toggleTask en el frontend
router.patch('/toggle/:taskId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

        const wasCompleted = task.completado;
        task.completado = !wasCompleted;
        const updatedTask = await task.save();

        // Solo aplicamos gamificación si la tarea se acaba de COMPLETAR (no al desmarcar)
        if (task.completado) {
            
            // 3.1. Lógica de Puntos
            await User.findByIdAndUpdate(task.user, { $inc: { puntos: 10 } });
            
            // 3.2. Lógica de Racha
            const user = await User.findById(task.user);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (user.ultimaCompletada) {
                const lastCompleted = new Date(user.ultimaCompletada);
                lastCompleted.setHours(0, 0, 0, 0);

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);

                // Si la última completada fue HOY, no hacemos nada con la racha.
                if (lastCompleted.getTime() !== today.getTime()) {
                     // Si fue ayer, incrementa la racha
                    if (lastCompleted.getTime() === yesterday.getTime()) {
                        user.racha = (user.racha || 0) + 1;
                    } else {
                        // Racha rota (no fue ayer ni hoy), empieza de nuevo
                        user.racha = 1;
                    }
                }
            } else {
                user.racha = 1; // Primera tarea completada en la vida del usuario
            }
            
            user.ultimaCompletada = Date.now();
            await user.save();
        }

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar tarea y stats', error: error.message });
    }
});

module.exports = router;