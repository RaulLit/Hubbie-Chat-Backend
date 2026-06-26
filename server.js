require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// Convert _id to id when serializing documents to JSON/Objects
mongoose.plugin((schema) => {
  const transform = (doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    delete ret.__v;
    return ret;
  };
  schema.set("toJSON", { virtuals: true, transform });
  schema.set("toObject", { virtuals: true, transform });
});

const cors = require("cors");
const cookieParser = require("cookie-parser");
const initRoutes = require("./routes");
const { initialize } = require("./sockets");

// express app
const app = express();

// cors config (required for express and socket)
const corsConfig = {
  origin: [...process.env.CLIENT_URL.split(","), "http://localhost:3000"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
};

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsConfig));
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
initRoutes(app);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // Start server
    const express_server = app.listen(process.env.PORT || 4000, () => {
      console.log("Connected to db & running on port", process.env.PORT || 4000);
    });

    // Initialise socket.io
    initialize(express_server, corsConfig);

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`${signal} received. Closing HTTP and database connections...`);
      express_server.close(() => {
        console.log("HTTP server closed.");
        mongoose.connection.close().then(() => {
          console.log("Mongoose connection closed.");
          process.exit(0);
        });
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  })
  .catch((err) => console.log(err));
