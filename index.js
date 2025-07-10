const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const { connectDB } = require('./src/config/db.js');
const cors = require('cors');
const router = require('./src/routes/router.js');
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
const register = new client.Registry();
//  métrique de type Counter
const DBRequestsCounter = new client.Counter({
  name: "db_requests_total",
  help: "Nombre total de requêtes sur le service DB",
  labelNames: ["method", "route", "status"]
});

// enregistre la métrique dans le registre
register.registerMetric(DBRequestsCounter);

// collecte les métriques système par défaut
client.collectDefaultMetrics({ register });

app.use((req, res, next) => {
  res.on("finish", () => {
    DBRequestsCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

// Connexion à la base de données
connectDB();

// Route test
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', router);

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});
// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
const metricsApp = express();
metricsApp.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});
metricsApp.listen(9101, () => {
  console.log("DB service metrics exposed on http://localhost:9101/metrics");
});