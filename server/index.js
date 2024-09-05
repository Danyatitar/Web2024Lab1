// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; // Track rooms and their users

// Serve static files from 'public' directory
app.use(express.static("public"));

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a room
  socket.on("join room", ({ room, name }) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = [];
    }
    rooms[room].push(name);
    console.log(`${name} joined room: ${room}`);

    io.to(room).emit("notification", { name, room });
    io.to(room).emit("user list", { room, users: rooms[room] }); // Send updated user list to room
  });

  // Handle chat messages for the specific room
  socket.on("chat message", ({ room, name, msg }) => {
    io.to(room).emit("chat message", { room, name, msg }); // Broadcast message with user name to the room
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("get users", (room) => {
    if (rooms[room]) {
      io.to(socket.id).emit("user list", { room, users: rooms[room] });
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
