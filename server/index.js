import express from "express";
import { Server } from "socket.io";
import path from "path";
//const path = require("path");
import { fileURLToPath } from "url";

// es js syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const ADMIN = "Admin";
const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const UsersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};
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
  socket.emit("message", buildMsg(ADMIN, "WELCOME TO THE CHAT APP!"));

  //
  socket.emit("enterRoom", ({ name, text }) => {
    const prevroom = getUser(socket.id)?.room;
    if (prevroom) {
      socket.leave(prevroom);
      io.to(prevroom).emit(
        "message",
        buildMsg(ADMIN, `${name} has left the chat room`)
      );
    }
    const user = activateUser(socket.id, name, room);
    // update the prevroom users list
    if (prevroom) {
      io.to(prevroom).emit("userList", { users: getUsersInRoom(prevRoom) });
    }
    socket.join(user.room);
    // to only the user
    socket.emit(
      "message",
      buildMsg(ADMIN, `You have joined the ${user.room} chat room `)
    );

    // to other users in the users room
    socket.broadcast
      .to(user.room)
      .emit("message", buildMsg(ADMIN, `${user.name} has joined the room`));
    // update the new room user list
    io.to(user.room).emit("userList", {
      users: getUsersInRoom(user.room),
    });

    // Update rooms list for everyone
    io.emit("roomList", {
      rooms: getAllActiveRooms(),
    });
  });
  // disconnect
  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    userLeaves(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        buildMsg(ADMIN, `${user.name} has left the room`)
      );
      io.to(user.room).emit("userList", {
        users: getUserinRoom(user.room),
      });
      io.emit("roomList", {
        rooms: getAllActiveRooms(),
      });
    }
  });
  // msg
  socket.on("message", ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      io.to(room).emit("message", buildMsg(name, text));
    }
  });
  // activity

  socket.on("activity", (name) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}
function activateUser(id, name, room) {
  const user = { id, name, room };
  // filter array -> return the array meeting the cond in callback function
  // ... spread operator for filtering and adding new user
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeaves(id) {
  UsersState.setUsers([UsersState.users.filter((user) => user.id !== id)]);
}

function getUser(id) {
  return UsersState.users.filter((user) => user.id === id);
}

function getUserinRoom(room) {
  return UsersState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
  // Set for not duplicates
  // returns a array conating only room names
  return Array.from(new Set(UsersState.users.map((user) => user.room)));
}
