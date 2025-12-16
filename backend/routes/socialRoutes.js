const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    searchUsers, 
    sendFriendRequest, 
    getFriendRequests, 
    acceptFriendRequest, 
    getFriends 
} = require('../controllers/socialController');

// Todas estas rutas requieren estar logueado (protect)
router.get('/search', protect, searchUsers);           // Buscar gente
router.post('/request/:id', protect, sendFriendRequest); // Enviar solicitud a ID
router.get('/requests', protect, getFriendRequests);     // Ver mis solicitudes
router.put('/accept/:id', protect, acceptFriendRequest); // Aceptar solicitud de ID
router.get('/friends', protect, getFriends);             // Ver mis amigos

module.exports = router;