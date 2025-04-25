const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/userController");

// Get all users
router.get("/allUser", getAllUsers);

module.exports = router;
