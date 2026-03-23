const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    fuelPricePerLitre: {
      type: Number,
      default: 0,
    },
    fuelUsedPerDelivery: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 1000,
    },
    avgMinutesNeeded: {
      type: Number,
      default: 60,
    },
    marginPercent: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", SettingsSchema);
