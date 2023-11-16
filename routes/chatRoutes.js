const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  createChat,
  getChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");

// Require Authentication for all routes
router.use(requireAuth);

// Create/fetch 1v1 chat
router.post("/", createChat);

// Get all chats of a user
router.get("/", getChats);

// Create group chat
router.post("/group", createGroup);
// Rename group chat
router.put("/group/update", renameGroup);
// Add to group chat
router.put("/group/add", addToGroup);
// Remove from group chat
router.put("/group/remove", removeFromGroup);

module.exports = router;
