const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  // verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET, (err, result) => {
      if (err && err.name === "TokenExpiredError") return "Token expired";
      return result;
    });

    if (decoded === "Token expired")
      return res.json({ status: "error", message: "Auth token expired" });
    req.user = await User.findOne({ _id: decoded._id }).select("-password");
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
