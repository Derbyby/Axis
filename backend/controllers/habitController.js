// backend/controllers/habitController.js
const Habit = require('../models/habit'); //
const User = require('../models/user');
const { getTodayStart, getYesterdayStart } = require('../utils/dateUtils'); // Importar utilidad

// ... (getHabits y createHabit se mantienen) ...

// @desc    Actualizar hábito (marcar completado, cambiar nombre)
// @route   PUT /api/habits/:id
// @access  Privado
const updateHabit = async (req, res) => {
    const habit = await Habit.findById(req.params.id); //

    if (!habit) {
        res.status(404);
        throw new Error('Hábito no encontrado');
    }

    const user = await User.findById(req.user.id);

    // 1. Verificar autorización y propiedad
    if (!user || habit.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    const { completed } = req.body;
    const today = getTodayStart();
    const yesterday = getYesterdayStart();
    const points = 5; // Puntos por hábito completado

    let updatedHabit = habit;
    let pointsChange = 0;
    let userStats = user; // Objeto a devolver

    if (completed !== undefined) {
        // --- LÓGICA DE RACHAS INDIVIDUALES ---
        const isCompletedToday = habit.fechasCompletadas.some(date => new Date(date) >= today);
        
        if (completed && !isCompletedToday) {
            // Marcar como completado: Sumar racha y puntos
            habit.fechasCompletadas.push(new Date());
            habit.rachaActual += 1;
            habit.rachaMasLarga = Math.max(habit.rachaMasLarga, habit.rachaActual);
            pointsChange = points;

        } else if (!completed && isCompletedToday) {
            // Desmarcar como completado: Restar racha y puntos
            
            // Eliminamos la última entrada que sea de hoy
            habit.fechasCompletadas = habit.fechasCompletadas.filter(date => new Date(date) < today);

            // Recalcular rachaActual
            let currentStreak = 0;
            let currentDay = getTodayStart();

            // Esto es una simplificación; la lógica completa de racha es compleja,
            // pero para revertir, simplemente restamos 1 y confiamos en que 
            // la lógica de `getHabits` o la siguiente actualización de racha
            // la corregirá al inicio del siguiente día.
            habit.rachaActual = Math.max(0, habit.rachaActual - 1); 
            pointsChange = -points;
        }

        // --- LÓGICA DE RACHA GLOBAL Y PUNTOS DEL USUARIO ---
        if (pointsChange !== 0) {
            user.puntos += pointsChange;
            user.nivel = Math.floor(user.puntos / 100) + 1;

            // Lógica de Racha Global (Solo se actualiza si sumamos puntos)
            if (pointsChange > 0) {
                const lastCompletion = user.ultimaCompletada ? new Date(user.ultimaCompletada) : null;
                
                // Si la última completada fue ayer, incrementamos la racha.
                if (lastCompletion && lastCompletion >= yesterday && lastCompletion < today) {
                    user.racha += 1;
                } 
                // Si la última completada fue hoy, no pasa nada (ya se contó).
                else if (!lastCompletion || lastCompletion < today) {
                    // Si no ha completado nada hoy (o nunca), empieza/reinicia en 1.
                    user.racha = 1; 
                }
                user.ultimaCompletada = new Date();
            }
            
            // Guardamos el usuario actualizado
            userStats = await user.save();
        }

        // Guardamos el hábito actualizado (con nueva racha)
        updatedHabit = await habit.save();
    }
    
    // Si hay otros campos en req.body (ej. cambiar nombre), los actualizamos.
    if (Object.keys(req.body).some(key => key !== 'completed')) {
        updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }

    // Devolvemos el hábito actualizado Y los stats del usuario
    res.status(200).json({
        ...updatedHabit.toObject(),
        userStats: userStats.toObject() // Enviamos los stats actualizados
    });
};

// ... (deleteHabit se mantiene) ...

module.exports = {
    getHabits, //
    createHabit, //
    updateHabit,
    deleteHabit, //
};