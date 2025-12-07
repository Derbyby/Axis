// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Intenta conectar usando la variable de entorno
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Detiene la app si falla la conexión
    }
};

module.exports = connectDB;