// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

router.post('/', registerUser);      // Ruta para registrarse
router.post('/login', loginUser);    // Ruta para entrar (Login)

module.exports = router;