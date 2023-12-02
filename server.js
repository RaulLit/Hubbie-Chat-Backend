require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

// express app
const app = express();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://hubbie-chat.onrender.com",
      process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT || 4000, () => {
      console.log("Connected to db & running on port", process.env.PORT || 4000);
    });
  })
  .catch((err) => console.log(err));
