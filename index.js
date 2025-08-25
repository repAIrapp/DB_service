const dotenv = require("dotenv");
dotenv.config();

const { app } = require("./app");
const { connectDB } = require("./src/config/db");

const logger = require('./logger');
logger.info("Server started");

const PORT = process.env.PORT || 3001;

// Connexion DB
connectDB();

// Démarrer le serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
