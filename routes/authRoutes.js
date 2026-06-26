const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  confirm,
  forgot,
  reset,
  resend,
  logout,
  verifiedUserExist,
  resetRequestExist,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", signup);
router.post("/confirm/:id", confirm);
router.post("/forgot", forgot);
router.post("/reset/:key", reset);
router.get("/resend/:id", resend);
router.get("/logout", logout);

// Verification routes
router.post("/verify/verifiedUserExist", verifiedUserExist);
router.post("/verify/resetRequestExist", resetRequestExist);

module.exports = router;
