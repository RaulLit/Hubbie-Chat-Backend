const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Send a message
 * @route /api/message/
 * @method POST
 */
module.exports.sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  try {
    // Validate
    if (!chatId || !content) {
      console.log("Invalid request body");
      throw Error("Invalid Request: Parameters missing");
    }

    const chatInfo = await Chat.findById(chatId);
    if (!chatInfo) {
      throw Error("Chat not found");
    }
    const isMember = chatInfo.users.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: "Access denied: You are not a member of this chat" });
    }
    const newMessage = {
      sender: req.user._id,
      content,
      chat: chatId,
      readBy: [req.user._id],
    };
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.status(200).json(message);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Retrieve messages of a chat
 * @route /api/message/:chatId
 * @method GET
 */
module.exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chatInfo = await Chat.findById(chatId);
    if (!chatInfo) {
      throw Error("Chat not found");
    }
    const isMember = chatInfo.users.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: "Access denied: You are not a member of this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("chat");
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Mark messages in a chat as read
 * @route /api/message/read
 * @method PUT
 */
module.exports.readMessages = async (req, res) => {
  const { chatId } = req.body;
  try {
    if (!chatId) throw Error("chatId is required");

    const chatInfo = await Chat.findById(chatId);
    if (!chatInfo) throw Error("Chat not found");

    const isMember = chatInfo.users.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: "Access denied: You are not a member of this chat" });
    }

    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({ status: "success", message: "Messages marked as read" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
