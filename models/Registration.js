const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema({
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  });

const Registration = mongoose.model("Registration", RegistrationSchema);
module.exports = Registration;
