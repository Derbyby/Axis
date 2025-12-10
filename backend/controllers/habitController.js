const Habit = require('../models/habit');

// @desc    Obtener hábitos del usuario logueado
// @route   GET /api/habits
// @access  Privado
const getHabits = async (req, res) => {
    // Magia: req.user.id viene del middleware que acabamos de crear
    const habits = await Habit.find({ user: req.user.id });
    res.status(200).json(habits);
};

// @desc    Crear un nuevo hábito
// @route   POST /api/habits
// @access  Privado
const createHabit = async (req, res) => {
    if (!req.body.nombre) {
        res.status(400);
        throw new Error('Por favor escribe el nombre del hábito');
    }

    const habit = await Habit.create({
        nombre: req.body.nombre,
        user: req.user.id, // Asignamos el hábito al dueño
        frecuencia: req.body.frecuencia || 'diario',
        categoria: req.body.categoria || 'General'
    });

    res.status(200).json(habit);
};

// @desc    Actualizar hábito (marcar completado, cambiar nombre)
// @route   PUT /api/habits/:id
// @access  Privado
const updateHabit = async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(400);
        throw new Error('Hábito no encontrado');
    }

    // Verificar que el usuario sea el dueño del hábito
    if (!req.user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }
    // Convertimos a string para comparar
    if (habit.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedHabit);
};

// @desc    Borrar hábito
// @route   DELETE /api/habits/:id
// @access  Privado
const deleteHabit = async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(400);
        throw new Error('Hábito no encontrado');
    }

    if (habit.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    await habit.deleteOne();
    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit,
};