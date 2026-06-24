const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Chat = require("./models/Chat");

const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(";").reduce((res, c) => {
    const parts = c.trim().split("=");
    if (parts.length >= 2) {
      const key = parts[0];
      const val = parts.slice(1).join("=");
      try {
        res[key] = decodeURIComponent(val);
      } catch {
        res[key] = val;
      }
    }
    return res;
  }, {});
};

const initialize = (exp_server, corsConfig) => {
  const io = new Server(exp_server, { pingTimeout: 120000, cors: { ...corsConfig } });

  // Middleware to authenticate Socket connection using JWT cookie
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      const cookies = parseCookies(cookieHeader);
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.log("Socket Auth Error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // online socket
    socket.on("setup", (user) => {
      if (!user || user._id !== socket.user._id) {
        return console.log("Unauthorized setup room request");
      }
      socket.join(socket.user._id);
      socket.emit("connected");
    });

    // opening chat socket
    socket.on("join_chat", async (room) => {
      try {
        const chat = await Chat.findById(room);
        if (!chat) {
          return console.log("Chat room not found:", room);
        }
        const isMember = chat.users.some(
          (userId) => userId.toString() === socket.user._id.toString()
        );
        if (!isMember) {
          return console.log("Unauthorized attempt to join chat room:", room);
        }
        socket.join(room);
      } catch (err) {
        console.log("Error joining chat room:", err.message);
      }
    });

    // typing socket
    socket.on("typing", (room) => {
      if (socket.rooms.has(room)) {
        socket.in(room).emit("typing");
      }
    });
    
    socket.on("typing_stopped", (room) => {
      if (socket.rooms.has(room)) {
        socket.in(room).emit("typing_stopped");
      }
    });

    // new message socket
    socket.on("new_msg", (rx_msg) => {
      if (!rx_msg.sender || rx_msg.sender._id !== socket.user._id) {
        return console.log("Unauthorized message sender identity");
      }

      var chat = rx_msg.chat;
      if (!chat || !chat.users) return console.log("chat.users not defined", rx_msg);

      // Verify sender is in the chat list
      const isMember = chat.users.some(
        (u) => (u._id || u).toString() === socket.user._id.toString()
      );
      if (!isMember) {
        return console.log("Unauthorized sender in chat message broadcast");
      }

      chat.users.forEach((user) => {
        const targetUserId = (user._id || user).toString();
        if (targetUserId === socket.user._id.toString()) return;

        socket.in(targetUserId).emit("msg_rxd", rx_msg);
      });
    });

    // disconnect socket
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      socket.leave(socket.user._id);
    });
  });
};

module.exports = { initialize };
