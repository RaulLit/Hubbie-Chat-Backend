const { Server } = require("socket.io");

const initialize = (exp_server, corsConfig) => {
  const io = new Server(exp_server, { pingTimeout: 120000, cors: { ...corsConfig } });

  io.on("connection", (socket) => {
    // online socket
    socket.on("setup", (user) => {
      socket.join(user._id);
      socket.emit("connected");
    });

    // opening chat socket
    socket.on("join_chat", (room) => {
      socket.join(room);
    });

    // typing socket
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("typing_stopped", (room) => socket.in(room).emit("typing_stopped"));

    // new message socket
    socket.on("new_msg", (rx_msg) => {
      var chat = rx_msg.chat;
      if (!chat.users) return console.log("chat.users not defined", rx_msg);

      chat.users.forEach((user) => {
        if (user._id == rx_msg.sender._id) return;

        socket.in(user._id).emit("msg_rxd", rx_msg);
      });
    });

    // disconnet socket
    socket.off("setup", () => {
      socket.leave(user._id);
    });
  });
};

module.exports = { initialize };
