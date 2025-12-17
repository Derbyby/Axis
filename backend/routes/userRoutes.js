// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/user.js'); 
const { forgotPassword, resetPassword } = require('../controllers/userController');

// 1. Registro y Login
router.post('/', registerUser);
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// --- [NUEVO] RUTA RANKING (TOP 10) ---
// ¡IMPORTANTE! Esta ruta debe ir ANTES de las rutas con :id
router.get('/ranking', async (req, res) => {
    try {
        // Busca todos los usuarios, ordénalos por puntos (mayor a menor) y toma los 10 primeros
        const topUsers = await User.find()
            .sort({ puntos: -1 }) 
            .limit(10)
            .select('nombre puntos nivel racha'); // Traemos solo lo necesario
        
        res.status(200).json(topUsers);
    } catch (error) {
        console.error("Error en ranking:", error);
        res.status(500).json({ message: 'Error al obtener ranking', error: error.message });
    }
});
// -------------------------------------

// 2. ACTUALIZAR PERFIL Y PUNTOS (PUT /api/users/:id)
router.put('/:id', protect, async (req, res) => {
    const userId = req.params.id; 
    const { puntos, racha, nombre, email } = req.body;

    try {
        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Seguridad: Asegurar que el usuario logueado sea el que está editando
        if (userToUpdate._id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado para editar este perfil' });
        }
        
        const updateFields = {};
        if (puntos !== undefined) updateFields.puntos = puntos;
        if (racha !== undefined) updateFields.racha = racha;
        if (nombre !== undefined) updateFields.nombre = nombre;
        if (email !== undefined) updateFields.email = email;

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
    }
});

// 3. OBTENER STATS (GET /api/users/stats/:userId)
router.get('/stats/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('puntos racha');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener stats', error: error.message });
    }
});

module.exports = router;