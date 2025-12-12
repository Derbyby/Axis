
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Importar conexión a BD

dotenv.config();

connectDB();

//Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

//Middlewares (Permiten que el servidor entienda datos)
app.use(express.json()); // Importante: Permite recibir JSON en los POST
app.use(express.urlencoded({ extended: false }));
app.use(cors()); // Permite conexiones desde el Frontend (React)

//Importar y Usar las Rutas
//Aquí conectamos la ruta
const userRoutes = require('./routes/userRoutes');
const habitRoutes = require('./routes/habitRoutes');
const socialRoutes = require("./routes/socialRoutes");
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/social', socialRoutes);

//Arranca el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});