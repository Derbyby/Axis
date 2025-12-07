const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // <--- 1. Importar

dotenv.config();

// 2. Conectar a la Base de Datos
connectDB();

const app = express();
// ... resto de tu código (app.use, rutas, listen, etc.)