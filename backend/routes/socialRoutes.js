// backend/routes/socialRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');

// 1. OBTENER RANKING GLOBAL (Ranking por Puntos)
router.get('/ranking', protect, async (req, res) => {
    try {
        // Obtenemos los 10 usuarios con más puntos
        const leaderboard = await User.find()
            .sort({ puntos: -1 }) // Ordena de mayor a menor
            .limit(10)
            .select('nombre puntos nivel'); 
        
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el ranking', error: error.message });
    }
});

// 2. BUSCAR AMIGOS (Buscar por email)
router.get('/search', protect, async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Se requiere el email para buscar.' });
    }

    try {
        // Buscar por email, excluyendo al usuario actual
        const foundUser = await User.findOne({ email: email })
            .select('nombre email _id puntos');

        if (!foundUser || foundUser._id.toString() === req.user.id) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(foundUser);
    } catch (error) {
        res.status(500).json({ message: 'Error en la búsqueda.', error: error.message });
    }
});

// NOTA: Para implementar la lógica completa de solicitudes de amistad (enviar, aceptar), 
// deberías añadir un campo adicional 'solicitudesPendientes' al modelo User. 
// Para simplificar, asumiremos que solo quieres mostrar un ranking por ahora.

module.exports = router;