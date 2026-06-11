require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const providerRoutes = require("./routes/provider");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");

const Message = require("./models/message");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/provider", providerRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Socket.io Real-time Chat
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register user with their userId
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
    io.emit("onlineUsers", Object.keys(users));
  });

  // Handle sending messages
  socket.on("sendMessage", ({ senderId, receiverId, message, senderName }) => {
    if (!senderId || !receiverId || !message) return;

    Message.create({ senderId, receiverId, senderName, message })
      .then((saved) => {
        const messageData = {
          _id: saved._id.toString(),
          senderId,
          receiverId,
          senderName,
          message,
          timestamp: saved.createdAt.toISOString(),
        };

        // Deliver to receiver if online
        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", messageData);
        }

        // Echo back to sender so the persisted message (with _id) is in sync
        io.to(socket.id).emit("receiveMessage", messageData);
      })
      .catch((err) => {
        console.log("Failed to persist message:", err);
      });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
    io.emit("onlineUsers", Object.keys(users));
    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(MONGO_URI)
  .then((result) => {
    console.log("Connected to Database ✅");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
      console.log(`Socket.io ready for real-time chat 💬`);
    });
  })
  .catch((err) => {
    console.log(err);
  });