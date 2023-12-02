const Chat = require("../models/Chat");
const User = require("../models/User");

/**
 * Create or fetch a 1v1 chat
 * @route /api/chat/
 * @method POST
 */
module.exports.createChat = async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) throw Error("userId param not sent with request");

    var exists = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    exists = await User.populate(exists, {
      path: "latestMessage.sender",
      select: "name email",
    });

    if (exists.length > 0) {
      res.status(200).send(exists[0]);
    } else {
      try {
        const chat = await Chat.create({
          isGroupChat: false,
          users: [req.user._id, userId],
          chatName: "sender",
        });

        const fullChat = await Chat.findOne({ _id: chat._id }).populate(
          "users",
          "-password"
        );

        res.status(200).send(fullChat);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get all chats of a user
 * @route /api/chat/
 * @method GET
 */
module.exports.getChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email",
        });
        res.status(200).json(results);
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Create a group chat
 * @route /api/chat/group
 * @method POST
 */
module.exports.createGroup = async (req, res) => {
  // var { users, chatName } = req.body;
  try {
    if (!req.body.users || !req.body.name) throw Error("All fields are required");
    var users = JSON.parse(req.body.users);
    users.push(req.user);
    if (users.length < 2) throw Error("More than 2 members are required to form a group");

    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send(fullGroupChat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Rename a group chat
 * @route /api/chat/group/update
 * @method PUT
 */
module.exports.renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    if (!chatId || !chatName) throw Error("Missing fields (ID or name)");

    const newChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(newChat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Add user to a group chat
 * @route /api/chat/group/add
 * @method PUT
 */
module.exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    if (!chatId || !userId) throw Error("Missing fields (userId or chatId)");

    const newChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(newChat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Remove user to a group chat
 * @route /api/chat/group/remove
 * @method PUT
 */
module.exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    if (!chatId || !userId) throw Error("Missing fields (userId or chatId)");

    const newChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(newChat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
