require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Property = require("./Models/property");
const Order = require("./Models/order");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

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
 * =========================
 * PROPERTY ROUTES
 * =========================
 */

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

/**
 * =========================
 * ORDER ROUTES
 * =========================
 */

/**
 * Save new checkout order
 */
app.post("/orders", async (req, res) => {
  try {
    const {
      items,
      gasFee = 0,
      avgMinutesNeeded = 0,
      hourlyRate = 0,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const normalizedItems = items.map((item) => {
      const unitPrice = Number(item.unitPrice || 0);
      const qty = Number(item.qty || 0);
      return {
        area: String(item.area || "").trim(),
        desc: String(item.desc || "").trim(),
        unitPrice,
        qty,
        subtotal: unitPrice * qty,
      };
    });

    const totalUnits = normalizedItems.reduce((sum, item) => sum + item.qty, 0);
    const salesAmount = normalizedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const safeGasFee = Number(gasFee || 0);
    const safeAvgMinutesNeeded = Number(avgMinutesNeeded || 0);
    const safeHourlyRate = Number(hourlyRate || 0);

    const laborHours = safeAvgMinutesNeeded / 60;
    const laborCost = laborHours * safeHourlyRate;
    const investmentAmount = safeGasFee + laborCost;
    const profit = salesAmount - investmentAmount;

    const savedOrder = await Order.create({
      orderDate: new Date(),
      items: normalizedItems,
      totalUnits,
      salesAmount,
      gasFee: safeGasFee,
      avgMinutesNeeded: safeAvgMinutesNeeded,
      laborHours,
      hourlyRate: safeHourlyRate,
      laborCost,
      investmentAmount,
      profit,
    });

    res.json(savedOrder);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to save order", error: err.message });
  }
});

/**
 * Get all orders
 */
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
});

/**
 * Dashboard summary
 */
app.get("/dashboard/summary", async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: 1 });

    const summary = {
      totalOrders: 0,
      totalUnits: 0,
      totalRevenue: 0,
      totalGasFee: 0,
      totalLaborCost: 0,
      totalInvestment: 0,
      totalProfit: 0,
      avgMinutesPerOrder: 0,
      avgRevenuePerHour: 0,
      topAreas: [],
      monthlyStats: [],
      costBreakdown: [],
      recentOrders: [],
    };

    if (!orders.length) {
      summary.costBreakdown = [
        { name: "Gas", value: 0 },
        { name: "Labor", value: 0 },
        { name: "Profit", value: 0 },
      ];
      return res.json(summary);
    }

    summary.totalOrders = orders.length;

    let totalMinutes = 0;
    let totalHours = 0;

    const areaMap = {};
    const monthMap = {};

    for (const order of orders) {
      summary.totalUnits += Number(order.totalUnits || 0);
      summary.totalRevenue += Number(order.salesAmount || 0);
      summary.totalGasFee += Number(order.gasFee || 0);
      summary.totalLaborCost += Number(order.laborCost || 0);
      summary.totalInvestment += Number(order.investmentAmount || 0);
      summary.totalProfit += Number(order.profit || 0);

      totalMinutes += Number(order.avgMinutesNeeded || 0);
      totalHours += Number(order.laborHours || 0);

      const d = new Date(order.orderDate);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          month: monthKey,
          orders: 0,
          revenue: 0,
          investment: 0,
          profit: 0,
          units: 0,
        };
      }

      monthMap[monthKey].orders += 1;
      monthMap[monthKey].revenue += Number(order.salesAmount || 0);
      monthMap[monthKey].investment += Number(order.investmentAmount || 0);
      monthMap[monthKey].profit += Number(order.profit || 0);
      monthMap[monthKey].units += Number(order.totalUnits || 0);

      for (const item of order.items || []) {
        const areaName = String(item.area || "").trim();
        if (!areaName) continue;

        if (!areaMap[areaName]) {
          areaMap[areaName] = {
            area: areaName,
            orderCount: 0,
            units: 0,
            revenue: 0,
          };
        }

        areaMap[areaName].orderCount += 1;
        areaMap[areaName].units += Number(item.qty || 0);
        areaMap[areaName].revenue += Number(item.subtotal || 0);
      }
    }

    summary.avgMinutesPerOrder = summary.totalOrders
      ? totalMinutes / summary.totalOrders
      : 0;

    summary.avgRevenuePerHour = totalHours
      ? summary.totalRevenue / totalHours
      : 0;

    summary.topAreas = Object.values(areaMap)
      .sort((a, b) => b.orderCount - a.orderCount || b.units - a.units)
      .slice(0, 10);

    summary.monthlyStats = Object.values(monthMap).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    summary.costBreakdown = [
      { name: "Gas", value: summary.totalGasFee },
      { name: "Labor", value: summary.totalLaborCost },
      { name: "Profit", value: Math.max(summary.totalProfit, 0) },
    ];

    summary.recentOrders = orders
      .slice(-10)
      .reverse()
      .map((order) => ({
        _id: order._id,
        orderDate: order.orderDate,
        totalUnits: order.totalUnits,
        salesAmount: order.salesAmount,
        investmentAmount: order.investmentAmount,
        profit: order.profit,
      }));

    res.json(summary);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: err.message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
