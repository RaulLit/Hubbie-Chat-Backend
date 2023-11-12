require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(process.env.MONGO_URI).then((e) => {
  app.listen(process.env.PORT || 4000, () => {
    console.log("Connected to db & listening on port", process.env.PORT || 4000);
  });
});
