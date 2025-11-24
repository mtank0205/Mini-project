import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables FIRST before importing other modules
dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import evaluationRoutes from "./routes/evaluation.js";
import reportRoutes from "./routes/report.js";
import filesRoutes from "./routes/files.js";

connectDB();

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"] }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/evaluate", evaluationRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/files", filesRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // ✅ User joins a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room ${roomId}`);
  });

  // ✅ Code syncing inside room
  socket.on("code-change", ({ roomId, fileName, code }) => {
    socket.to(roomId).emit("code-update", { fileName, code });
  });


  socket.on("typing", ({ roomId, user }) => {
    socket.to(roomId).emit("user-typing", user);
  });

  socket.on("stop-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("user-stop-typing", user);
  });


  // ✅ Chat messages inside room
  socket.on("send-message", ({ roomId, message, user }) => {
    io.to(roomId).emit("receive-message", {
      message,
      user,
      time: new Date().toISOString(),
    });
  });

  // User disconnects
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});


server.listen(5000, () => console.log("✅ Server running on port 5000"));
