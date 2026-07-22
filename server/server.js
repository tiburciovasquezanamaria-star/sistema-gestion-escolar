const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { initDb } = require("./db");

const authRoutes     = require("./routes/authRoutes");
const studentRoutes  = require("./routes/studentRoutes");
const courseRoutes   = require("./routes/courseRoutes");
const gradeRoutes    = require("./routes/gradeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate limiting — 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Demasiadas solicitudes. Intente más tarde." },
});
app.use(limiter);

// Stricter rate limit only on login (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Demasiados intentos de inicio de sesión. Espere 15 minutos." },
});
app.use("/api/auth/login", loginLimiter);

// ─── Middleware ─────────────────────────────────────────────────────────────
// Dynamic CORS origins to allow public deployments (like Vercel, Netlify)
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"];
if (process.env.FRONTEND_URL) {
  const customOrigins = process.env.FRONTEND_URL.split(",").map(url => url.trim());
  allowedOrigins.push(...customOrigins);
}

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "2mb" }));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api", studentRoutes);
app.use("/api", courseRoutes);
app.use("/api", gradeRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", settingsRoutes);

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "operational",
    timestamp: new Date().toISOString(),
    service: "Sistema de Gestión Escolar API v2.0",
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ─── Global error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ success: false, message: "Error interno del servidor." });
});

// ─── Start server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor API corriendo en http://localhost:${PORT}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/students`);
      console.log(`   GET  /api/courses`);
      console.log(`   GET  /api/grades`);
      console.log(`   GET  /api/attendance`);
      console.log(`   GET  /api/settings\n`);
    });
  })
  .catch((error) => {
    console.error("❌ No se pudo iniciar la base de datos:", error);
    process.exit(1);
  });
