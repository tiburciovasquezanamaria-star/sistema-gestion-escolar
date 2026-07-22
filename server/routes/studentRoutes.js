const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/students", authMiddleware, (req, res) => {
    studentController.listStudents(req, res);
});

router.post("/students", authMiddleware, (req, res) => {
    studentController.registerStudent(req, res);
});

router.delete("/students/:id", authMiddleware, (req, res) => {
    studentController.deleteStudent(req, res);
});

router.put("/students/:id/archive", authMiddleware, (req, res) => {
    studentController.archiveStudent(req, res);
});

router.put("/students/:id/unarchive", authMiddleware, (req, res) => {
    studentController.unarchiveStudent(req, res);
});

module.exports = router;