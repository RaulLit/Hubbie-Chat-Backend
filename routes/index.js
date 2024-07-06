const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const chatRoutes = require("./chatRoutes");
const messageRoutes = require("./messageRoutes");
const requireAuth = require("../middleware/requireAuth");

const initRoutes = (app) => {
  // Initialising routes
  app.use("/api/auth", authRoutes);

  // Protected routes
  app.use("/api/user", requireAuth, userRoutes);
  app.use("/api/chat", requireAuth, chatRoutes);
  app.use("/api/message", requireAuth, messageRoutes);
};

module.exports = initRoutes;
