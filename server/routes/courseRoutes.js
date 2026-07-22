const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/courses/seccion-cupos", authMiddleware, courseController.getSeccionCupos);
router.get("/courses", authMiddleware, courseController.getCourses);
router.post("/courses", authMiddleware, courseController.addCourse);
router.put("/courses/:id", authMiddleware, courseController.editCourse);
router.put("/courses/:id/maestro", authMiddleware, courseController.updateMaestro);
router.delete("/courses/:id", authMiddleware, courseController.removeCourse);

module.exports = router;
