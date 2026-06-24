const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw Error("Request not authorized");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw Error("Auth token expired");
      }
      throw Error("Invalid token");
    }

    req.user = await User.findById(decoded._id).select("-password");
    if (!req.user) throw Error("User not found");

    next();
  } catch (err) {
    console.log("Auth error:", err.message);
    res.status(401).json({ status: "error", message: err.message });
  }
};

module.exports = requireAuth;
