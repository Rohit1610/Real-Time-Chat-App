const ws = require("ws");
// instance of ws
const server = new ws.Server({ port: "3000" });

server.on("connection", (socket) => {
  socket.on("message", (message) => {
    // buffer for binary data
    const b = Buffer.from(message);
    console.log(b.toString());
    socket.send(`${message}`);
  });
});
