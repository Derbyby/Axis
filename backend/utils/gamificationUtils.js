// backend/utils/gamificationUtils.js
const User = require('../models/user');
const { getTodayStart } = require('../routes/habitRoutes'); // Reusa el helper de fecha

const updateGlobalStreakAndPoints = async (userId, pointsChange) => {
    const user = await User.findById(userId);
    if (!user) return null;

    // --- LÓGICA DE PUNTOS ---
    user.puntos = (user.puntos || 0) + pointsChange;
    user.nivel = Math.floor(user.puntos / 100) + 1;

    // Solo si estamos SUMANDO PUNTOS (Completando una acción)
    if (pointsChange > 0) {
        const today = getTodayStart();
        
        // 1. Calcular Días de diferencia
        let lastCompleted = null;
        if (user.ultimaCompletada) {
            lastCompleted = new Date(user.ultimaCompletada);
            lastCompleted.setHours(0, 0, 0, 0);
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastCompleted && lastCompleted.getTime() === today.getTime()) {
            // Ya completó algo hoy, no hace nada con la racha
        } else if (lastCompleted && lastCompleted.getTime() === yesterday.getTime()) {
            // Completó ayer, CONTINÚA la racha
            user.racha = (user.racha || 0) + 1;
        } else if (lastCompleted && lastCompleted.getTime() < yesterday.getTime()) {
            // Se rompió la racha o fue hace más de un día, REINICIA
            user.racha = 1;
        } else {
             // Es la primera vez
            user.racha = 1; 
        }

        // Actualizar la fecha y récord de racha
        if (!lastCompleted || lastCompleted.getTime() !== today.getTime()) {
             user.ultimaCompletada = Date.now();
        }
        if (user.racha > user.rachaMasLarga) {
            user.rachaMasLarga = user.racha;
        }
    }
    
    // Si la acción es DESMARCAR (-puntos), solo restamos puntos, no ajustamos la racha de forma compleja.
    
    const savedUser = await user.save();
    return savedUser;
};

module.exports = { updateGlobalStreakAndPoints };