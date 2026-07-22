const courseService = require("../services/courseService");

async function getCourses(req, res) {
  try {
    const courses = await courseService.getAllCourses();
    // Map `capacidad` DB column → `inscritos` for frontend compatibility
    const mapped = courses.map(c => ({ ...c, inscritos: c.capacidad ?? 0 }));
    res.json({ success: true, courses: mapped });
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    res.status(500).json({ success: false, error: "Error al obtener cursos" });
  }
}

async function addCourse(req, res) {
  try {
    const { nombre, profesor, aula, horario, inscritos } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, error: "El nombre del curso es obligatorio" });
    }
    const newCourse = await courseService.createCourse({ nombre, profesor, aula, horario, inscritos });
    res.status(201).json({ success: true, course: { ...newCourse, inscritos: newCourse.capacidad ?? 0 } });
  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({ success: false, error: "Error al crear curso" });
  }
}

async function editCourse(req, res) {
  try {
    const { id } = req.params;
    const { nombre, profesor, aula, horario, inscritos } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, error: "El nombre del curso es obligatorio" });
    }
    const updated = await courseService.updateCourse(id, { nombre, profesor, aula, horario, inscritos });
    res.json({ success: true, course: { ...updated, inscritos: updated.capacidad ?? 0 } });
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    res.status(500).json({ success: false, error: "Error al actualizar curso" });
  }
}

async function removeCourse(req, res) {
  try {
    const { id } = req.params;
    const success = await courseService.deleteCourse(id);
    if (success) {
      res.json({ success: true, message: "Curso eliminado con éxito" });
    } else {
      res.status(404).json({ success: false, error: "Curso no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    res.status(500).json({ success: false, error: "Error al eliminar curso" });
  }
}

// Conteo real de inscritos por sección desde la tabla `estudiantes`
async function getSeccionCupos(req, res) {
  try {
    const pool = require("../db").getPool();
    const NIVEL_MAP = {
      "Inicial": "Inicial",
      "1ro": "1er Grado",
      "2do": "2do Grado",
      "3ro": "3er Grado",
      "4to": "4to Grado",
      "5to": "5to Grado",
      "6to": "6to Grado",
    };
    const CUPOS = { Inicial: 30, "1ro": 38, "2do": 38, "3ro": 38, "4to": 38, "5to": 38, "6to": 38 };
    const result = [];
    for (const [nivel, grado] of Object.entries(NIVEL_MAP)) {
      for (const sec of ["A", "B"]) {
        const [[fem]] = await pool.query(
          `SELECT COUNT(*) AS total FROM estudiantes WHERE curso=? AND seccion=? AND sexo='Femenino' AND archivado=0`,
          [grado, sec]
        );
        const [[masc]] = await pool.query(
          `SELECT COUNT(*) AS total FROM estudiantes WHERE curso=? AND seccion=? AND sexo='Masculino' AND archivado=0`,
          [grado, sec]
        );
        const inscritos = fem.total + masc.total;
        // Maestro encargado (el primer curso de esa sección)
        const [[maestroRow]] = await pool.query(
          `SELECT profesor FROM cursos WHERE aula=? LIMIT 1`,
          [`${nivel} ${sec}`]
        );
        result.push({
          nivel,
          seccion: sec,
          aula: `${nivel} ${sec}`,
          cupoTotal: CUPOS[nivel],
          inscritos,
          femenino: fem.total,
          masculino: masc.total,
          disponibles: Math.max(0, CUPOS[nivel] - inscritos),
          maestro: maestroRow?.profesor || null,
        });
      }
    }
    res.json({ success: true, secciones: result });
  } catch (error) {
    console.error("Error al obtener cupos por sección:", error);
    res.status(500).json({ success: false, error: "Error al obtener cupos por sección" });
  }
}

// Cambiar el maestro encargado de un curso
async function updateMaestro(req, res) {
  try {
    const { id } = req.params;
    const { profesor } = req.body;
    if (!profesor || !profesor.trim()) {
      return res.status(400).json({ success: false, error: "Nombre del maestro requerido" });
    }
    const pool = require("../db").getPool();
    await pool.query("UPDATE cursos SET profesor = ? WHERE id = ?", [profesor.trim(), id]);
    res.json({ success: true, message: "Maestro actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar maestro:", error);
    res.status(500).json({ success: false, error: "Error al actualizar maestro" });
  }
}

module.exports = { getCourses, addCourse, editCourse, removeCourse, getSeccionCupos, updateMaestro };
