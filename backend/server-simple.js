const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
let users = [];
let donations = [];
let requests = [];
let nextId = 1;

// Socket.io
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

// ===== AUTHENTICATION ROUTES =====
app.post("/api/auth/register", (req, res) => {
  try {
    console.log("?? Registration attempt:", req.body);
    
    const { name, email, password, userType, phone } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    // Create new user
    const user = {
      id: nextId++,
      name,
      email,
      password,
      userType,
      phone: phone || "",
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    console.log("? User registered successfully:", user.email);
    
    res.json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error(" Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    console.log(" Login attempt:", req.body.email);
    
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    console.log(" Login successful:", user.email);
    
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ===== DONATION ROUTES =====
app.get("/api/donations", (req, res) => {
  const availableDonations = donations.filter(d => d.status === "available");
  res.json(availableDonations);
});

app.post("/api/donations", (req, res) => {
  try {
    const donation = {
      id: nextId++,
      ...req.body,
      status: "available",
      createdAt: new Date().toISOString()
    };
    
    donations.push(donation);
    io.emit("newDonation", donation);
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/:userId/donations", (req, res) => {
  const userDonations = donations.filter(d => d.donorId == req.params.userId);
  res.json(userDonations);
});

// ===== REQUEST ROUTES =====
app.post("/api/requests", (req, res) => {
  try {
    const request = {
      id: nextId++,
      ...req.body,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    requests.push(request);
    io.emit("newRequest", request);
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/:userId/requests", (req, res) => {
  const userRequests = requests.filter(r => r.recipientId == req.params.userId);
  res.json(userRequests);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Food Donation API is running!",
    timestamp: new Date().toISOString(),
    stats: {
      users: users.length,
      donations: donations.length,
      requests: requests.length
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(" Backend server running on port " + PORT);
  console.log(" Health check: http://localhost:" + PORT + "/api/health");
});
// Add this route to server-simple.js before the PORT declaration
app.get("/api/debug/users", (req, res) => {
  res.json(users);
});
