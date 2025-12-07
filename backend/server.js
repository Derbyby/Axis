const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
 .then(() => console.log("MongoDB conectado"))
 .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("API funcionando");
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor corriendo en ${port}`));
