require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { initialize } = require("./sockets");

// Routes
const userRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

// express app
const app = express();

// cors config
const corsConfig = {
  origin: [
    "http://localhost:3000",
    "https://hubbie-chat.onrender.com",
    process.env.CLIENT_URL,
  ],
  methods: ["GET", "POST", "DELETE", "PUT"],
};

// middleware
app.use(express.json());
app.use(cors(corsConfig));
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // Start server
    const express_server = app.listen(process.env.PORT || 4000, () => {
      console.log("Connected to db & running on port", process.env.PORT || 4000);
    });

    // Initialise socket.io
    initialize(express_server, corsConfig);
  })
  .catch((err) => console.log(err));
