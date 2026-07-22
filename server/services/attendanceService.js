const { getPool } = require("../db");

async function getAttendanceByDateGradeAndSection(fecha, curso, seccion) {
  const pool = getPool();
  // Devuelve la lista de estudiantes del curso/sección especificado con su asistencia (si existe) para esa fecha
  const [rows] = await pool.query(
    `SELECT e.id AS estudiante_id, e.nombre, e.matricula, e.sexo, e.curso, e.seccion,
            a.estado, a.fecha, a.maestro_id
     FROM estudiantes e
     LEFT JOIN asistencias a ON e.id = a.estudiante_id AND a.fecha = ?
     WHERE e.tipo = 'Estudiante' AND e.archivado = 0 AND e.curso = ? AND e.seccion = ?
     ORDER BY e.nombre ASC`,
    [fecha, curso, seccion]
  );
  return rows;
}

async function saveAttendance(records) {
  const pool = getPool();
  for (const r of records) {
    const { estudiante_id, fecha, estado, curso, seccion, maestro_id } = r;
    
    await pool.query(
      `INSERT INTO asistencias (estudiante_id, fecha, estado, curso_grado, seccion, maestro_id) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE estado = ?, curso_grado = ?, seccion = ?, maestro_id = ?`,
      [
        estudiante_id, 
        fecha, 
        estado, 
        curso, 
        seccion, 
        maestro_id || null, 
        estado, 
        curso, 
        seccion, 
        maestro_id || null
      ]
    );
  }
  return { success: true };
}

module.exports = { getAttendanceByDateGradeAndSection, saveAttendance };
