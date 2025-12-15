// backend/routes/userRoutes.js (FINAL CORREGIDO)

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Necesitas importar 'protect'
const User = require('../models/user.js'); 

// 1. Registro y Login (Usan controllers)
router.post('/', registerUser);
router.post('/login', loginUser);


// --- NUEVA RUTA PARA ACTUALIZAR PERFIL Y PUNTOS (PUT /api/users/:id) ---
// El ID del usuario se pasa por la URL
router.put('/:id', protect, async (req, res) => {
    // Nota: Es mejor usar req.user.id (del token) para mayor seguridad, 
    // pero respetaremos el uso de :id de tu frontend para mayor compatibilidad
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
        
        // Creamos un objeto de actualización con los campos recibidos
        const updateFields = {};
        if (puntos !== undefined) updateFields.puntos = puntos;
        if (racha !== undefined) updateFields.racha = racha;
        if (nombre !== undefined) updateFields.nombre = nombre;
        if (email !== undefined) updateFields.email = email;

        // Actualizamos el usuario
        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
            new: true, // Devuelve el documento actualizado
            runValidators: true // Ejecuta las validaciones de Mongoose
        }).select('-password'); // Excluimos la contraseña

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
    }
});
// --------------------------------------------------------------------


// --- RUTA PARA OBTENER STATS (GET /api/users/stats/:userId) ---
router.get('/stats/:userId', async (req, res) => {
    try {
        // Nota: Si usas el token (protect), no necesitas pasar el ID en la URL,
        // pero mantendremos tu estructura actual.
        const user = await User.findById(req.params.userId).select('puntos racha');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener stats', error: error.message });
    }
});
// --------------------------------------------------------------------

module.exports = router;