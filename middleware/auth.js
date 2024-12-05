const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path as needed

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("role email");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    req.user = user; // Attach user info to req object
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticate;
