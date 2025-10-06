const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const auth = require("../middleware/auth");

// Create a new request
router.post("/", auth, async (req, res) => {
  try {
    const { donationId, message } = req.body;
    const recipientId = req.user.id;

    // Check if donation exists
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Create the request
    const request = new Request({
      donation: donationId,
      recipient: recipientId,
      message: message || "I would like to request this food donation."
    });

    await request.save();

    res.status(201).json({
      message: "Request created successfully",
      request: request
    });

  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
});

// Get requests for current user
router.get("/my-requests", auth, async (req, res) => {
  try {
    const requests = await Request.find({ recipient: req.user.id })
      .populate('donation')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
});

// Delete a request
router.delete("/:id", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted successfully" });

  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Error deleting request", error: error.message });
  }
});

module.exports = router;