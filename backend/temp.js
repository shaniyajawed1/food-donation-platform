const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5174",  // Changed to 5174
    methods: ["GET", "POST"]
  }
});
