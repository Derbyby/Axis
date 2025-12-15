const Task = require('../models/task'); 

// @desc    Obtener tareas del usuario
// @route   GET /api/tasks
const getTasks = async (req, res) => {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
};

// @desc    Crear tarea
// @route   POST /api/tasks
const createTask = async (req, res) => {
    if (!req.body.titulo) {
        res.status(400);
        throw new Error('Por favor escribe el título de la tarea');
    }

    const task = await Task.create({
        user: req.user.id,
        titulo: req.body.titulo,
        prioridad: req.body.prioridad || 'Media',
        fechaLimite: req.body.fechaLimite
    });

    res.status(200).json(task);
};

// @desc    Borrar tarea
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(400);
        throw new Error('Tarea no encontrada');
    }

    // Verificar dueño
    if (task.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('No autorizado');
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
};

module.exports = { getTasks, createTask, deleteTask };