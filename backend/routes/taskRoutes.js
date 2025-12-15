const express = require('express');
const router = express.Router();
const Task = require('../models/task'); 
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware'); // <--- IMPORTANTE: Traemos la seguridad

// 1. OBTENER MIS TAREAS (GET /api/tasks)
// El 'protect' ya descifra quién es el usuario y lo guarda en req.user.id
router.get('/', protect, async (req, res) => {
    try {
        // Buscamos SOLO las tareas del usuario logueado
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tareas', error: error.message });
    }
});

// 2. AGREGAR NUEVA TAREA (POST /api/tasks)
router.post('/', protect, async (req, res) => {
    try {
        // Imprimimos qué está llegando para depurar
        console.log("Recibido en Backend:", req.body); 

        const newTask = new Task({
            user: req.user.id,
            titulo: req.body.titulo,  // <--- AHORA AMBOS SON 'title'
            prioridad: req.body.prioridad || 'Media',
            completed: false
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("ERROR EN BACKEND:", error.message); // <--- AHORA SÍ SALDRÁ EN TERMINAL
        res.status(400).json({ message: 'Error al crear tarea', error: error.message });
    }
});

// 3. ACTUALIZAR (CHECK) Y GAMIFICACIÓN (PUT /api/tasks/:id)
// Nota: Cambié PATCH por PUT para asegurar compatibilidad, pero ambos sirven.
// OJO: La ruta ahora es solo /:id, porque en index.js ya dice /api/tasks
router.route('/:id').put(protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        // Verificar que la tarea sea del usuario logueado
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // Cambiar estado
        const wasCompleted = task.completed; // Ojo: en tu modelo puede ser 'completed' o 'completado', revisa eso. Usaré 'completed' por el frontend.
        task.completed = !wasCompleted; 
        
        // Si tu modelo usa 'completado' en español, cambia la línea de arriba a: task.completado = !task.completado;

        await task.save();

        // --- ZONA DE GAMIFICACIÓN ---
        if (task.completed) { // Si se acaba de completar
            // Sumar puntos
            await User.findByIdAndUpdate(req.user.id, { $inc: { puntos: 10 } });

            // Calcular Racha (Tu lógica estaba muy bien, la mantengo)
            const user = await User.findById(req.user.id);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (user.ultimaCompletada) {
                const lastCompleted = new Date(user.ultimaCompletada);
                lastCompleted.setHours(0, 0, 0, 0);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastCompleted.getTime() === yesterday.getTime()) {
                    user.racha = (user.racha || 0) + 1; // Fue ayer, sigue la racha
                } else if (lastCompleted.getTime() !== today.getTime()) {
                    user.racha = 1; // Se rompió la racha
                }
            } else {
                user.racha = 1; // Primera vez
            }

            user.ultimaCompletada = Date.now();
            await user.save();
        }
        // ---------------------------

        res.status(200).json(task);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
});

// Ruta para borrar (DELETE /api/tasks/:id)
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'No encontrada' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'No autorizado' });

        await task.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Error al borrar' });
    }
});

module.exports = router;