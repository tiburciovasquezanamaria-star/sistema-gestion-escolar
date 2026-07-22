const { getPool } = require("../db");

class StudentService {
    validateStudent(data) {
        const { nombre, matricula, correo, tipo, horasPlanificadas } = data;

        if (!tipo || !["Estudiante", "Profesor"].includes(tipo)) {
            return { success: false, message: "El tipo debe ser Estudiante o Profesor" };
        }

        if (!nombre || nombre.trim() === "") {
            return { success: false, message: "El nombre es obligatorio" };
        }

        if (!matricula || matricula.trim() === "") {
            return { success: false, message: "La matrícula es obligatoria" };
        }

        if (!correo || correo.trim() === "") {
            return { success: false, message: "El correo es obligatorio" };
        }

        if (tipo === "Profesor") {
            const horas = Number(horasPlanificadas);
            if (!horasPlanificadas || isNaN(horas) || horas <= 0) {
                return { success: false, message: "Las horas planificadas son obligatorias y deben ser un número válido" };
            }
        }

        return { success: true };
    }

    async createStudent(data) {
        const validation = this.validateStudent(data);

        if (!validation.success) {
            return validation;
        }

        const pool = getPool();
        // Escribir directo en 'estudiantes' (tabla real, no la vista)
        const [result] = await pool.execute(
            `INSERT INTO estudiantes (tipo, nombre, matricula, correo, horasPlanificadas) VALUES (?, ?, ?, ?, ?)`,
            [
                data.tipo || "Estudiante",
                data.nombre.trim(),
                data.matricula.trim(),
                data.correo.trim(),
                data.tipo === "Profesor" ? Number(data.horasPlanificadas) : null,
            ]
        );

        return {
            success: true,
            message: `${data.tipo || "Estudiante"} registrado correctamente`,
            student: {
                id: result.insertId,
                tipo: data.tipo || "Estudiante",
                nombre: data.nombre.trim(),
                matricula: data.matricula.trim(),
                correo: data.correo.trim(),
                horasPlanificadas: data.tipo === "Profesor" ? Number(data.horasPlanificadas) : null,
            },
        };
    }

    async getStudents() {
        const pool = getPool();
        // Leer desde la vista 'personas'
        const [rows] = await pool.execute(
            `SELECT id, tipo, nombre, matricula, correo, horasPlanificadas, archivado FROM personas ORDER BY id DESC`
        );

        return {
            success: true,
            students: rows,
        };
    }

    async archiveStudent(id) {
        const pool = getPool();
        // Escribir directo en 'estudiantes'
        const [result] = await pool.execute(
            `UPDATE estudiantes SET archivado = 1 WHERE id = ?`,
            [Number(id)]
        );

        if (result.affectedRows === 0) {
            return { success: false, message: "Registro no encontrado" };
        }

        return { success: true, message: "Registro archivado correctamente" };
    }

    async unarchiveStudent(id) {
        const pool = getPool();
        const [result] = await pool.execute(
            `UPDATE estudiantes SET archivado = 0 WHERE id = ?`,
            [Number(id)]
        );

        if (result.affectedRows === 0) {
            return { success: false, message: "Registro no encontrado" };
        }

        return { success: true, message: "Registro desarchivado correctamente" };
    }

    async deleteStudent(id) {
        const pool = getPool();
        const [result] = await pool.execute(`DELETE FROM estudiantes WHERE id = ?`, [Number(id)]);

        if (result.affectedRows === 0) {
            return { success: false, message: "Registro no encontrado" };
        }

        return { success: true, message: "Registro eliminado correctamente" };
    }
}

module.exports = new StudentService();