const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5175", credentials: true, allowedHeaders: ["Content-Type", "Authorization"], }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define Routes
app.use("/users", require("./routes/userRoute"));
app.use("/events", require("./routes/eventRoute"));
app.use("/registration", require("./routes/registrationRoute"));

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    // process.exit(1);
  }
});