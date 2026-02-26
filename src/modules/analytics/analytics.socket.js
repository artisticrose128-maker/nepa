// analytics.socket.js

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Analytics client connected");

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  });
};