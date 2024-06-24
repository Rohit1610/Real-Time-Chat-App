const socket = io("ws://localhost:3500");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");

const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");

const roomsList = document.querySelector(".room-list");

const chatDisplay = document.querySelector(".chat-display");


function sendMessage(e) {
  e.preventDefault();
  // prevent the form default behaviour
  //  const input = document.querySelector("input");
  if (nameInput.value && chatRoom.value && msgInput.value) {
    socket.emit("message", {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = "";
  }
  msgInput.focus();
}
function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoom.value) {
    socket.emit("enterRoom", {
      name: nameInput.value,
      room: chatRoom.value,
    });
  }
}
document.querySelector(".form-msg").addEventListener("submit", sendMessage);
document.querySelector(".form-join").addEventListener("submit", enterRoom);

msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});
// Listen for messages
socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";
  // current user
  if (name === nameInput.value) li.className = "post post--left";
  // reply coming from other user to right
  if (name !== nameInput.value && name !== "Admin")
    li.className = "post post--right";
  // date time header
  if (name !== "Admin") {
    li.innerHTML = `<div class="post__header ${
      name === nameInput.value ? "post__header--user" : "post__header--reply"
    }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`;
  } else {
    li.innerHTML = `<div class="post__text">${text}</div>`;
  }
  document.querySelector(".chat-display").appendChild(li);

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});
let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing ...`;
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

function showUsers(users) {
  usersList.textContent = "";
  if (users) {
    usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    users.forEach((user, i) => {
      usersList.textContent += ` ${user.name}`;
      // for last element
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ",";
      }
    });
  }
}

function showRooms(rooms) {
  roomsList.textContent = "";
  if (rooms) {
    roomsList.innerHTML = "<em>Active Rooms:</em>";
    rooms.forEach((room, i) => {
      roomsList.textContent += ` ${room}`;
      // for last element
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomsList.textContent += ",";
      }
    });
  }
}
