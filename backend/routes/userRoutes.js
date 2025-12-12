// backend/routes/userRoutes.js (Archivo original que me diste)

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const User = require('../models/user.js'); // <-- IMPORTAR MODELO DE USUARIO

// ... (Tus rutas existentes) ...
router.post('/', registerUser);
router.post('/login', loginUser);

// --- NUEVA RUTA PARA OBTENER STATS (GET /api/users/stats/:userId) ---
// Usado por fetchData en el frontend
router.get('/stats/:userId', async (req, res) => {
    try {
        // Solo selecciona los campos que el dashboard necesita
        const user = await User.findById(req.params.userId).select('puntos racha');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener stats', error: error.message });
    }
});
// --------------------------------------------------------------------

module.exports = router;