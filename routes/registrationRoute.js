const express = require('express');
const Registration = require('../models/Registration');
const router = express.Router();

// Register for an event
router.post("/registerWithEmail", async (req, res) => {
    try {
      const { event, email } = req.body;
  
      // Validate input
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
  
      // Check if the user is already registered for the event
      const existingRegistration = await Registration.findOne({ email, event });
      if (existingRegistration) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }
  
      // Create a new registration
      const newRegistration = new Registration({
        event,
        email,
      });
  
      await newRegistration.save();
      res.status(201).json({ message: "Registration successful", registration: newRegistration });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/registerWithEmail', async (req, res) => {

  })

module.exports = router;