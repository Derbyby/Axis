// backend/controllers/socialController.js
const User = require('../models/User');
const Habit = require('../models/habit');

// @desc    Agregar un amigo por su correo
// @route   POST /api/social/add-friend
const addFriend = async (req, res) => {
    const { emailAmigo } = req.body;
    const miId = req.user.id; // Viene del token

    // 1. Buscar al amigo en la BD
    const amigo = await User.findOne({ email: emailAmigo });

    if (!amigo) {
        res.status(404);
        throw new Error('Usuario no encontrado con ese correo');
    }

    if (amigo.id === miId) {
        res.status(400);
        throw new Error('No puedes agregarte a ti mismo');
    }

    // 2. Agregar a mi lista (evitando duplicados)
    const yo = await User.findById(miId);
    
    if (yo.amigos.includes(amigo.id)) {
        res.status(400);
        throw new Error('Ya son amigos');
    }

    yo.amigos.push(amigo.id);
    await yo.save();

    // Opcional: Que también te agregue a ti en su lista (amistad recíproca)
    amigo.amigos.push(miId);
    await amigo.save();

    res.status(200).json({ message: `Ahora eres amigo de ${amigo.nombre}` });
};

// @desc    Obtener Ranking Global (Top 10 usuarios con más puntos)
// @route   GET /api/social/ranking
const getGlobalRanking = async (req, res) => {
    // Busca usuarios, ordénalos por puntos (descendente) y toma los primeros 10
    const topUsers = await User.find({})
        .sort({ puntos: -1 }) 
        .limit(10)
        .select('nombre puntos nivel'); // Solo traemos datos necesarios

    res.json(topUsers);
};

// @desc    Obtener Ranking Semanal (Calculado por hábitos completados en los últimos 7 días)
// @route   GET /api/social/ranking-semanal
const getWeeklyRanking = async (req, res) => {
    // Esta consulta es avanzada (Aggregation Pipeline)
    // Busca hábitos completados hace menos de 7 días y suma puntos
    const haceSieteDias = new Date();
    haceSieteDias.setDate(haceSieteDias.getDate() - 7);

    const ranking = await Habit.aggregate([
        {
            $match: {
                // Filtramos hábitos que tengan fechas completadas recientes
                fechasCompletadas: { $gte: haceSieteDias }
            }
        },
        {
            $group: {
                _id: "$user", // Agrupamos por usuario
                totalCompletados: { $sum: 1 } // Contamos cuántos hábitos cumplió
            }
        },
        { $sort: { totalCompletados: -1 } }, // Ordenamos del mejor al peor
        { $limit: 10 }, // Top 10
        {
            // Unimos con la tabla de usuarios para saber sus nombres
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "datosUsuario"
            }
        },
        {
            $project: {
                nombre: { $arrayElemAt: ["$datosUsuario.nombre", 0] },
                totalCompletados: 1
            }
        }
    ]);

    res.json(ranking);
};

module.exports = { addFriend, getGlobalRanking, getWeeklyRanking };