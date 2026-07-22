const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/gradeController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/grades", authMiddleware, gradeController.getGrades);
router.post("/grades", authMiddleware, gradeController.addGrade);
router.put("/grades/:id", authMiddleware, gradeController.editGrade);
router.delete("/grades/:id", authMiddleware, gradeController.removeGrade);

module.exports = router;
