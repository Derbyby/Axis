// backend/controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.js'); // Importamos el modelo

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        // 1. Validar que enviaron todos los datos
        if (!nombre || !email || !password) {
            res.status(400);
            throw new Error('Por favor rellena todos los campos');
        }

        // 2. Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('Ese usuario ya existe');
        }

        // 3. Encriptar contraseña (HASH)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Crear usuario
        const user = await User.create({
            nombre,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                nombre: user.nombre,
                email: user.email,
                token: generateToken(user._id) // (JWT)
            });
        } else {
            res.status(400);
            throw new Error('Datos de usuario inválidos');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Autenticar usuario (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar por email
        const user = await User.findOne({ email });

        // Comparar contraseña encriptada
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                nombre: user.nombre,
                email: user.email,
                puntos: user.puntos || 0, // <-- Incluir Puntos
                racha: user.racha || 0,   // <-- Incluir Racha
                createdAt: user.createdAt,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error('Credenciales inválidas');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Función auxiliar para generar JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secreto123', {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
};