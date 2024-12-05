const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const { authorize } = require("../middleware/authorize");
const authMiddleware = require("../middleware/auth")


// Fetch all requests (Admin only)
router.get("/", authorize("admin"), async (req, res) => {
  try {
    const requests = await Registration.find()
      .populate("event", "title") // Populates event title
      .populate("user", "email"); // Populates user email

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Submit a new registration request (User only)
router.post("/register", authMiddleware, authorize("user"), async (req, res) => {
  try {
    const { event } = req.body; // Update to extract `event` instead of `eventId`

    if (!event) {
      return res.status(400).json({ message: "Event is required" });
    }

    // Check if event exists
    const eventExists = await Event.findById(event);
    if (!eventExists) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check for existing request
    const existingRequest = await Registration.findOne({
      event,
      user: req.user.id,
    });
    if (existingRequest) {
      return res.status(400).json({
        message: `You already have a ${
          existingRequest.status === "pending"
            ? "pending"
            : existingRequest.status === "approved"
            ? "approved"
            : "rejected"
        } request for this event.`,
      });
    }

    // Create new request
    const newRequest = new Registration({
      event,
      user: req.user.id,
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json({
      message: "Registration request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error submitting request:", error.stack || error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Approve a request (Admin only)
router.post("/approveRequest", authorize("admin"), async (req, res) => {
  try {
    const { requestId } = req.body;

    // Validate requestId
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the request
    const request = await Registration.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Approve the request
    request.status = "approved";
    await request.save();

    res.status(200).json({ message: "Request approved successfully" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Reject a request (Admin only)
router.post("/rejectRequest", authorize("admin"), async (req, res) => {
  try {
    const { requestId } = req.body;

    // Validate requestId
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the request
    const request = await Registration.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Reject the request
    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


module.exports = router;
