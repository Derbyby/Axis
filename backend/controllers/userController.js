// backend/controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
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

const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { puntos } = req.body; 

    // 1. Verificar que el usuario del token sea el dueño del perfil
    if (req.user.id !== userId) {
        return res.status(401).json({ message: 'No autorizado para actualizar este perfil.' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Solo permitimos actualizar puntos o nivel de forma controlada
        if (puntos !== undefined) {
            user.puntos = puntos;
            user.nivel = Math.floor(user.puntos / 100) + 1; // Recalcula nivel
        }
        
        // Aquí puedes agregar lógica para actualizar otros campos si lo deseas

        const updatedUser = await user.save();
        
        // Devolvemos solo la información pública
        res.status(200).json({
            _id: updatedUser.id,
            nombre: updatedUser.nombre,
            email: updatedUser.email,
            puntos: updatedUser.puntos,
            nivel: updatedUser.nivel,
            racha: updatedUser.racha,
            // NOTA: No devolver password ni token
        });

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: 'Error interno al actualizar usuario.', error: error.message });
    }
};

// --- OLVIDÉ MI CONTRASEÑA (Solicitar Link) ---
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No existe un usuario con ese email' });

        // Generar token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hashear token y guardarlo en la BD
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Expira en 10 minutos

        await user.save({ validateBeforeSave: false });

        // Crear URL de reseteo (apunta al Frontend)
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `
            <h1>Recuperación de Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña en Axis.</p>
            <p>Haz clic en el siguiente enlace:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>Si no fuiste tú, ignora este correo.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Axis - Recuperar Contraseña',
                message
            });
            res.status(200).json({ success: true, data: 'Correo enviado' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'El correo no se pudo enviar' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- RESTABLECER CONTRASEÑA (Poner la nueva) ---
const resetPassword = async (req, res) => {
    // 1. Hasheamos el token que viene de la URL para compararlo con el de la BD
    const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        // 2. Buscamos al usuario con ese token y que no haya expirado
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o ha expirado' });
        }

        // 3. ENCRIPTAR LA NUEVA CONTRASEÑA (Aquí estaba el fallo)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // 4. Limpiamos los tokens de recuperación
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // 5. Guardamos
        await user.save();

        res.status(200).json({ success: true, data: 'Contraseña actualizada con éxito' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al restablecer contraseña' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    forgotPassword, 
    resetPassword
};