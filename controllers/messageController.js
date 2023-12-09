const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Remove user from a group chat
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
    const newMessage = {
      sender: req.user._id,
      content,
      chat: chatId,
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
 * Remove user from a group chat
 * @route /api/message/:chatId
 * @method GET
 */
module.exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("chat");
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
