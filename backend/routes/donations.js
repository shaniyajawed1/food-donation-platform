const express = require("express");
const Donation = require("../models/Donation");
const auth = require("../middleware/auth");
const router = express.Router();
router.get("/available", async (req, res) => {
  try {
    const donations = await Donation.find({ status: "available" })
      .populate("donor", "name email phone")
      .sort({ createdAt: -1 });

    console.log("Available donations with donor:", donations.length);
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-donations", auth, async (req, res) => {
  try {
    console.log("Fetching donations for user:", req.userId);
    const donations = await Donation.find({ donor: req.userId })
      .populate("donor", "name email phone")
      .populate("recipient", "name email phone")
      .sort({ createdAt: -1 });

    console.log("My donations found:", donations.length);
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/my-claims", auth, async (req, res) => {
  try {
    const donations = await Donation.find({ recipient: req.userId })
      .populate("donor", "name email phone")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/", auth, async (req, res) => {
  try {
    const donation = new Donation({
      ...req.body,
      donor: req.userId,
      status: "available",
    });
    await donation.save();
    await donation.populate("donor", "name email phone");

    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/:id/claim", auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "available") {
      return res.status(400).json({ message: "Donation is not available" });
    }

    donation.status = "claimed";
    donation.recipient = req.userId;
    await donation.save();

    await donation.populate("donor", "name email phone");
    await donation.populate("recipient", "name email phone");

    res.json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    if (
      donation.donor.toString() !== req.userId &&
      donation.recipient?.toString() !== req.userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    donation.status = status;
    await donation.save();

    await donation.populate("donor", "name email phone");
    await donation.populate("recipient", "name email phone");

    res.json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("=== DELETE DONATION REQUEST ===");
    console.log("Donation ID from params:", req.params.id);
    console.log("User ID from auth:", req.userId);
    console.log("Request method:", req.method);
    console.log("Request URL:", req.originalUrl);
    if (!req.params.id) {
      console.log("No ID provided in request");
      return res.status(400).json({ message: "Donation ID is required" });
    }
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid ID format:", req.params.id);
      return res.status(400).json({
        message: "Invalid donation ID format",
        receivedId: req.params.id,
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      console.log("Donation not found in database with ID:", req.params.id);
      const allDonations = await Donation.find({}).limit(5);
      console.log(
        "First 5 donations in DB:",
        allDonations.map((d) => ({
          id: d._id,
          donor: d.donor,
          foodType: d.foodType,
        }))
      );

      return res.status(404).json({
        message: "Donation not found",
        donationId: req.params.id,
        suggestion: "Check if the donation exists and you have access to it",
      });
    }

    console.log("Donation found:", {
      id: donation._id.toString(),
      donor: donation.donor.toString(),
      foodType: donation.foodType,
      status: donation.status,
    });
    if (donation.donor.toString() !== req.userId.toString()) {
      console.log("Authorization failed");
      console.log("Donation donor:", donation.donor.toString());
      console.log("Request user:", req.userId.toString());
      return res.status(403).json({
        message: "Not authorized to delete this donation",
      });
    }
    console.log("Authorization passed");
    const result = await Donation.findByIdAndDelete(req.params.id);
    console.log("Delete result:", result);

    if (!result) {
      console.log("Delete operation returned null");
      return res.status(500).json({ message: "Failed to delete donation" });
    }

    console.log("Donation deleted successfully");
    res.json({
      message: "Donation deleted successfully",
      donationId: req.params.id,
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid donation ID format",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error during deletion",
      error: error.message,
    });
  }
});

module.exports = router;
