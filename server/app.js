// server/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

const logRoute = require("./routes/log");
const adminLogRoutes = require("./routes/adminLogs");

const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listing");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin"); // ✅ Admin routes
const reviewRoutes = require("./routes/reviewRoutes"); // 👈 Add this
const statsRoutes = require("./routes/stats");
const userRoutes = require("./routes/userRoutes.js");
const paymentRoutes = require("./routes/payment");
const notificationRoutes = require("./routes/notificationRoutes");
const invoiceRoutes = require("./routes/invoice");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const tripRoutes = require("./routes/tripRoutes");
const tripPaymentRoutes = require("./routes/tripPayment");
const bannerRoutes = require("./routes/banner");
const checkMaintenance = require("./middleware/checkMaintenance");
const GlobalConfig = require("./models/GlobalConfig");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from localhost and production
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://reivio.com",
      "https://routeroof.com",
      "https://banglabnb.com",
      "http://localhost:8081", // Expo web
      "exp://192.168.0.112:8081", // optional: Expo Go app if needed
    ],

    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true })); // ✅ For form-encoded data
app.use(express.json());
app.use("/invoices", express.static(path.join(__dirname, "invoices")));

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// BEFORE all route handlers — place this BEFORE checkMaintenance
app.use(async (req, res, next) => {
  // Allow admin to toggle even during maintenance
  if (
    (req.path === "/api/admin/toggle-maintenance" && req.method === "PATCH") ||
    (req.path === "/api/config" && req.method === "GET")
  ) {
    return next();
  }

  let config = await GlobalConfig.findOne();

  // 🔐 Fallback if config is missing
  if (!config) config = await GlobalConfig.create({ maintenanceMode: false });

  if (config.maintenanceMode) {
    return res
      .status(503)
      .json({ message: "🚧 BanglaBnB is under maintenance" });
  }

  next();
});

// 🧼 REMOVE this line (already handled above)
// app.use(checkMaintenance); // ❌ remove or comment out

app.get("/", (req, res) => {
  res.send("BanglaBnB API is running");
});

// ✅ Mount routes
app.use("/api/logs", logRoute);
app.use("/api/admin/logs", adminLogRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes); // 👈 mount it like other routes
app.use("/api/reviews", reviewRoutes); // 👈 Mount here
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/chats", chatRoutes); // All chat endpoints: /api/chats
app.use("/api/messages", messageRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trip-payment", tripPaymentRoutes);
app.use("/api/combined-bookings", require("./routes/combinedBooking"));
app.use("/api/combined-payment", require("./routes/combinedPayment"));
app.use("/api/banners", bannerRoutes);
app.use("/api/upload", require("./routes/upload"));
app.use("/api/promocode", require("./routes/promocode"));
app.use("/api/config", require("./routes/config"));

app.use((err, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://routeroof.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(500).json({ message: "Internal Server Error" });
});

require("./cron/premiumReminder");

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });
