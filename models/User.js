const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      text: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      text: true,
    },
    password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      default: null,
      text: true,
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    otp: {
      type: String,
      required: true,
      maxlength: 6,
      minlength: 6,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
