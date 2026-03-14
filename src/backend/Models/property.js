const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    ku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    property: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    count: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Property", PropertySchema);
