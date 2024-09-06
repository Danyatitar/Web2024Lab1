const socket = io();

const roomForm = document.getElementById("room-form");
const nameInput = document.querySelector(".name-input");
const roomInput = document.querySelector(".room-input");
const chatContainer = document.querySelector(".chat-container");
const form = document.querySelector(".chat-form");
const input = document.querySelector(".chat-input");
const messagesContainer = document.getElementById("messages");
const roomList = document.getElementById("room-list");
const userList = document.getElementById("user-list");

let currentRooms = {};
let userName = "";
let selectedRoom = "";

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const room = roomInput.value.trim();
  const name = nameInput.value.trim();
  if (room && name) {
    if (!userName) {
      userName = name;
    }
    if (!currentRooms[room]) {
      currentRooms[room] = [];
      socket.emit("join room", { room, name: userName });
      addRoomToSidebar(room);
    }
    roomInput.value = "";
    if (!selectedRoom) {
      switchRoom(room);
    }
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value && selectedRoom) {
    const message = input.value;
    socket.emit("chat message", {
      room: selectedRoom,
      name: userName,
      msg: message,
    });
    input.value = "";
  }
});

socket.on("chat message", (data) => {
  if (currentRooms[data.room]) {
    currentRooms[data.room].push(data);
    if (data.room === selectedRoom) {
      displayMessagesForRoom(data.room);
    }
  }
});

socket.on("notification", (data) => {
  if (currentRooms[data.room]) {
    currentRooms[data.room].push({
      notification: `${data.name} joined ${data.room}`,
    });
    if (data.room === selectedRoom) {
      displayMessagesForRoom(data.room);
    }
  }
});

socket.on("user list", ({ room, users }) => {
  if (room === selectedRoom) {
    updateUserList(users);
  }
});

function switchRoom(room) {
  selectedRoom = room;
  displayMessagesForRoom(room);
  chatContainer.style.display = "flex";
  socket.emit("get users", room);
}

function displayMessagesForRoom(room) {
  messagesContainer.innerHTML = "";
  currentRooms[room].forEach((message) => {
    const item = document.createElement("li");
    if (message.notification) {
      item.textContent = message.notification;
      item.classList.add("notification");
    } else {
      item.textContent = `${message.name}: ${message.msg}`;
      if (message.name === userName) {
        item.classList.add("my-message");
      } else {
        item.classList.add("other-message");
      }
    }
    messagesContainer.appendChild(item);
  });
  window.scrollTo(0, document.body.scrollHeight);
}

function updateUserList(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.textContent = user;
    userList.appendChild(userItem);
  });
}

function addRoomToSidebar(room) {
  const roomItem = document.createElement("li");
  roomItem.textContent = room;
  roomItem.addEventListener("click", () => {
    switchRoom(room);
  });
  roomList.appendChild(roomItem);
}
