const User = require("../models/User");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "7d" });
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validation
    if (!email || !password) throw Error("All fields are required");

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) throw Error(`User with email '${email}' not found`);

    // Match password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw Error("Incorrect password");

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Signup user
const signupUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) throw Error("All fields are required");
    if (!validator.isEmail(email)) throw Error("Email is not valid");
    if (!validator.isStrongPassword(password)) throw Error("Password not strong enough");

    // Check if email already registered
    const exist = await User.findOne({ email });
    if (exist) throw Error("Email already in use");

    // Hashing
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hash });

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { loginUser, signupUser };
