const { getPool } = require("../db");

async function getAllCourses() {
  const pool = getPool();
  const [rows] = await pool.query("SELECT * FROM cursos ORDER BY id ASC");
  return rows;
}

async function createCourse({ nombre, profesor, aula, horario, inscritos }) {
  const pool = getPool();
  const [result] = await pool.query(
    "INSERT INTO cursos (nombre, profesor, aula, horario, capacidad) VALUES (?, ?, ?, ?, ?)",
    [nombre, profesor, aula, horario, inscritos ?? 0]
  );
  const [rows] = await pool.query("SELECT * FROM cursos WHERE id = ?", [result.insertId]);
  return rows[0];
}

async function updateCourse(id, { nombre, profesor, aula, horario, inscritos }) {
  const pool = getPool();
  await pool.query(
    "UPDATE cursos SET nombre = ?, profesor = ?, aula = ?, horario = ?, capacidad = ? WHERE id = ?",
    [nombre, profesor, aula, horario, inscritos ?? 0, id]
  );
  const [rows] = await pool.query("SELECT * FROM cursos WHERE id = ?", [id]);
  return rows[0];
}

async function deleteCourse(id) {
  const pool = getPool();
  const [result] = await pool.query("DELETE FROM cursos WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { getAllCourses, createCourse, updateCourse, deleteCourse };
