/**
 * seedCursos.cjs
 * Siembra los cursos del colegio con secciones reales (Inicial A/B, 1ro A/B … 6to A/B),
 * asigna un maestro a cada uno y toma el conteo real de estudiantes de la BD.
 */
const { initDb, getPool } = require("./server/db");

// ── Maestros disponibles ─────────────────────────────────────────────────────
const MAESTROS = [
  "Prof. Carlos Artemio Mendoza",
  "Profa. Patricia Gómez",
  "Prof. Juan Rodríguez",
  "Dra. Ana María Vásquez",
  "Profa. Laura Santos",
  "Prof. Rafael Almonte",
  "Profa. Carla Díaz",
];

// ── Materias por nivel ───────────────────────────────────────────────────────
const MATERIAS_INICIAL = ["Pre-lectura y Escritura", "Matemáticas Básicas", "Arte y Creatividad"];
const MATERIAS_PRIMARIA = [
  "Lengua Española",
  "Matemáticas",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Educación Física",
];

// ── Niveles y cupos institucionales ─────────────────────────────────────────
const NIVELES = [
  { nivel: "Inicial", grado: "Inicial",    cupoTotal: 30, secciones: ["A", "B"], materias: MATERIAS_INICIAL },
  { nivel: "1ro",    grado: "1er Grado",   cupoTotal: 38, secciones: ["A", "B"], materias: MATERIAS_PRIMARIA },
  { nivel: "2do",    grado: "2do Grado",   cupoTotal: 38, secciones: ["A", "B"], materias: MATERIAS_PRIMARIA },
  { nivel: "3ro",    grado: "3er Grado",   cupoTotal: 38, secciones: ["A", "B"], materias: MATERIAS_PRIMARIA },
  { nivel: "4to",    grado: "4to Grado",   cupoTotal: 38, secciones: ["A", "B"], materias: MATERIAS_PRIMARIA },
  { nivel: "5to",    grado: "5to Grado",   cupoTotal: 38, secciones: ["A", "B"], materias: MATERIAS_PRIMARIA },
  { nivel: "6to",    grado: "6to Grado",   cupoTotal: 38, secciones: ["A", "B"], materias: MATERIAS_PRIMARIA },
];

// Horarios por franja
const HORARIOS = [
  "Lun-Vie 7:30 - 8:15 AM",
  "Lun-Vie 8:15 - 9:00 AM",
  "Lun-Vie 9:15 - 10:00 AM",
  "Lun-Vie 10:00 - 10:45 AM",
  "Lun-Vie 11:00 - 11:45 AM",
];

let maestroIdx = 0;
const nextMaestro = () => MAESTROS[maestroIdx++ % MAESTROS.length];

async function seed() {
  console.log("🏫  Sembrando cursos por sección con maestros y alumnos reales...\n");
  await initDb();
  const pool = getPool();

  // ── Limpiar cursos antiguos (los del seed original que no corresponden a secciones) ──
  console.log("🗑️  Eliminando cursos previos no organizados por sección...");
  await pool.query(
    `DELETE FROM cursos WHERE aula NOT REGEXP '^(Inicial|1ro|2do|3ro|4to|5to|6to) [AB]$'`
  );
  console.log("   ✅ Cursos genéricos eliminados.\n");

  let totalInsertados = 0;

  for (const lvl of NIVELES) {
    for (const sec of lvl.secciones) {
      const aulaLabel = `${lvl.nivel} ${sec}`;          // e.g. "3ro A"
      const gradoBD   = lvl.grado;                       // e.g. "3er Grado"

      // Contar estudiantes reales de esta sección en la BD
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM estudiantes
         WHERE curso = ? AND seccion = ? AND archivado = 0`,
        [gradoBD, sec]
      );
      const inscritos = Number(total);

      for (const materia of lvl.materias) {
        const nombreCurso = `${materia} — ${aulaLabel}`;
        const profesor    = nextMaestro();
        const horario     = HORARIOS[lvl.materias.indexOf(materia) % HORARIOS.length];

        // Verificar si ya existe
        const [[existe]] = await pool.query(
          "SELECT id FROM cursos WHERE nombre = ? AND aula = ?",
          [nombreCurso, aulaLabel]
        );

        if (existe) {
          // Actualizar maestro e inscritos sin borrar
          await pool.query(
            `UPDATE cursos SET profesor = ?, horario = ?, capacidad = ? WHERE id = ?`,
            [profesor, horario, inscritos, existe.id]
          );
          console.log(`   🔄 Actualizado: [${aulaLabel}] ${materia} → ${profesor} (${inscritos} alumnos)`);
        } else {
          await pool.query(
            `INSERT INTO cursos (nombre, profesor, aula, horario, capacidad, activo)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [nombreCurso, profesor, aulaLabel, horario, inscritos]
          );
          console.log(`   ✅ Insertado: [${aulaLabel}] ${materia} → ${profesor} (${inscritos} alumnos)`);
          totalInsertados++;
        }
      }
    }
  }

  console.log(`\n🎉 Sembrado completado. ${totalInsertados} cursos nuevos registrados.`);

  // Resumen por nivel
  console.log("\n📊 RESUMEN POR SECCIÓN:");
  for (const lvl of NIVELES) {
    for (const sec of lvl.secciones) {
      const aulaLabel = `${lvl.nivel} ${sec}`;
      const gradoBD   = lvl.grado;
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM estudiantes WHERE curso = ? AND seccion = ? AND archivado = 0`,
        [gradoBD, sec]
      );
      const inscritos  = Number(total);
      const disponibles = Math.max(0, lvl.cupoTotal - inscritos);
      console.log(
        `   ${aulaLabel.padEnd(12)} | Cupo: ${String(lvl.cupoTotal).padEnd(3)} | Inscritos: ${String(inscritos).padEnd(3)} | Disponibles: ${disponibles}`
      );
    }
  }

  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Error durante el sembrado:", err);
  process.exit(1);
});
