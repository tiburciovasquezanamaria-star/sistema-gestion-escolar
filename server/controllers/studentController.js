const studentService = require("../services/studentService");

class StudentController {

    async listStudents(req, res) {
        try {
            const result = await studentService.getStudents();
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Error al obtener los registros" });
        }
    }

    async registerStudent(req, res) {
        try {
            const result = await studentService.createStudent(req.body);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.status(201).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Error al registrar el registro" });
        }
    }

    async deleteStudent(req, res) {
        try {
            const { id } = req.params;
            const result = await studentService.deleteStudent(id);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Error al eliminar el registro" });
        }
    }

    async archiveStudent(req, res) {
        try {
            const { id } = req.params;
            const result = await studentService.archiveStudent(id);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Error al archivar el registro" });
        }
    }

    async unarchiveStudent(req, res) {
        try {
            const { id } = req.params;
            const result = await studentService.unarchiveStudent(id);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Error al desarchivar el registro" });
        }
    }
}

module.exports = new StudentController();