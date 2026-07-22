const { getPool } = require("../db");

async function getAllGrades() {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT n.id, n.estudiante_id, n.materia, n.calificacion, n.periodo,
           e.nombre AS estudiante_nombre, e.matricula
    FROM notas n
    LEFT JOIN estudiantes e ON n.estudiante_id = e.id
    ORDER BY n.id ASC
  `);
  return rows;
}

async function createGrade({ estudiante_id, materia, calificacion, periodo }) {
  const pool = getPool();
  const [result] = await pool.query(
    "INSERT INTO notas (estudiante_id, materia, calificacion, periodo) VALUES (?, ?, ?, ?)",
    [estudiante_id, materia, parseFloat(calificacion), periodo]
  );
  const [rows] = await pool.query(`
    SELECT n.id, n.estudiante_id, n.materia, n.calificacion, n.periodo,
           e.nombre AS estudiante_nombre, e.matricula
    FROM notas n
    LEFT JOIN estudiantes e ON n.estudiante_id = e.id
    WHERE n.id = ?
  `, [result.insertId]);
  return rows[0];
}

async function updateGrade(id, { estudiante_id, materia, calificacion, periodo }) {
  const pool = getPool();
  await pool.query(
    "UPDATE notas SET estudiante_id = ?, materia = ?, calificacion = ?, periodo = ? WHERE id = ?",
    [estudiante_id, materia, parseFloat(calificacion), periodo, id]
  );
  const [rows] = await pool.query(`
    SELECT n.id, n.estudiante_id, n.materia, n.calificacion, n.periodo,
           e.nombre AS estudiante_nombre, e.matricula
    FROM notas n
    LEFT JOIN estudiantes e ON n.estudiante_id = e.id
    WHERE n.id = ?
  `, [id]);
  return rows[0];
}

async function deleteGrade(id) {
  const pool = getPool();
  const [result] = await pool.query("DELETE FROM notas WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { getAllGrades, createGrade, updateGrade, deleteGrade };
