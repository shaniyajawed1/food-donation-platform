const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);


const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// ✅ COMPREHENSIVE CORS Configuration - MUST be FIRST
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600 // Cache preflight for 10 minutes
}));

// ✅ Handle preflight requests
app.options('*', cors());

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// In-memory database
let users = [];
let donations = [];
let requests = [];
let nextId = 1;

// Socket.io
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ===== AUTHENTICATION ROUTES =====
app.post("/api/auth/register", (req, res) => {
  try {
    console.log("📝 Registration attempt:", req.body);
    
    const { name, email, password, userType, phone } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ 
        message: "All fields are required",
        error: "Missing required fields" 
      });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists",
        error: "Email already registered" 
      });
    }
    
    // Create new user
    const user = {
      id: nextId++,
      name,
      email,
      password, // In production, hash this!
      userType,
      phone: phone || "",
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    console.log("✅ User registered successfully:", user.email);
    
    // Return format matching frontend expectations
    res.status(201).json({
      message: "User registered successfully",
      token: "dummy-token-" + user.id,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ 
      message: "Server error during registration",
      error: error.message 
    });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email);
    
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        error: "Missing credentials" 
      });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid credentials",
        error: "Email or password incorrect" 
      });
    }
    
    console.log("✅ Login successful:", user.email);
    
    // Return format matching frontend expectations
    res.json({
      message: "Login successful",
      token: "dummy-token-" + user.id,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      message: "Server error during login",
      error: error.message 
    });
  }
});

// ===== DONATION ROUTES =====
app.get("/api/donations", (req, res) => {
  console.log("📦 Fetching all donations");
  const availableDonations = donations.filter(d => d.status === "available");
  res.json(availableDonations);
});

app.post("/api/donations", (req, res) => {
  try {
    console.log("🆕 Creating new donation:", req.body);
    
    const donation = {
      id: nextId++,
      _id: nextId,
      ...req.body,
      status: "available",
      createdAt: new Date().toISOString()
    };
    
    donations.push(donation);
    console.log("✅ Donation created successfully:", donation.id);
    
    io.emit("newDonation", donation);
    res.status(201).json(donation);
  } catch (error) {
    console.error("❌ Error creating donation:", error);
    res.status(500).json({ 
      message: "Server error creating donation",
      error: error.message 
    });
  }
});

app.get("/api/users/:userId/donations", (req, res) => {
  console.log("🔍 Fetching donations for user:", req.params.userId);
  const userDonations = donations.filter(d => d.donorId == req.params.userId);
  console.log("📊 Found donations:", userDonations.length);
  res.json(userDonations);
});

// ===== REQUEST ROUTES =====
app.post("/api/requests", (req, res) => {
  try {
    console.log("📬 Creating new request:", req.body);
    
    const request = {
      id: nextId++,
      _id: nextId,
      ...req.body,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    requests.push(request);
    console.log("✅ Request created successfully:", request.id);
    
    io.emit("newRequest", request);
    res.status(201).json(request);
  } catch (error) {
    console.error("❌ Error creating request:", error);
    res.status(500).json({ 
      message: "Server error creating request",
      error: error.message 
    });
  }
});

app.get("/api/users/:userId/requests", (req, res) => {
  console.log("🔍 Fetching requests for user:", req.params.userId);
  const userRequests = requests.filter(r => r.recipientId == req.params.userId);
  console.log("📊 Found requests:", userRequests.length);
  res.json(userRequests);
});

// ===== DEBUG ROUTES =====
app.get("/api/debug/users", (req, res) => {
  res.json(users);
});

app.get("/api/debug/donations", (req, res) => {
  res.json(donations);
});

app.get("/api/debug/requests", (req, res) => {
  res.json(requests);
});

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Food Donation API is running!",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    stats: {
      users: users.length,
      donations: donations.length,
      requests: requests.length
    }
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: err.message 
  });
});

// ===== START SERVER ON PORT 9000 =====
const PORT = process.env.PORT || 9900;

server.listen(PORT, '0.0.0.0', () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 FOOD DONATION API SERVER");
  console.log("=".repeat(60));
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Debug users: http://localhost:${PORT}/api/debug/users`);
  console.log(`📦 Debug donations: http://localhost:${PORT}/api/debug/donations`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
  console.log("=".repeat(60) + "\n");
});