const studentService = require("../services/studentService");

class StudentController {

    registerStudent(req, res) {
        const result = studentService.createStudent(req.body);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    }
}

module.exports = new StudentController();