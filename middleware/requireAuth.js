const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw Error("Request not authorized");
    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
      if (err && err.name === "TokenExpiredError") return "Token expired";
      return result;
    });
    if (!decoded) throw Error("Invalid token");
    if (decoded === "Token expired") throw Error("Auth token expired");
    req.user = await User.findById(decoded._id).select("-password");
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: "error", message: err.message });
  }
};

module.exports = requireAuth;
