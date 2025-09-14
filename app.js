
// const express = require("express");
// const cors = require("cors");
// const client = require("prom-client");
// const router = require("./src/routes/router.js");
// const helmet = require("helmet");
// const mongoSanitize = require('express-mongo-sanitize');
// const quotaRoutes = require('./src/routes/quotas.js');


// const app = express();
// const rateLimit = require("express-rate-limit");


// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limite 100 requêtes par IP
// });
// const allowedOrigins = [
//   'http://localhost:3000',                 // dev local
//   process.env.FRONT_URL                    // domaine Vercel en prod
// ];
// app.use(limiter);
// app.use(mongoSanitize());


// // Middleware
// app.use(helmet());
// app.use(express.json());
// // app.use(cors({
// //   origin: 'http://localhost:3000', 
// //   methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
// //   allowedHeaders: ['Content-Type','Authorization'],
// //   credentials: true, 
// // }));
// app.use(cors({
//   origin: allowedOrigins,                  // un tableau est accepté par cors
//   methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
//   credentials: true
// }));
// app.use('/api/quotas', quotaRoutes);
// // ---- Prometheus metrics
// const register = new client.Registry();

// // Counter: requests on DB service
// const DBRequestsCounter = new client.Counter({
//   name: "db_requests_total",
//   help: "Nombre total de requêtes sur le service DB",
//   labelNames: ["method", "route", "status"],
// });

// register.registerMetric(DBRequestsCounter);
// client.collectDefaultMetrics({ register });

// // increment on response finish
// app.use((req, res, next) => {
//   res.on("finish", () => {
//     DBRequestsCounter.inc({
//       method: req.method,
//       route: req.path,
//       status: res.statusCode,
//     });
//   });
//   next();
// });

// // Simple routes
// app.get("/", (_req, res) => {
//   res.send("Hello World!");
// });

// app.use("/api", router);

// // Expose metrics on this app too (handy in dev/tests)
// app.get("/metrics", async (_req, res) => {
//   res.setHeader("Content-Type", register.contentType);
//   res.send(await register.metrics());
// });

// module.exports = { app, register };






const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const client = require("prom-client");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const router = require("./src/routes/router.js");
const quotaRoutes = require("./src/routes/quotas.js");

const app = express();

// --- CORS: origines autorisées
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // ex: https://front-dun-seven.vercel.app (sans slash final)
];

// Parsers en tout début
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

// CORS en premier (avant helmet et routes)
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // Postman/cURL
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Laisser passer les preflight
app.options("*", cors());

// Sécurité & hygiène
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(mongoSanitize());

// Routes
app.use("/api/quotas", quotaRoutes);

const register = new client.Registry();
const DBRequestsCounter = new client.Counter({
  name: "db_requests_total",
  help: "Nombre total de requêtes sur le service DB",
  labelNames: ["method", "route", "status"],
});
register.registerMetric(DBRequestsCounter);
client.collectDefaultMetrics({ register });
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

app.get("/", (_req, res) => res.send("Hello World!"));
app.use("/api", router);

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

module.exports = { app, register };