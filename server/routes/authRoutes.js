const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes (no token required)
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);

// Protected routes (token required)
router.get("/auth/me", authMiddleware, authController.me);
router.post("/auth/change-password", authMiddleware, authController.changePassword);

module.exports = router;
