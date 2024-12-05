const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const upload = require("../middleware/upload");
const { body, validationResult } = require("express-validator");

// Registraton endpoint
router.post(
  "/register",
  [
    body("username").isString().notEmpty().withMessage("Username is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Invalid role."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "A user with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: role || "user", // Default role
      });

      await newUser.save();

      res.status(201).json({
        message: "User registered successfully.",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  }
);

// Login endpoint
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id }, // Only include user ID in the token payload
        process.env.JWT_SECRET, // Make sure the secret is set in the environment
        { expiresIn: "1h" } // Token expiration time
      );

      res.status(200).json({
        message: "Login successful.",
        token,
        role: user.role,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  }
);

// GET all users (Admin only)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a user's information by ID
router.put("/update/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a user's role or status (Admin only)
router.patch("/update/:id/role-status", async (req, res) => {
  const { role, status } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role, status },
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      message: "User role/status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a user by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint
router.post("/logout", async (req, res) => {
  try {
    // You can optionally manage token invalidation via a blacklist in a database or cache if necessary.
    // For stateless JWTs, it's enough to instruct the client to discard the token.

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
