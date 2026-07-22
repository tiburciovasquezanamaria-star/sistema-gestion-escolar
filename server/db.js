const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

const DB_NAME = process.env.DB_NAME || "sistema_escolar";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";

let pool;

async function initDb() {
  // Step 1 — create the database itself if it doesn't exist
  const setupPool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  try {
    await setupPool.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await setupPool.end();

    // Step 2 — create the pool connected to the database
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
    });

    // Step 3 — ensure all required tables exist
    await createTables();

    // Step 4 — seed default admin user if none exists
    await seedDefaultAdmin();

    console.log(`✅ Base de datos '${DB_NAME}' conectada correctamente.`);
  } catch (error) {
    console.error("❌ No se pudo inicializar la base de datos:", error.message);
    throw error;
  }
}

async function createTables() {
  // Check if usuarios table exists and if it is legacy (lacks password_hash)
  const [tableExists] = await pool.execute(`
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = ? AND table_name = 'usuarios'
  `, [DB_NAME]);

  if (tableExists[0].count > 0) {
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = ? AND table_name = 'usuarios' AND column_name = 'password_hash'
    `, [DB_NAME]);

    if (columns.length === 0) {
      console.log("  ⚠️ Detectada tabla de usuarios antigua. Iniciando migración a estructura segura...");
      // Drop backup table if already exists from previous runs to prevent errors
      await pool.execute("DROP TABLE IF EXISTS usuarios_legacy");
      // Rename old table to backup
      await pool.execute("RENAME TABLE usuarios TO usuarios_legacy");
      
      // Create new secure table structure
      await pool.execute(`
        CREATE TABLE usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario VARCHAR(50) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          nombre_completo VARCHAR(150) NOT NULL,
          cargo VARCHAR(100) DEFAULT 'Administrador',
          rol ENUM('admin', 'docente', 'secretaria') DEFAULT 'admin',
          activo TINYINT(1) DEFAULT 1,
          intentos_fallidos INT DEFAULT 0,
          ultimo_acceso DATETIME NULL,
          creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);

      // Migrate records
      const [legacyUsers] = await pool.execute("SELECT * FROM usuarios_legacy");
      for (const u of legacyUsers) {
        const hash = await bcrypt.hash(u.password, 12);
        let mappedRol = 'admin';
        let cargo = 'Administradora';
        
        if (u.rol === 'profesor') {
          mappedRol = 'docente';
          cargo = 'Profesor/a';
        } else if (u.rol === 'estudiante') {
          mappedRol = 'secretaria';
          cargo = 'Estudiante';
        }
        
        await pool.execute(
          `INSERT INTO usuarios (usuario, password_hash, nombre_completo, cargo, rol)
           VALUES (?, ?, ?, ?, ?)`,
          [u.usuario, hash, u.usuario === 'admin' ? 'Administradora del Sistema' : u.usuario, cargo, mappedRol]
        );
      }
      console.log("  ✅ Migración de usuarios completada con éxito. Contraseñas antiguas encriptadas con bcrypt.");
    }
  } else {
    // Normal creation of new secure table structure
    await pool.execute(`
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(150) NOT NULL,
        cargo VARCHAR(100) DEFAULT 'Administrador',
        rol ENUM('admin', 'docente', 'secretaria') DEFAULT 'admin',
        activo TINYINT(1) DEFAULT 1,
        intentos_fallidos INT DEFAULT 0,
        ultimo_acceso DATETIME NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
  }

  // Table: configuracion_sistema (System Settings)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS configuracion_sistema (
      id INT DEFAULT 1 PRIMARY KEY,
      nombre_centro VARCHAR(200) DEFAULT 'Centro Educativo',
      direccion VARCHAR(300) DEFAULT '',
      telefono VARCHAR(20) DEFAULT '',
      codigo_minerd VARCHAR(20) DEFAULT '',
      anio_escolar VARCHAR(20) DEFAULT '2025-2026',
      nombre_director VARCHAR(150) DEFAULT '',
      cargo_director VARCHAR(100) DEFAULT 'Directora',
      lema TEXT DEFAULT 'Educando con excelencia y vocación',
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // Ensure a default settings row exists
  await pool.execute(`
    INSERT IGNORE INTO configuracion_sistema (id) VALUES (1);
  `);

  // Table: estudiantes (if not exists — safe guard)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS estudiantes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      edad INT,
      sexo ENUM('Masculino','Femenino') DEFAULT 'Femenino',
      curso VARCHAR(100),
      seccion VARCHAR(5) DEFAULT 'A',
      telefono VARCHAR(20),
      tipo ENUM('Estudiante','Profesor') NOT NULL DEFAULT 'Estudiante',
      matricula VARCHAR(50) UNIQUE,
      correo VARCHAR(150),
      horasPlanificadas INT DEFAULT 0,
      archivado TINYINT(1) DEFAULT 0,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // Ensure 'creado_en' column exists on 'estudiantes' if table already existed without it
  const [estudiantesColumns] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'estudiantes' AND column_name = 'creado_en'
  `, [DB_NAME]);

  if (estudiantesColumns.length === 0) {
    console.log("  ⚠️ Agregando columna 'creado_en' faltante en la tabla 'estudiantes'...");
    await pool.execute("ALTER TABLE estudiantes ADD COLUMN creado_en DATETIME DEFAULT CURRENT_TIMESTAMP");
  }

  // Table: cursos
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS cursos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      profesor VARCHAR(150),
      horario VARCHAR(100),
      aula VARCHAR(50),
      capacidad INT DEFAULT 30,
      descripcion TEXT,
      activo TINYINT(1) DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // Ensure 'capacidad' column exists on 'cursos'
  const [cursosCapacidadCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'cursos' AND column_name = 'capacidad'
  `, [DB_NAME]);

  if (cursosCapacidadCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'capacidad' faltante en la tabla 'cursos'...");
    await pool.execute("ALTER TABLE cursos ADD COLUMN capacidad INT DEFAULT 30");
  }

  // Ensure 'creado_en' column exists on 'cursos'
  const [cursosCreadoEnCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'cursos' AND column_name = 'creado_en'
  `, [DB_NAME]);

  if (cursosCreadoEnCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'creado_en' faltante en la tabla 'cursos'...");
    await pool.execute("ALTER TABLE cursos ADD COLUMN creado_en DATETIME DEFAULT CURRENT_TIMESTAMP");
  }

  // Ensure 'descripcion' column exists on 'cursos'
  const [cursosDescripcionCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'cursos' AND column_name = 'descripcion'
  `, [DB_NAME]);

  if (cursosDescripcionCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'descripcion' faltante en la tabla 'cursos'...");
    await pool.execute("ALTER TABLE cursos ADD COLUMN descripcion TEXT");
  }

  // Ensure 'activo' column exists on 'cursos'
  const [cursosActivoCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'cursos' AND column_name = 'activo'
  `, [DB_NAME]);

  if (cursosActivoCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'activo' faltante en la tabla 'cursos'...");
    await pool.execute("ALTER TABLE cursos ADD COLUMN activo TINYINT(1) DEFAULT 1");
  }

  // Table: notas
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      estudiante_id INT NOT NULL,
      curso VARCHAR(100),
      nota DECIMAL(5,2),
      periodo VARCHAR(50),
      observaciones TEXT,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // Ensure 'curso' column exists on 'notas'
  const [notasCursoCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'notas' AND column_name = 'curso'
  `, [DB_NAME]);

  if (notasCursoCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'curso' faltante en la tabla 'notas'...");
    await pool.execute("ALTER TABLE notas ADD COLUMN curso VARCHAR(100)");
  }

  // Ensure 'nota' column exists on 'notas'
  const [notasNotaCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'notas' AND column_name = 'nota'
  `, [DB_NAME]);

  if (notasNotaCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'nota' faltante en la tabla 'notas'...");
    await pool.execute("ALTER TABLE notas ADD COLUMN nota DECIMAL(5,2)");
  }

  // Ensure 'periodo' column exists on 'notas'
  const [notasPeriodoCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'notas' AND column_name = 'periodo'
  `, [DB_NAME]);

  if (notasPeriodoCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'periodo' faltante en la tabla 'notas'...");
    await pool.execute("ALTER TABLE notas ADD COLUMN periodo VARCHAR(50)");
  }

  // Ensure 'observaciones' column exists on 'notas'
  const [notasObsCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'notas' AND column_name = 'observaciones'
  `, [DB_NAME]);

  if (notasObsCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'observaciones' faltante en la tabla 'notas'...");
    await pool.execute("ALTER TABLE notas ADD COLUMN observaciones TEXT");
  }

  // Ensure 'fecha_registro' column exists on 'notas'
  const [notasFechaCol] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'notas' AND column_name = 'fecha_registro'
  `, [DB_NAME]);

  if (notasFechaCol.length === 0) {
    console.log("  ⚠️ Agregando columna 'fecha_registro' faltante en la tabla 'notas'...");
    await pool.execute("ALTER TABLE notas ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP");
  }

  // Table: asistencias
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS asistencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      estudiante_id INT NOT NULL,
      fecha DATE NOT NULL,
      estado ENUM('Presente','Ausente','Tardanza','Excusa') DEFAULT 'Presente',
      curso_grado VARCHAR(50),
      seccion VARCHAR(5) DEFAULT 'A',
      maestro_id INT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_asistencia (estudiante_id, fecha),
      FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // View: personas (required by studentService.js)
  await pool.execute(`
    CREATE OR REPLACE VIEW personas AS
    SELECT id, tipo, nombre, matricula, correo, horasPlanificadas, archivado, creado_en
    FROM estudiantes;
  `);

  console.log("  📋 Tablas y vista 'personas' verificadas correctamente.");
}

async function seedDefaultAdmin() {
  const [rows] = await pool.execute("SELECT id FROM usuarios LIMIT 1");
  if (rows.length === 0) {
    const hash = await bcrypt.hash("Admin2026!", 12);
    await pool.execute(
      `INSERT INTO usuarios (usuario, password_hash, nombre_completo, cargo, rol)
       VALUES (?, ?, ?, ?, ?)`,
      ["admin", hash, "Administradora del Sistema", "Directora Académica", "admin"]
    );
    console.log("  👤 Usuario administrador por defecto creado:");
    console.log("     Usuario: admin");
    console.log("     Contraseña: Admin2026!");
    console.log("     ⚠️  Cambie la contraseña desde Configuración al ingresar.");
  }
}

function getPool() {
  if (!pool) {
    throw new Error("La base de datos aún no está inicializada. Llame a initDb() primero.");
  }
  return pool;
}

module.exports = { initDb, getPool };
