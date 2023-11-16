const express = require("express");
const router = express.Router();
const { loginUser, signupUser, getAllUsers } = require("../controllers/authController");
const requireAuth = require("../middleware/requireAuth");

// Login route
router.post("/login", loginUser);

// Signup route
router.post("/signup", signupUser);

// Middleware for getting all users
router.use("/allUser", requireAuth);

// Get all users
router.get("/allUser", getAllUsers);

module.exports = router;
