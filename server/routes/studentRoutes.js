const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/students", (req, res) => {
    studentController.registerStudent(req, res);
});

module.exports = router;