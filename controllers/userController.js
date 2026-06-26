const User = require("../models/User");

/**
 * Get users on search
 * @route /api/user/allUser
 * @method GET
 * @query search
 */
module.exports.getAllUsers = async (req, res) => {
  try {
    const search = req.query.search;
    const q = search
      ? {
          $or: [
            { name: { $regex: search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), $options: "i" } },
            { email: { $regex: search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(q)
      .find({ _id: { $ne: req.user._id } })
      .select("-password");
    if (!users) throw Error("No users found");

    res
      .status(200)
      .json({ status: "success", data: users, message: "Users fetched successfuly" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
