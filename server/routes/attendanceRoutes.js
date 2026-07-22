const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/attendance", authMiddleware, attendanceController.getAttendance);
router.post("/attendance", authMiddleware, attendanceController.registerAttendance);

module.exports = router;
