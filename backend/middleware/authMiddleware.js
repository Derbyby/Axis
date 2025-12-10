const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Verificar si hay un token en el encabezado (Header)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtenemos el token del encabezado (quitamos la palabra "Bearer")
            token = req.headers.authorization.split(' ')[1];

            // Decodificamos el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Buscamos al usuario por el ID que venía en el token y lo guardamos en req.user
            // Excluimos la contraseña para seguridad
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Dejamos pasar a la siguiente función
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('No autorizado, token fallido');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no hay token');
    }
});

module.exports = { protect };