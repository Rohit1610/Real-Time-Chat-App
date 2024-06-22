import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} Connected`);
  socket.on("message", (data) => {
    // buffer for binary data
    // const b = Buffer.from(message);
    console.log(data);
    io.emit(`message`, `${socket.id.substring(0, 5)}${data}`);
  });
});

httpServer.listen(3500, () => console.log("listening on port 3500"));
