const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

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

// Socket.io CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
let users = [];
let donations = [];
let requests = [];
let nextId = 1;

// Socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
app.post("/api/auth/register", (req, res) => {
  try {
    console.log("Registration attempt:", req.body);

    const { name, email, password, userType, phone } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        message: "All fields are required",
        error: "Missing required fields",
      });
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        error: "Email already registered",
      });
    }

    const userId = nextId++;
    const user = {
      id: userId,
      _id: userId,
      name,
      email,
      password,
      userType,
      phone: phone || "",
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    console.log("User registered successfully:", user.email);
    res.status(201).json({
      message: "User registered successfully",
      token: "dummy-token-" + userId,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    console.log("Login attempt:", req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        error: "Missing credentials",
      });
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
        error: "Email or password incorrect",
      });
    }

    console.log("Login successful:", user.email);
    res.json({
      message: "Login successful",
      token: "dummy-token-" + user.id,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
});
app.get("/api/donations", (req, res) => {
  console.log("Fetching all donations");
  const availableDonations = donations.filter((d) => d.status === "available");
  res.json(availableDonations);
});
app.get("/api/donations/available", (req, res) => {
  console.log("Fetching available donations via /available endpoint");
  const availableDonations = donations.filter((d) => d.status === "available");
  console.log("Found available donations:", availableDonations.length);
  res.json(availableDonations);
});
app.post("/api/donations", (req, res) => {
  try {
    console.log("Creating new donation:", req.body);

    const donationId = nextId++;
    const donation = {
      id: donationId,
      _id: donationId,
      ...req.body,
      status: "available",
      createdAt: new Date().toISOString(),
    };

    donations.push(donation);
    console.log("Donation created successfully:", donation.id);

    io.emit("newDonation", donation);
    res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({
      message: "Server error creating donation",
      error: error.message,
    });
  }
});

app.get("/api/donations/my-donations", (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);
    const userId = authHeader
      ? authHeader.replace("Bearer dummy-token-", "")
      : null;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log("Fetching donations for user:", userId);
    const userDonations = donations.filter((d) => d.donorId == userId);
    console.log("Found donations:", userDonations.length);
    res.json(userDonations);
  } catch (error) {
    console.error("Error fetching my donations:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.get("/api/users/:userId/donations", (req, res) => {
  console.log("Fetching donations for user:", req.params.userId);
  const userDonations = donations.filter((d) => d.donorId == req.params.userId);
  console.log("Found donations:", userDonations.length);
  res.json(userDonations);
});

app.patch("/api/donations/:id/status", (req, res) => {
  try {
    const donationId = req.params.id;
    const { status } = req.body;

    const donation = donations.find(
      (d) => d.id == donationId || d._id == donationId
    );
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    donation.status = status;
    console.log("Donation status updated:", donationId, "->", status);

    res.json(donation);
  } catch (error) {
    console.error("Error updating donation:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.delete("/api/requests/:id", (req, res) => {
  try {
    const requestId = req.params.id;
    console.log("Delete request for request:", requestId);
    const authHeader = req.header('Authorization');
    const userId = authHeader ? authHeader.replace('Bearer dummy-token-', '') : null;
    
    if (!userId) {
      console.log("No authentication token provided");
      return res.status(401).json({ message: "Not authenticated" });
    }
    const requestIndex = requests.findIndex(r => r.id == requestId || r._id == requestId);
    if (requestIndex === -1) {
      console.log("Request not found:", requestId);
      return res.status(404).json({ message: "Request not found" });
    }
    const request = requests[requestIndex];
    if (request.recipientId != userId) {
      console.log("User does not own this request");
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }
    if (request.status !== 'pending') {
      console.log("Can only delete pending requests");
      return res.status(400).json({ message: "Can only delete pending requests" });
    }
    requests.splice(requestIndex, 1);
    console.log("Request deleted successfully:", requestId);
    io.emit("requestDeleted", { requestId });
    res.json({ 
      message: "Request deleted successfully",
      deletedRequest: request
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ 
      message: "Server error deleting request",
      error: error.message 
    });
  }
});
app.delete("/api/donations/:id", (req, res) => {
  try {
    const donationId = req.params.id;
    console.log("Delete request for donation:", donationId);
    const authHeader = req.header("Authorization");
    const userId = authHeader
      ? authHeader.replace("Bearer dummy-token-", "")
      : null;

    if (!userId) {
      console.log("No authentication token provided");
      return res.status(401).json({ message: "Not authenticated" });
    }
    const donationIndex = donations.findIndex(
      (d) => d.id == donationId || d._id == donationId
    );

    if (donationIndex === -1) {
      console.log("Donation not found:", donationId);
      return res.status(404).json({ message: "Donation not found" });
    }

    const donation = donations[donationIndex];
    if (donation.donorId != userId) {
      console.log("User does not own this donation");
      return res
        .status(403)
        .json({ message: "Not authorized to delete this donation" });
    }
    donations.splice(donationIndex, 1);
    console.log("Donation deleted successfully:", donationId);
    const deletedRequests = requests.filter((r) => r.donationId == donationId);
    requests = requests.filter((r) => r.donationId != donationId);
    console.log(`Deleted ${deletedRequests.length} associated requests`);
    io.emit("donationDeleted", { donationId });

    res.json({
      message: "Donation deleted successfully",
      deletedDonation: donation,
      deletedRequestsCount: deletedRequests.length,
    });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({
      message: "Server error deleting donation",
      error: error.message,
    });
  }
});

app.post("/api/requests", (req, res) => {
  try {
    console.log("Creating new request:", req.body);

    const requestId = nextId++;
    const request = {
      id: requestId,
      _id: requestId,
      ...req.body,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    requests.push(request);
    console.log("Request created successfully:", request.id);

    io.emit("newRequest", request);
    res.status(201).json(request);
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({
      message: "Server error creating request",
      error: error.message,
    });
  }
});

app.get("/api/users/:userId/requests", (req, res) => {
  console.log("🔍 Fetching requests for user:", req.params.userId);
  const userRequests = requests.filter(
    (r) => r.recipientId == req.params.userId
  );
  const populatedRequests = userRequests.map((req) => {
    const donation = donations.find(
      (d) => d.id == req.donationId || d._id == req.donationId
    );
    return {
      ...req,
      donation: donation || null,
    };
  });

  console.log("Found requests:", populatedRequests.length);
  res.json(populatedRequests);
});
app.get("/api/debug/users", (req, res) => {
  res.json(users);
});

app.get("/api/debug/donations", (req, res) => {
  res.json(donations);
});

app.get("/api/debug/requests", (req, res) => {
  res.json(requests);
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Food Donation API is running!",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    stats: {
      users: users.length,
      donations: donations.length,
      requests: requests.length,
    },
  });
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
  console.log(" FOOD DONATION API SERVER");
  console.log("=".repeat(60));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Debug users: http://localhost:${PORT}/api/debug/users`);
  console.log(`Debug donations: http://localhost:${PORT}/api/debug/donations`);
  console.log(`CORS enabled for: http://localhost:5173`);
  console.log("=".repeat(60) + "\n");
});
