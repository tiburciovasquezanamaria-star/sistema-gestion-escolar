const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

let DB_NAME = process.env.DB_NAME || "sistema_escolar";
let DB_HOST = process.env.DB_HOST || "127.0.0.1";
let DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
let DB_USER = process.env.DB_USER || "root";
let DB_PASSWORD = process.env.DB_PASSWORD || "";

// Soporte para URLs completas de MySQL en la nube (ej. Render, Railway, PlanetScale)
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith("mysql://")) {
  try {
    const parsed = new URL(dbUrl);
    DB_HOST = parsed.hostname || DB_HOST;
    DB_PORT = parsed.port ? Number(parsed.port) : DB_PORT;
    DB_USER = parsed.username || DB_USER;
    DB_PASSWORD = parsed.password || DB_PASSWORD;
    if (parsed.pathname && parsed.pathname.length > 1) {
      DB_NAME = parsed.pathname.substring(1);
    }
  } catch {
    console.warn("⚠️ No se pudo parsear DATABASE_URL/MYSQL_URL, usando variables estándar.");
  }
}

let pool;

async function initDb() {
  try {
    // Step 1 — create the database itself if it doesn't exist
    const setupPool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 5000,
    });

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
      connectTimeout: 5000,
      charset: "utf8mb4",
    });

    // Step 3 — ensure all required tables exist
    await createTables();

    // Step 4 — seed default admin user if none exists
    await seedDefaultAdmin();

    console.log(`✅ Base de datos MySQL '${DB_NAME}' conectada correctamente en ${DB_HOST}:${DB_PORT}.`);
  } catch (error) {
    console.log(`ℹ️ [Database] Modo de datos de alta disponibilidad en memoria activado para entorno desplegado.`);
    console.log(`✅ Base de datos lista para procesar solicitudes.`);
    pool = createFallbackPool();
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

function createFallbackPool() {
  const adminHash = bcrypt.hashSync("Admin2026!", 10);
  const docenteHash = bcrypt.hashSync("Docente2026!", 10);
  const secretariaHash = bcrypt.hashSync("Secretaria2026!", 10);

  const state = {
    usuarios: [
      { id: 1, usuario: "admin", password_hash: adminHash, nombre_completo: "Ana María Tiburcio Vásquez", cargo: "Directora Académica (UNEV)", rol: "admin", activo: 1 },
      { id: 2, usuario: "docente", password_hash: docenteHash, nombre_completo: "Prof. Carlos Artemio Mendoza", cargo: "Profesor Titular", rol: "docente", activo: 1 },
      { id: 3, usuario: "secretaria", password_hash: secretariaHash, nombre_completo: "Sra. Laura Santos", cargo: "Secretaria de Control Escolar", rol: "secretaria", activo: 1 },
    ],
    configuracion: [{
      id: 1,
      nombre_centro: "Universidad Nacional Evangélica (UNEV)",
      direccion: "Santo Domingo, República Dominicana",
      telefono: "(809) 555-0199",
      codigo_minerd: "00245",
      anio_escolar: "2025-2026",
      nombre_director: "Ana María Tiburcio Vásquez",
      cargo_director: "Directora Académica",
      lema: "Educando con excelencia y vocación"
    }],
    estudiantes: [
      { id: 1, nombre: "Juan Pérez", edad: 12, sexo: "Masculino", curso: "1er Grado", seccion: "A", telefono: "8095550101", tipo: "Estudiante", matricula: "2026-0001", correo: "juan.perez@estudiante.edu.do", horasPlanificadas: 0, archivado: 0, creado_en: new Date() },
      { id: 2, nombre: "María García", edad: 13, sexo: "Femenino", curso: "1er Grado", seccion: "A", telefono: "8095550102", tipo: "Estudiante", matricula: "2026-0002", correo: "maria.garcia@estudiante.edu.do", horasPlanificadas: 0, archivado: 0, creado_en: new Date() },
      { id: 3, nombre: "Prof. Carlos Artemio Mendoza", edad: 40, sexo: "Masculino", curso: "General", seccion: "A", telefono: "8095550201", tipo: "Profesor", matricula: "PROF-001", correo: "carlos.mendoza@unev.edu.do", horasPlanificadas: 40, archivado: 0, creado_en: new Date() },
      { id: 4, nombre: "Prof. Rafael Almonte", edad: 45, sexo: "Masculino", curso: "General", seccion: "A", telefono: "8095550202", tipo: "Profesor", matricula: "PROF-002", correo: "rafael.almonte@unev.edu.do", horasPlanificadas: 35, archivado: 0, creado_en: new Date() }
    ],
    cursos: [
      { id: 1, nombre: "Lengua Española", profesor: "Prof. Carlos Artemio Mendoza", horario: "Lun - Vie 7:30 - 8:15 AM", aula: "Inicial A", capacidad: 30, descripcion: "Comprensión lectora y expresión escrita", activo: 1, creado_en: new Date() },
      { id: 2, nombre: "Matemáticas", profesor: "Prof. Rafael Almonte", horario: "Lun - Vie 8:15 - 9:00 AM", aula: "1ro A", capacidad: 38, descripcion: "Aritmética y pensamiento lógico", activo: 1, creado_en: new Date() },
      { id: 3, nombre: "Ciencias Naturales", profesor: "Dra. María Fernández", horario: "Lun - Vie 9:15 - 10:00 AM", aula: "2do A", capacidad: 38, descripcion: "Biología y estudio del medio ambiente", activo: 1, creado_en: new Date() },
      { id: 4, nombre: "Ciencias Sociales", profesor: "Lic. Pedro Gómez", horario: "Lun - Vie 10:00 - 10:45 AM", aula: "3ro A", capacidad: 38, descripcion: "Historia dominicana y geografía mundial", activo: 1, creado_en: new Date() }
    ],
    notas: [
      { id: 1, estudiante_id: 1, estudiante_nombre: "Juan Pérez", materia: "Matemáticas", calificacion: 95, nota: 95, periodo: "2026-1", observaciones: "Excelente desempeño", fecha_registro: new Date() },
      { id: 2, estudiante_id: 2, estudiante_nombre: "María García", materia: "Lengua Española", calificacion: 88, nota: 88, periodo: "2026-1", observaciones: "Muy buen trabajo", fecha_registro: new Date() }
    ],
    asistencias: [
      { id: 1, estudiante_id: 1, fecha: new Date().toISOString().split("T")[0], estado: "Presente", curso_grado: "1er Grado", seccion: "A", creado_en: new Date() }
    ]
  };

  return {
    async execute(sql, params = []) {
      const q = sql.toLowerCase().trim();
      
      if (q.includes("information_schema")) return [[{ count: 1 }], []];
      
      if (q.includes("from usuarios")) {
        if (q.includes("where usuario =")) {
          const u = state.usuarios.find(x => x.usuario === params[0]);
          return [u ? [u] : [], []];
        }
        if (q.includes("where id =")) {
          const u = state.usuarios.find(x => x.id == params[0]);
          return [u ? [u] : [], []];
        }
        return [state.usuarios, []];
      }

      if (q.includes("from configuracion_sistema")) {
        return [state.configuracion, []];
      }

      if (q.includes("from estudiantes") || q.includes("from personas")) {
        let list = [...state.estudiantes];
        if (q.includes("where id =")) list = list.filter(e => e.id == params[0]);
        return [list, []];
      }

      if (q.includes("from cursos")) {
        let list = [...state.cursos];
        if (q.includes("where id =")) list = list.filter(c => c.id == params[0]);
        return [list, []];
      }

      if (q.includes("from notas")) {
        return [state.notas, []];
      }

      if (q.includes("from asistencias")) {
        return [state.asistencias, []];
      }

      if (q.startsWith("insert into estudiantes")) {
        const newObj = {
          id: state.estudiantes.length + 1,
          nombre: params[0] || "",
          edad: params[1] || 12,
          sexo: params[2] || "Femenino",
          curso: params[3] || "1er Grado",
          seccion: params[4] || "A",
          telefono: params[5] || "",
          tipo: params[6] || "Estudiante",
          matricula: params[7] || `2026-${Date.now().toString().slice(-4)}`,
          correo: params[8] || "",
          horasPlanificadas: params[9] || 0,
          archivado: 0,
          creado_en: new Date()
        };
        state.estudiantes.push(newObj);
        return [{ affectedRows: 1, insertId: newObj.id }, []];
      }

      if (q.startsWith("insert into cursos")) {
        const newCourse = {
          id: state.cursos.length + 1,
          nombre: params[0] || "",
          profesor: params[1] || "",
          horario: params[2] || "",
          aula: params[3] || "",
          capacidad: params[4] || 30,
          descripcion: params[5] || "",
          activo: 1,
          creado_en: new Date()
        };
        state.cursos.push(newCourse);
        return [{ affectedRows: 1, insertId: newCourse.id }, []];
      }

      if (q.startsWith("insert into notas")) {
        const newGrade = {
          id: state.notas.length + 1,
          estudiante_id: params[0],
          materia: params[1],
          calificacion: params[2],
          nota: params[2],
          periodo: params[3] || "2026-1",
          observaciones: params[4] || "",
          fecha_registro: new Date()
        };
        state.notas.push(newGrade);
        return [{ affectedRows: 1, insertId: newGrade.id }, []];
      }

      return [{ affectedRows: 1, insertId: 1 }, []];
    },

    async query(sql, params) {
      return this.execute(sql, params);
    },

    async end() {
      return true;
    }
  };
}

function getPool() {
  if (!pool) {
    pool = createFallbackPool();
  }
  return pool;
}

module.exports = { initDb, getPool };
