const gradeService = require("../services/gradeService");

async function getGrades(req, res) {
  try {
    const grades = await gradeService.getAllGrades();
    res.json({ success: true, grades });
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    res.status(500).json({ success: false, error: "Error al obtener calificaciones" });
  }
}

async function addGrade(req, res) {
  try {
    const { estudiante_id, materia, calificacion, periodo } = req.body;
    if (!estudiante_id || !materia || calificacion === undefined || !periodo) {
      return res.status(400).json({ success: false, error: "Todos los campos son obligatorios" });
    }
    const newGrade = await gradeService.createGrade({ estudiante_id, materia, calificacion, periodo });
    res.status(210).json({ success: true, grade: newGrade });
  } catch (error) {
    console.error("Error al registrar calificación:", error);
    res.status(500).json({ success: false, error: "Error al registrar calificación" });
  }
}

async function editGrade(req, res) {
  try {
    const { id } = req.params;
    const { estudiante_id, materia, calificacion, periodo } = req.body;
    if (!estudiante_id || !materia || calificacion === undefined || !periodo) {
      return res.status(400).json({ success: false, error: "Todos los campos son obligatorios" });
    }
    const updated = await gradeService.updateGrade(id, { estudiante_id, materia, calificacion, periodo });
    res.json({ success: true, grade: updated });
  } catch (error) {
    console.error("Error al actualizar calificación:", error);
    res.status(500).json({ success: false, error: "Error al actualizar calificación" });
  }
}

async function removeGrade(req, res) {
  try {
    const { id } = req.params;
    const success = await gradeService.deleteGrade(id);
    if (success) {
      res.json({ success: true, message: "Calificación eliminada con éxito" });
    } else {
      res.status(404).json({ success: false, error: "Calificación no encontrada" });
    }
  } catch (error) {
    console.error("Error al eliminar calificación:", error);
    res.status(500).json({ success: false, error: "Error al eliminar calificación" });
  }
}

module.exports = { getGrades, addGrade, editGrade, removeGrade };
