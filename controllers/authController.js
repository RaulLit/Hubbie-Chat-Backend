const User = require("../models/User");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "7d" });
};

/**
 * Log a user in
 * @route /api/user/login
 * @method POST
 */
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

    res.status(200).json({ _id: user._id, name: user.name, email, token });
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ error: err.message });
  }
};

/**
 * Sign up a user
 * @route /api/user/signup
 * @method POST
 */
const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  const isStrongOptions = {
    minUppercase: 0,
    minSymbols: 0,
  };

  try {
    // Validation
    if (!email || !password || !name) throw Error("All fields are required");
    if (!validator.isEmail(email)) throw Error("Email is not valid");
    if (!validator.isStrongPassword(password, isStrongOptions))
      throw Error("Password not strong enough");

    // Check if email already registered
    const exist = await User.findOne({ email });
    if (exist) throw Error("Email already in use");

    // Hashing
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hash });

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ _id: user._id, name, email, token });
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ error: err.message });
  }
};

/**
 * Get users on search
 * @route /api/user/allUser?search=
 * @method GET
 */
const getAllUsers = async (req, res) => {
  const q = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(q)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");
  res.json(users);
};

module.exports = { loginUser, signupUser, getAllUsers };
