const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "sge_secret_key_2026";

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. Token de sesión requerido.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Su sesión ha expirado. Inicie sesión nuevamente.",
        expired: true,
      });
    }
    return res.status(403).json({
      success: false,
      message: "Token de sesión inválido.",
    });
  }
}

module.exports = authMiddleware;
