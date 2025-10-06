const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/database");
const requestRoutes = require('./routes/requests');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://food-donation-platform-six.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600,
  })
);

app.options("*", cors());
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
app.set('io', io);

const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/requests', requestRoutes);

app.get("/api/health", async (req, res) => {
  const mongoose = require('mongoose');
  const User = require('./models/User');
  const Donation = require('./models/Donation');
  const Request = require('./models/Request');
  
  try {
    const userCount = await User.countDocuments();
    const donationCount = await Donation.countDocuments();
    const requestCount = await Request.countDocuments();
    
    res.json({
      status: "OK",
      message: "Food Donation API is running with MongoDB!",
      timestamp: new Date().toISOString(),
      cors: "enabled",
      database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      stats: {
        users: userCount,
        donations: donationCount,
        requests: requestCount,
      }
    });
  } catch (error) {
    res.json({
      status: "OK",
      message: "Food Donation API is running with MongoDB!",
      timestamp: new Date().toISOString(),
      cors: "enabled",
      database: "Error fetching stats"
    });
  }
});
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 9900;

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n" + "=".repeat(60));
  console.log("FOOD DONATION API SERVER (MongoDB)");
  console.log("=".repeat(60));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`CORS enabled for: ${allowedOrigins.join(", ")}`);
  console.log("=".repeat(60) + "\n");
});