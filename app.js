// app.js
const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const router = require("./src/routes/router.js");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ---- Prometheus metrics
const register = new client.Registry();

// Counter: requests on DB service
const DBRequestsCounter = new client.Counter({
  name: "db_requests_total",
  help: "Nombre total de requêtes sur le service DB",
  labelNames: ["method", "route", "status"],
});

register.registerMetric(DBRequestsCounter);
client.collectDefaultMetrics({ register });

// increment on response finish
app.use((req, res, next) => {
  res.on("finish", () => {
    DBRequestsCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Simple routes
app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.use("/api", router);

// Expose metrics on this app too (handy in dev/tests)
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

module.exports = { app, register };
