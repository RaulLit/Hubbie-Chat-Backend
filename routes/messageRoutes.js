const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { sendMessage, getMessages, readMessages } = require("../controllers/messageController");

// Require Authentication for all routes
router.use(requireAuth);

// Send messages
router.post("/", sendMessage);

// Mark messages as read
router.put("/read", readMessages);

// Retrive messages
router.get("/:chatId", getMessages);

module.exports = router;
