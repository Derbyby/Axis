const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');

// 1. BUSCAR USUARIOS (Para agregar amigos)
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q; // Lo que escribe el usuario
        if (!query) return res.status(400).json({ message: 'Escribe algo para buscar' });

        // Buscamos por nombre o email (ignorando mayúsculas/minúsculas)
        const users = await User.find({
            $or: [
                { nombre: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user.id } // ¡No mostrarme a mí mismo en la búsqueda!
        }).select('nombre email puntos nivel friends'); // Solo traer datos seguros

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error en la búsqueda' });
    }
};

// 2. ENVIAR SOLICITUD DE AMISTAD
const sendFriendRequest = async (req, res) => {
    try {
        const targetUserId = req.params.id; // A quién quiero agregar
        const myId = req.user.id;           // Yo

        if (targetUserId === myId) {
            return res.status(400).json({ message: 'No puedes agregarte a ti mismo' });
        }

        const targetUser = await User.findById(targetUserId);
        const me = await User.findById(myId);

        if (!targetUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Validaciones:
        if (targetUser.friends.includes(myId)) {
            return res.status(400).json({ message: 'Ya son amigos' });
        }
        if (targetUser.friendRequests.includes(myId)) {
            return res.status(400).json({ message: 'Ya le enviaste solicitud antes' });
        }
        if (me.friendRequests.includes(targetUserId)) {
            return res.status(400).json({ message: 'Esa persona ya te envió solicitud a ti, ¡acéptala!' });
        }

        // ¡Enviamos la solicitud!
        targetUser.friendRequests.push(myId);
        await targetUser.save();

        res.json({ message: 'Solicitud enviada correctamente' });

        try {
            await sendEmail({
                email: friend.email, // El correo del amigo
                subject: '¡Nueva solicitud de amistad en Axis!',
                message: `<h1>¡Hola ${friend.nombre}!</h1><p>${req.user.nombre} quiere ser tu amigo en Axis.</p>`
            });
        } catch (error) {
            console.log("No se pudo enviar el correo de notificación, pero la solicitud se guardó.");
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al enviar solicitud' });
    }
};

// 3. VER MIS SOLICITUDES PENDIENTES
const getFriendRequests = async (req, res) => {
    try {
        // Buscamos mi usuario y "rellenamos" (populate) los datos de quienes me enviaron solicitud
        const user = await User.findById(req.user.id)
            .populate('friendRequests', 'nombre email puntos nivel');
        
        res.json(user.friendRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener solicitudes' });
    }
};

// 4. ACEPTAR SOLICITUD
const acceptFriendRequest = async (req, res) => {
    try {
        const requesterId = req.params.id; // La persona que me quiere agregar
        const myId = req.user.id;

        const me = await User.findById(myId);
        const requester = await User.findById(requesterId);

        if (!me || !requester) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Verificar que la solicitud exista realmente
        if (!me.friendRequests.includes(requesterId)) {
            return res.status(400).json({ message: 'No tienes solicitud de esta persona' });
        }

        // 1. Agregarnos mutuamente a la lista de amigos
        me.friends.push(requesterId);
        requester.friends.push(myId);

        // 2. Borrar la solicitud de mi buzón
        me.friendRequests = me.friendRequests.filter(id => id.toString() !== requesterId);

        await me.save();
        await requester.save();

        res.json({ message: '¡Solicitud aceptada! Ahora son amigos.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al aceptar solicitud' });
    }
};

// 5. VER MI LISTA DE AMIGOS
const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'nombre email puntos racha nivel');
        
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener amigos' });
    }
};

module.exports = { 
    searchUsers, 
    sendFriendRequest, 
    getFriendRequests, 
    acceptFriendRequest, 
    getFriends 
};