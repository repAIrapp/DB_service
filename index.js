// dotenv.config();
// const express = require('express')
// import dotenv from 'dotenv';
// import  {connectDB} from './config/database.js';
// import cors from 'cors';


// const app= express();

// const PORT = process.env.PORT || 3001;


// app.use(express.json());
// app.use(cors());


// connectDB();

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });
// app.use('/api', router);
// app.listen(PORT, '0.0.0.0', () => {
//   console.log('Server running on http://0.0.0.0:4000');
// });


const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const { connectDB } = require('./src/config/db.js');
const cors = require('cors');
const router = require('./src/routes/router.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Connexion à la base de données
connectDB();

// Route test
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Toutes les routes API passent par /api
app.use('/api', router);

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
