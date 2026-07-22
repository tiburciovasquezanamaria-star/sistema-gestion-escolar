const attendanceService = require("../services/attendanceService");

async function getAttendance(req, res) {
  try {
    const { fecha, curso, seccion } = req.query;
    if (!fecha || !curso || !seccion) {
      return res.status(400).json({ success: false, error: "Fecha, curso y sección son requeridos" });
    }
    const list = await attendanceService.getAttendanceByDateGradeAndSection(fecha, curso, seccion);
    res.json({ success: true, attendance: list });
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    res.status(500).json({ success: false, error: "Error al obtener asistencia" });
  }
}

async function registerAttendance(req, res) {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: "Se requiere una lista de registros en 'records'" });
    }
    await attendanceService.saveAttendance(records);
    res.json({ success: true, message: "Asistencia registrada correctamente en MySQL" });
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({ success: false, error: "Error al registrar asistencia" });
  }
}

module.exports = { getAttendance, registerAttendance };
