// backend/utils/dateUtils.js
const getTodayStart = () => {
    // Retorna la fecha de hoy a las 00:00:00, ajustada a UTC si es necesario,
    // o simplemente usando el día local. Usaremos el día local para simplificar:
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getYesterdayStart = () => {
    const yesterday = getTodayStart();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
};

module.exports = {
    getTodayStart,
    getYesterdayStart
};