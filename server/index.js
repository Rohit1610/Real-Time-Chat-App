import express from "express";
import { Server } from "socket.io";
import path from "path";
//const path = require("path");
import { fileURLToPath } from "url";

// es js syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : // if env=="development"
          ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  // socket.emit for the only user connected
  socket.emit("message", "Welcome to the Chat App");
  // on connection to all expcept to the user
  socket.broadcast.emit(
    "message",
    `User ${socket.id.substring(0, 5)} connected`
  );
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
  });
  // disconnect
  socket.on("disconnect", () => {
    socket.broadcast.emit(
      "message",
      `User ${socket.id.substring(0, 5)} disconnected`
    );
  });

  // activity
  socket.on("activity", (name) => {
    socket.broadcast.emit("activity", name);
  });
});
