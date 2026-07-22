const { getPool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "sge_secret_key_2026";
const JWT_EXPIRES = "8h"; // Session lasts 8 hours

// Cargos predeterminados por rol
const CARGOS_POR_ROL = {
  admin: "Administrador/a",
  docente: "Docente",
  secretaria: "Secretaria",
};

const authController = {
  /**
   * POST /api/auth/login
   * Validates credentials and returns JWT token
   */
  async login(req, res) {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son obligatorios.",
      });
    }

    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        "SELECT * FROM usuarios WHERE usuario = ? AND activo = 1 LIMIT 1",
        [usuario.trim()]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas. Verifique su usuario.",
        });
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        // Log failed attempt
        await pool.execute(
          "UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = ?",
          [user.id]
        );
        return res.status(401).json({
          success: false,
          message: "Contraseña incorrecta. Verifique sus credenciales.",
        });
      }

      // Reset failed attempts on success
      await pool.execute(
        "UPDATE usuarios SET intentos_fallidos = 0, ultimo_acceso = NOW() WHERE id = ?",
        [user.id]
      );

      const token = jwt.sign(
        {
          id: user.id,
          usuario: user.usuario,
          nombre: user.nombre_completo,
          rol: user.rol,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      );

      res.json({
        success: true,
        message: "Sesión iniciada correctamente.",
        token,
        user: {
          id: user.id,
          usuario: user.usuario,
          nombre: user.nombre_completo,
          rol: user.rol,
          cargo: user.cargo,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
  },

  /**
   * POST /api/auth/change-password
   * Changes the logged-in user's password
   */
  async changePassword(req, res) {
    const { passwordActual, passwordNuevo } = req.body;
    const userId = req.user.id;

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios." });
    }

    if (passwordNuevo.length < 6) {
      return res.status(400).json({ success: false, message: "La contraseña nueva debe tener al menos 6 caracteres." });
    }

    try {
      const pool = getPool();
      const [rows] = await pool.execute("SELECT password_hash FROM usuarios WHERE id = ?", [userId]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: "Usuario no encontrado." });

      const match = await bcrypt.compare(passwordActual, rows[0].password_hash);
      if (!match) return res.status(401).json({ success: false, message: "La contraseña actual es incorrecta." });

      const newHash = await bcrypt.hash(passwordNuevo, 12);
      await pool.execute("UPDATE usuarios SET password_hash = ? WHERE id = ?", [newHash, userId]);

      res.json({ success: true, message: "Contraseña actualizada correctamente." });
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
  },

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user info
   */
  async me(req, res) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        "SELECT id, usuario, nombre_completo, rol, cargo, ultimo_acceso FROM usuarios WHERE id = ?",
        [req.user.id]
      );
      if (rows.length === 0) return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      res.json({ success: true, user: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error interno." });
    }
  },

  /**
   * POST /api/auth/register
   * Registra un nuevo usuario en el sistema
   * Requiere código de administrador para seguridad
   */
  async register(req, res) {
    const { usuario, password, confirmPassword, nombre_completo, rol, cargo, correo, codigoAdmin } = req.body;

    // Validaciones básicas
    if (!usuario || !password || !nombre_completo || !rol) {
      return res.status(400).json({
        success: false,
        message: "Usuario, contraseña, nombre completo y rol son obligatorios.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const rolesValidos = ["admin", "docente", "secretaria"];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "Rol no válido. Seleccione: admin, docente o secretaria.",
      });
    }

    // Verificar código de administrador para roles con más privilegios
    const ADMIN_CODE = process.env.ADMIN_REGISTER_CODE || "SGE2026";
    if (rol === "admin" && codigoAdmin !== ADMIN_CODE) {
      return res.status(403).json({
        success: false,
        message: "Código de administrador incorrecto para este rol.",
      });
    }

    try {
      const pool = getPool();

      // Verificar que el usuario no exista
      const [existing] = await pool.execute(
        "SELECT id FROM usuarios WHERE usuario = ?",
        [usuario.trim().toLowerCase()]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: "El nombre de usuario ya está en uso. Elija otro.",
        });
      }

      const hash = await bcrypt.hash(password, 12);
      const cargoFinal = cargo || CARGOS_POR_ROL[rol];

      await pool.execute(
        `INSERT INTO usuarios (usuario, password_hash, nombre_completo, cargo, rol, activo)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [usuario.trim().toLowerCase(), hash, nombre_completo.trim(), cargoFinal, rol]
      );

      res.status(201).json({
        success: true,
        message: `Usuario "${usuario}" registrado correctamente como ${cargoFinal}.`,
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
  },
};

module.exports = authController;
