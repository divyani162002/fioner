const mongoose = require("mongoose");

const createProfileSchema = new mongoose.Schema(
  {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true, // Assuming each vehicle number is unique
    },
        additionalVehicleNumbers: {
            type: String,
            required: true, unique: true
        }, 
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    dlNumber: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreateProfile", createProfileSchema);

