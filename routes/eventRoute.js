const express = require("express");
const Event = require("../models/Event");
const multer = require("multer");
const upload = require("../middleware/upload");
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Create a new event
router.post("/create", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { file } = req;
    const {
      title,
      optional,
      description,
      organizedBy,
      eventDate,
      eventTime,
      location,
      ticketPrice,
    } = req.body;

    if (
      !title ||
      !description ||
      !organizedBy ||
      !eventDate ||
      !eventTime ||
      !location ||
      ticketPrice === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newEvent = new Event({
      owner: req.userId, // Attach userId from the middleware
      title,
      optional,
      description,
      organizedBy,
      eventDate,
      eventTime,
      location,
      ticketPrice,
      image: file ? file.path : null,
      likes: 0,
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 }); // Sort by eventDate descending
    if (events.length === 0) {
      return res.status(404).json({ message: "No events found." });
    }
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching events." });
  }
});

// Retrieve a specific event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID format or internal error." });
  }
});

// Update an existing event
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { file } = req;
    const {
      owner,
      title,
      optional,
      description,
      organizedBy,
      eventDate,
      eventTime,
      location,
      ticketPrice,
    } = req.body;

    // Filter undefined or null values to avoid overwriting with undefined
    const updatedData = {
      ...(owner && { owner }),
      ...(title && { title }),
      ...(optional && { optional }),
      ...(description && { description }),
      ...(organizedBy && { organizedBy }),
      ...(eventDate && { eventDate }),
      ...(eventTime && { eventTime }),
      ...(location && { location }),
      ...(ticketPrice !== undefined && { ticketPrice }),
      ...(file && { image: file.path }), // Update image if new file is provided
    };

    const event = await Event.findByIdAndUpdate(req.params.id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Run model validators during update
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update event. Ensure valid input or ID.",
    });
  }
});

// // Delete an event
// router.delete("/:id", async (req, res) => {
//   try {
//     const event = await Event.findByIdAndDelete(req.params.id);

//     if (!event) {
//       return res.status(404).json({ error: "Event not found." });
//     }

//     res.status(200).json({
//       message: "Event deleted successfully.",
//       deletedEvent: event,
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: "Failed to delete event. Ensure valid ID or try again.",
//     });
//   }
// });

module.exports = router;
