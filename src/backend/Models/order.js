const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    area: { type: String, required: true },
    desc: { type: String, default: "" },
    unitPrice: { type: Number, required: true, default: 0 },
    qty: { type: Number, required: true, default: 1 },
    subtotal: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderDate: {
      type: Date,
      default: Date.now,
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    totalUnits: {
      type: Number,
      default: 0,
    },
    salesAmount: {
      type: Number,
      default: 0,
    },
    fuelPricePerLitre: {
      type: Number,
      default: 0,
    },
    fuelUsedPerDelivery: {
      type: Number,
      default: 0,
    },
    fuelCost: {
      type: Number,
      default: 0,
    },
    avgMinutesNeeded: {
      type: Number,
      default: 0,
    },
    laborHours: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    laborCost: {
      type: Number,
      default: 0,
    },
    investmentAmount: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
