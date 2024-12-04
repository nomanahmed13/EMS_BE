const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token after "Bearer"

  if (!token) {
    return res.status(401).json({ error: "Token not present" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token", details: error.message });
  }
};

module.exports = authMiddleware;
