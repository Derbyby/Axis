const express = require('express');
const router = express.Router();
const { addFriend, getGlobalRanking, getWeeklyRanking } = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

// Rutas protegidas (necesitas estar logueado)
router.post('/add-friend', protect, addFriend);
router.get('/ranking', protect, getGlobalRanking);
router.get('/ranking-semanal', protect, getWeeklyRanking);

module.exports = router;