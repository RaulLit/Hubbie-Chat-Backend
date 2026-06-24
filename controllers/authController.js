const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const {
  generateOTP,
  emailTemplateOTP,
  sendEmail,
  emailTemplateResetPassword,
} = require("../utility/utility");
const ResetPassword = require("../models/ResetPassword");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "30d" });
};

/**
 * Sign up a new user with given details
 * @route /api/auth/signup
 * @method GET
 * @body name, email, newPassword, confirmPassword
 */
module.exports.signup = async (req, res) => {
  try {
    // Validation checks
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.newPassword ||
      !req.body.confirmPassword
    )
      throw Error("All fields are required");
    if (!validator.isEmail(req.body.email)) throw Error("Invalid Email Address");

    if (req.body.newPassword !== req.body.confirmPassword)
      throw Error("Passwords do not match");
    // strong password validation options
    const isStrongOptions = {
      minUppercase: 1,
      minSymbols: 1,
      minLength: 6,
      minNumbers: 1,
    };
    if (!validator.isStrongPassword(req.body.newPassword, isStrongOptions))
      throw Error("Password not strong enough");

    // Check if email already registered
    const exist = await User.findOne({ email: req.body.email }).select("-password -otp");
    if (exist) throw Error("Email already in use");

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.newPassword,
      otp: generateOTP(),
    };

    // Hashing
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = await User.create(userData);

    // Send verification email
    const confirmLink = `${process.env.CLIENT_URL}/verify/${user.email}/${user._id}`;
    const message = emailTemplateOTP(user.name, user.otp, confirmLink);
    sendEmail(user.email, "Hubbie Chat - Account Verification", message)
      .then((info) => {
        if (info) {
          res.status(200).json({
            status: "success",
            data: { id: user._id, email: user.email },
            message: "User created and verification mail sent successfully",
          });
        } else {
          res.status(500).json({
            status: "error",
            message: "We cannot send you a verification email. Try again",
          });
        }
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({ status: "error", message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Log a user in
 * @route /api/auth/login
 * @method POST
 * @body email, password
 */
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) throw Error("All fields are required");
    if (!validator.isEmail(email)) throw Error("Invalid Email Address");

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) throw Error(`User with email '${email}' not found`);

    // Check if user is verfied
    // if (!user.verified)
    //   throw Error(
    //     "User not verified. Check your email and verify your account to continue."
    //   );
    if (!user.verified) {
      res
        .status(400)
        .json({ status: "error", data: { _id: user._id }, message: "User not verified" });
    } else {
      // Match password
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw Error("Incorrect password");

      // create a token
      const token = createToken(user._id);

      res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
      res.status(200).json({
        status: "success",
        data: { id: user._id, name: user.name, email: user.email },
        message: "User logged in successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Resends the account verification email
 * @route /api/auth/resend/:id
 * @param id
 * @method GET
 */
module.exports.resend = async (req, res) => {
  try {
    const id = req.params.id;
    if (!validator.isMongoId(id)) throw Error("Invalid Parameter");

    const user = await User.findOne({ _id: id, verified: false }).select("-password");
    if (!user) throw Error("No User Found");

    const confirmLink = `${process.env.CLIENT_URL}/verify/${user.email}/${user._id}`;
    const message = emailTemplateOTP(user.name, user.otp, confirmLink);
    sendEmail(user.email, "Hubbie Chat - Account Verification", message)
      .then((info) => {
        if (info) {
          res.status(200).json({
            status: "success",
            message: "Verification email sent successfully",
          });
        } else {
          throw Error("We cannot send you a verification email. Try again");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ status: "error", message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Verifies a user using OTP
 * @route /api/auth/confirm/:id
 * @param id (user id)
 * @method POST
 * @body otp
 */
module.exports.confirm = async (req, res) => {
  try {
    const id = req.params.id;
    const otp = req.body.otp;
    // Validation
    if (!otp) throw Error("All fields are necessary");
    if (!validator.isNumeric(otp, { no_symbols: true }) || otp.length != 6)
      throw Error("Not a valid OTP");
    if (!validator.isMongoId(id)) throw Error("Invalid parameter");

    const user = await User.findOne({ _id: id, verified: false }).select("-password");

    if (user) {
      if (user.otp === otp) {
        await User.findByIdAndUpdate(id, { otp: generateOTP(), verified: true });
        res.status(200).json({
          status: "success",
          message: "Account Verified Successfully. Login to continue.",
        });
      } else {
        res.status(400).json({ status: "error", message: "Incorrect OTP. Try again" });
      }
    } else if (!user) {
      res.status(200).json({ status: "error", message: "User Already Verified" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Sends an email for resetting the password
 * @route /api/auth/forgot
 * @method POST
 * @body email
 */
module.exports.forgot = async (req, res) => {
  try {
    const email = req.body.email;
    // Validations
    if (!email) throw Error("All fields are required");
    if (!validator.isEmail(email)) throw Error("Invalid email");

    // Check if user exists
    const user = await User.findOne({ email }).select("-password");
    if (!user) throw Error(`User '${email}' not found`);

    let resetPass = {
      userId: user._id,
      resetKey: crypto.randomBytes(32).toString("hex"),
    };

    const resetPassword = await ResetPassword.create(resetPass);

    if (resetPassword) {
      const resetLink = `${process.env.CLIENT_URL}/auth/reset/${resetPassword.resetKey}`;
      const message = emailTemplateResetPassword(user.name, resetLink);
      sendEmail(email, "Hubbie Chat - Password Reset Link", message)
        .then((info) => {
          if (info) {
            res.status(200).json({
              status: "success",
              message: "Check your email for Reset Password Link",
            });
          } else {
            res.status(400).json({
              status: "error",
              message: "We cannot send you a password reset email. Try again",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ status: "error", message: err.message });
        });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Resets account with new password
 * @route /api/auth/reset/:key
 * @method POST
 * @body newPassword, reNewPassword
 */
module.exports.reset = async (req, res) => {
  try {
    const key = req.params.key;
    const { newPassword, reNewPassword } = req.body;
    const resetPass = await ResetPassword.findOne({ resetKey: key, status: true });
    if (!resetPass) throw Error("No password reset request found");

    // strong password validation options
    const isStrongOptions = {
      minUppercase: 1,
      minSymbols: 1,
      minLength: 6,
      minNumbers: 1,
    };

    // Validation
    if (!newPassword || !reNewPassword) throw Error("All fields are required");
    if (!validator.isStrongPassword(newPassword, isStrongOptions))
      throw Error("Password not strong enough");
    if (newPassword !== reNewPassword) throw Error("Passwords did not match!");

    // Hashing
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(resetPass.userId, { password: hashPassword });
    await ResetPassword.findOneAndUpdate({ resetKey: key }, { status: false });

    res.status(200).json({
      status: "success",
      message: "Password changed successfully. Login to continue.",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Logs out the currently logged in user
 * @route /api/auth/logout
 * @method GET
 * @param none
 */
module.exports.logout = async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ status: "success", message: "User logged out successfully" });
};

/**
 * Checks if there exists a user to verify
 * @route /api/auth/verify/verifiedUserExist
 * @method POST
 * @body email, id
 */
module.exports.verifiedUserExist = async (req, res) => {
  try {
    const { email, id } = req.body;

    // Validations
    if (!email || !id) throw Error("Login to continue");
    if (!validator.isEmail(email)) throw Error("Invalid email");
    if (!validator.isMongoId(id)) throw Error("Invalid parameter");

    const user = await User.findOne({ _id: id, email, verified: false }).select(
      "-password"
    );
    if (!user) throw Error("Login to continue");

    res.status(200).json({ status: "success", message: "Enter OTP to verify" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Checks if the reset request exists for a user
 * @route /api/auth/verify/resetRequestExist
 * @method POST
 * @body key (mongoID)
 */
module.exports.resetRequestExist = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) throw Error("No request found");
    const resetPass = await ResetPassword.findOne({ resetKey: key, status: true });
    if (!resetPass) throw Error("No reset request found");

    res.status(200).json({ status: "success", message: "Set new password" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err.message });
  }
};