// backend/routes/habitRoutes.js
const express = require('express');
const router = express.Router();
const { getHabits, createHabit, updateHabit, deleteHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

// Aquí aplicamos la protección. Si no tienes Token, no pasas.
// Ruta raíz: /api/habits
router.route('/').get(protect, getHabits).post(protect, createHabit);

// Ruta con ID: /api/habits/:id (para actualizar o borrar uno específico)
router.route('/:id').put(protect, updateHabit).delete(protect, deleteHabit);

module.exports = router;