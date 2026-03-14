require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Property = require("./Models/property");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Property Map API running");
});

/**
 * Get all properties
 */
app.get("/properties", async (req, res) => {
  try {
    const items = await Property.find().sort({ ku: 1 });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch properties", error: err.message });
  }
});

/**
 * Get one property by ku
 */
app.get("/property/:ku", async (req, res) => {
  try {
    const ku = req.params.ku;
    const item = await Property.findOne({ ku });

    if (!item) {
      return res.status(404).json({ message: `No data found for ${ku}` });
    }

    res.json(item);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch property", error: err.message });
  }
});

/**
 * Create or update property by ku
 */
app.post("/property", async (req, res) => {
  try {
    const { ku, property, price, count } = req.body;

    if (!ku || !property || price === undefined || count === undefined) {
      return res
        .status(400)
        .json({ message: "ku, property, price, and count are required" });
    }

    const saved = await Property.findOneAndUpdate(
      { ku },
      {
        ku,
        property,
        price: Number(price),
        count: Number(count),
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.json(saved);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to save property", error: err.message });
  }
});

/**
 * Delete by ku
 */
app.delete("/property/:ku", async (req, res) => {
  try {
    const ku = req.params.ku;
    await Property.findOneAndDelete({ ku });
    res.json({ message: `${ku} deleted` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete property", error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
