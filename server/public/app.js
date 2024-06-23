const socket = io("ws://localhost:3500");
const activity = document.querySelector(".activity");

const msgIinput = document.querySelector("input");
function sendMessage(e) {
  e.preventDefault();
  activity.textContent = "";
  // prevent the form default behaviour
  //  const input = document.querySelector("input");
  if (msgIinput.value) {
    socket.emit("message", msgIinput.value);
    msgIinput.value = "";
  }
  msgIinput.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage);

// Listen for messages
socket.on("message", (data) => {
  const li = document.createElement("li");
  li.textContent = data;
  document.querySelector("ul").appendChild(li);
});
msgIinput.addEventListener("keypress", () => {
  socket.emit("activity", socket.id.substring(0, 5));
});
let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing ...`;
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});
