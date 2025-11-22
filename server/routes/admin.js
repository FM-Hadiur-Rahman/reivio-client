// // === Imports ===
// const mongoose = require("mongoose");
// const express = require("express");
// const router = express.Router();
// const protect = require("../middleware/protect"); // ✅ Correct path
// const authorize = require("../middleware/authorize"); // For role check
// const User = require("../models/User");
// const Listing = require("../models/Listing");
// const Booking = require("../models/Booking");
// const sendEmail = require("../utils/sendEmail"); // make sure you have this
// const Payout = require("../models/Payout"); // 👈 import the model
// const DriverPayout = require("../models/DriverPayout");
// const Review = require("../models/Review");
// const PromoCode = require("../models/PromoCode");
// const GlobalConfig = require("../models/GlobalConfig"); // ✅ this must be present
// const { Parser } = require("json2csv");
// const ExcelJS = require("exceljs");

// // Example admin-only route

// router.get(
//   "/flagged/reviews",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     const flagged = await Review.find({ flagged: true })
//       .populate("userId")
//       .populate("listingId");
//     res.json(flagged);
//   }
// );

// // Flagged users

// // === User Management ===
// router.get("/users", protect, authorize("admin"), async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (err) {
//     console.error("❌ Failed to fetch users:", err);
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// });
// // In /routes/admin.js
// router.get("/users/:id", protect, authorize("admin"), async (req, res) => {
//   const user = await User.findById(req.params.id);
//   if (!user) return res.status(404).json({ message: "User not found" });
//   res.json(user);
// });

// // Get all listings (Admin only)
// router.put("/users/:id/role", protect, authorize("admin"), async (req, res) => {
//   const { role } = req.body;
//   if (!["user", "host", "admin"].includes(role)) {
//     return res.status(400).json({ message: "Invalid role" });
//   }

//   const user = await User.findByIdAndUpdate(
//     req.params.id,
//     { role },
//     { new: true }
//   );
//   res.json({ message: `User role updated to ${role}`, user });
// });

// router.get("/user-breakdown", protect, authorize("admin"), async (req, res) => {
//   const total = await User.countDocuments();
//   const guests = await User.countDocuments({ role: "guest" });
//   const hosts = await User.countDocuments({ role: "host" });

//   res.json({ total, guests, hosts });
// });

// // Get users with pending KYC

// // === Listing Management ===
// router.get("/listings", protect, authorize("admin"), async (req, res) => {
//   try {
//     const listings = await Listing.find().populate("hostId", "name email");
//     res.json(listings);
//   } catch (err) {
//     console.error("❌ Failed to fetch listings:", err);
//     res.status(500).json({ message: "Failed to fetch listings" });
//   }
// });
// // Get all bookings (Admin only)

// // === Booking Management ===
// router.get("/bookings", protect, authorize("admin"), async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("guestId", "name email")
//       .populate("listingId", "title location");
//     res.json(bookings);
//   } catch (err) {
//     console.error("❌ Failed to fetch bookings:", err);
//     res.status(500).json({ message: "Failed to fetch bookings" });
//   }
// });
// // Add to admin routes (/routes/admin.js)

// // === KYC Management ===
// router.get("/kyc", protect, authorize("admin"), async (req, res) => {
//   const pending = await User.find({ kycStatus: "pending" });
//   const approved = await User.find({ kycStatus: "approved" });
//   const rejected = await User.find({ kycStatus: "rejected" });

//   res.json({ pending, approved, rejected });
// });

// // Flagged listings
// router.get(
//   "/flagged/listings",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     const flagged = await Listing.find({ flagged: true }).populate("hostId");
//     res.json(flagged);
//   }
// );

// // Flagged reviews
// router.get("/kyc/pending", protect, authorize("admin"), async (req, res) => {
//   const users = await User.find({ "kyc.status": "pending" });
//   res.json(users);
// });

// // Update KYC status
// router.patch("/kyc/:userId", protect, authorize("admin"), async (req, res) => {
//   const { userId } = req.params;
//   const { status, reason } = req.body;

//   if (!["approved", "rejected"].includes(status)) {
//     return res.status(400).json({ message: "Invalid status" });
//   }

//   const user = await User.findById(userId);
//   if (!user) return res.status(404).json({ message: "User not found" });

//   user.kyc.status = status;
//   user.kyc.reason = status === "rejected" ? reason || "No reason provided" : "";
//   user.kyc.timestamp = new Date();
//   user.identityVerified = status === "approved";

//   await user.save();

//   // ✅ Send email notification
//   try {
//     await sendEmail({
//       to: user.email,
//       subject: `Your BanglaBnB KYC has been ${status}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; color: #1a202c; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
//           <h2 style="color: ${status === "approved" ? "#10b981" : "#ef4444"};">
//             KYC ${status.charAt(0).toUpperCase() + status.slice(1)}
//           </h2>
//           <p>Hello <strong>${user.name}</strong>,</p>
//           <p>Your identity verification request on <strong>BanglaBnB</strong> has been <strong>${status}</strong>.</p>
//           ${
//             status === "rejected"
//               ? `<p><strong>Reason:</strong> ${user.kyc.reason}</p>`
//               : ""
//           }
//           <p>If you have any questions, please contact support.</p>
//         </div>
//       `,
//     });
//     console.log("✅ Email sent to", user.email);
//   } catch (err) {
//     console.warn("⚠️ Email send failed:", err.message);
//   }

//   res.json({ message: `User KYC ${status}` });
// });

// // GET: fetch all flagged reviews, listings, and users

// // === Flagged Content ===
// router.get("/flagged/users", protect, authorize("admin"), async (req, res) => {
//   const flagged = await User.find({ flagged: true });
//   res.json(flagged);
// });
// router.get("/flagged", protect, authorize("admin"), async (req, res) => {
//   const users = await User.find({ flagged: true }).select("name email role");
//   const listings = await Listing.find({ flagged: true }).populate(
//     "hostId",
//     "name email"
//   );
//   const reviews = await Review.find({ flagged: true })
//     .populate("userId", "name email")
//     .populate("listingId", "title");

//   res.json({ users, listings, reviews });
// });
// // PUT: unflag an item
// router.put(
//   "/unflag/:type/:id",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     const { type, id } = req.params;
//     let item;

//     if (type === "user")
//       item = await User.findByIdAndUpdate(id, { flagged: false });
//     else if (type === "listing")
//       item = await Listing.findByIdAndUpdate(id, { flagged: false });
//     else if (type === "review")
//       item = await Review.findByIdAndUpdate(id, { flagged: false });
//     else return res.status(400).json({ message: "Invalid type" });

//     res.json({ message: "✅ Unflagged", item });
//   }
// );
// // Revenue analytics route

// // === Role Management ===

// // === Revenue Analytics ===
// router.get("/revenue", protect, authorize("admin"), async (req, res) => {
//   try {
//     const bookings = await Booking.find({ paymentStatus: "paid" }).populate({
//       path: "listingId",
//       populate: {
//         path: "hostId",
//         select: "name",
//       },
//     });

//     const PLATFORM_FEE_PERCENT = 10;
//     const TAX_PERCENT = 5;

//     let totalRevenue = 0;
//     let totalTax = 0;
//     let totalPlatformFee = 0;
//     let totalHostPayout = 0;

//     const monthly = {};
//     const listingMap = {};
//     const hostMap = {};

//     bookings.forEach((b) => {
//       const amount = b.paidAmount || 0;
//       const tax = (amount * TAX_PERCENT) / 100;
//       const fee = (amount * PLATFORM_FEE_PERCENT) / 100;
//       const hostIncome = amount - tax - fee;

//       totalRevenue += amount;
//       totalTax += tax;
//       totalPlatformFee += fee;
//       totalHostPayout += hostIncome;

//       const month = new Date(b.createdAt).toISOString().slice(0, 7);
//       monthly[month] = (monthly[month] || 0) + amount;

//       // Listings
//       const listing = b.listingId;
//       if (listing?._id) {
//         listingMap[listing._id] = listingMap[listing._id] || {
//           title: listing.title,
//           total: 0,
//         };
//         listingMap[listing._id].total += amount;
//       }

//       // Hosts
//       const host = listing?.hostId;
//       if (host?._id) {
//         hostMap[host._id] = hostMap[host._id] || {
//           name: host.name,
//           total: 0,
//         };
//         hostMap[host._id].total += hostIncome;
//       }
//     });

//     const topListings = Object.entries(listingMap)
//       .map(([id, info]) => ({ id, ...info }))
//       .sort((a, b) => b.total - a.total)
//       .slice(0, 5);

//     const topHosts = Object.entries(hostMap)
//       .map(([id, info]) => ({ id, ...info }))
//       .sort((a, b) => b.total - a.total)
//       .slice(0, 5);

//     res.json({
//       totalRevenue,
//       totalTax,
//       totalPlatformFee,
//       totalHostPayout,
//       monthly,
//       topListings,
//       topHosts,
//     });
//   } catch (err) {
//     console.error("❌ Revenue analytics error:", err);
//     res.status(500).json({ message: "Failed to fetch revenue data" });
//   }
// });

// // GET: Fetch all pending payouts
// router.get(
//   "/payouts/pending",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const payouts = await Payout.find({ status: "pending" })
//         .populate("bookingId", "paidAmount createdAt")
//         .populate("hostId", "name email phone");

//       res.json(payouts);
//     } catch (err) {
//       console.error("❌ Failed to fetch pending payouts:", err);
//       res.status(500).json({ message: "Failed to fetch payouts" });
//     }
//   }
// );
// router.put(
//   "/payouts/:id/mark-paid",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const payout = await Payout.findByIdAndUpdate(
//         req.params.id,
//         { status: "paid", date: new Date() },
//         { new: true }
//       );

//       // 🛠 Also update the booking record
//       if (payout?.bookingId) {
//         await Booking.findByIdAndUpdate(payout.bookingId, {
//           payoutIssued: true,
//         });
//       }

//       res.json({ message: "✅ Payout marked as paid", payout });
//     } catch (err) {
//       console.error("❌ Failed to update payout:", err);
//       res.status(500).json({ message: "Failed to update payout" });
//     }
//   }
// );

// // ===Driver Payout Management ===
// // GET: Fetch all pending driver payouts
// router.get(
//   "/driver-payouts/pending",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const payouts = await DriverPayout.find({ status: "pending" })
//         .populate("tripId", "fare createdAt")
//         .populate("driverId", "name email phone");

//       res.json(payouts);
//     } catch (err) {
//       console.error("❌ Failed to fetch driver payouts:", err);
//       res.status(500).json({ message: "Failed to fetch driver payouts" });
//     }
//   }
// );

// // PUT: Mark driver payout as paid
// router.put(
//   "/driver-payouts/:id/mark-paid",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const payout = await DriverPayout.findByIdAndUpdate(
//         req.params.id,
//         { status: "paid", paidAt: new Date() },
//         { new: true }
//       );

//       // Optional: Update Trip if needed
//       if (payout?.tripId) {
//         await Trip.findByIdAndUpdate(payout.tripId, {
//           payoutIssued: true,
//         });
//       }

//       res.json({ message: "✅ Driver payout marked as paid", payout });
//     } catch (err) {
//       console.error("❌ Failed to mark driver payout as paid:", err);
//       res.status(500).json({ message: "Failed to update driver payout" });
//     }
//   }
// );

// // === Miscellaneous Stats ===
// // /routes/admin.js
// router.get("/stats", protect, authorize("admin"), async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const guests = await User.countDocuments({ role: "user" });
//     const hosts = await User.countDocuments({ role: "host" });
//     const driver = await User.countDocuments({ role: "driver" });
//     const totalListings = await Listing.countDocuments();
//     const totalBookings = await Booking.countDocuments({
//       paymentStatus: "paid",
//     });

//     const revenue = await Booking.aggregate([
//       { $match: { paymentStatus: "paid" } },
//       { $group: { _id: null, total: { $sum: "$paidAmount" } } },
//     ]);

//     res.json({
//       users: totalUsers,
//       guests,
//       hosts,
//       driver,
//       listings: totalListings,
//       bookings: totalBookings,
//       revenue: revenue[0]?.total || 0,
//     });
//   } catch (err) {
//     console.error("❌ Failed to fetch admin stats:", err);
//     res.status(500).json({ message: "Failed to load stats" });
//   }
// });

// // Get all users (Admin only)
// router.get("/stats", protect, authorize("admin"), async (req, res) => {
//   const totalUsers = await User.countDocuments();
//   const guests = await User.countDocuments({ role: "user" });
//   const hosts = await User.countDocuments({ role: "host" });
//   const totalListings = await Listing.countDocuments();
//   const totalBookings = await Booking.countDocuments({ paymentStatus: "paid" });

//   const revenue = await Booking.aggregate([
//     { $match: { paymentStatus: "paid" } },
//     { $group: { _id: null, total: { $sum: "$paidAmount" } } },
//   ]);

//   res.json({
//     users: totalUsers,
//     guests,
//     hosts,
//     listings: totalListings,
//     bookings: totalBookings,
//     revenue: revenue[0]?.total || 0,
//   });
// });

// router.get(
//   "/refund-requests",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     const bookings = await Booking.find({
//       "extraPayment.status": "refund_requested",
//     })
//       .populate("guestId")
//       .populate("listingId");

//     res.json(bookings);
//   }
// );

// router.patch(
//   "/mark-refunded/:id",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     const booking = await Booking.findById(req.params.id);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     booking.extraPayment.status = "refunded";
//     await booking.save();

//     res.json({ message: "Refund marked as completed" });
//   }
// );

// // === Other ===
// // === Monthly Reviews Stats ===
// router.get(
//   "/stats/reviews",
//   protect,
//   authorize("admin", "host"),
//   async (req, res) => {
//     try {
//       let matchStage = {};

//       // If host, limit to reviews from their listings
//       if (req.user.role === "host") {
//         const hostId = req.user._id;
//         const listings = await Listing.find({ hostId }).select("_id");
//         const listingIds = listings.map((l) => l._id);

//         matchStage = {
//           listingId: { $in: listingIds },
//         };
//       }

//       const data = await Review.aggregate([
//         { $match: matchStage },
//         {
//           $group: {
//             _id: {
//               $dateToString: { format: "%Y-%m", date: "$createdAt" },
//             },
//             count: { $sum: 1 },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]);

//       const result = data.map((item) => ({
//         month: item._id,
//         count: item.count,
//       }));

//       res.json(result);
//     } catch (err) {
//       console.error("❌ Failed to get review stats:", err);
//       res.status(500).json([]);
//     }
//   }
// );
// // === Monthly Earnings Stats ===
// router.get(
//   "/stats/earnings",
//   protect,
//   authorize("admin", "host"),
//   async (req, res) => {
//     try {
//       let matchStage = { paymentStatus: "paid" };

//       // If host, filter only bookings from their listings
//       if (req.user.role === "host") {
//         const hostId = req.user._id;
//         const listings = await Listing.find({ hostId }).select("_id");
//         const listingIds = listings.map((l) => l._id);

//         matchStage.listingId = { $in: listingIds };
//       }

//       const data = await Booking.aggregate([
//         { $match: matchStage },
//         {
//           $group: {
//             _id: {
//               $dateToString: { format: "%Y-%m", date: "$createdAt" },
//             },
//             amount: { $sum: "$paidAmount" },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]);

//       const result = data.map((item) => ({
//         month: item._id,
//         amount: item.amount,
//       }));

//       res.json(result);
//     } catch (err) {
//       console.error("❌ Failed to get earnings stats:", err);
//       res.status(500).json([]);
//     }
//   }
// );
// router.get(
//   "/payouts/overdue",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

//     const overdue = await Booking.find({
//       paymentStatus: "paid",
//       checkInAt: { $lte: cutoff },
//       payoutIssued: { $ne: true },
//     }).populate("guestId listingId");

//     res.json(overdue);
//   }
// );
// // Get all promo codes (admin only)
// router.get("/promocode", protect, authorize("admin"), async (req, res) => {
//   const promos = await PromoCode.find().sort({ createdAt: -1 });
//   res.json(promos);
// });

// // Create
// // Create
// router.post("/promocode", protect, authorize("admin"), async (req, res) => {
//   const promo = await PromoCode.create(req.body);
//   res.status(201).json(promo);
// });

// // Deactivate
// router.patch(
//   "/promocode/:id/deactivate",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     const promo = await PromoCode.findByIdAndUpdate(
//       req.params.id,
//       { active: false },
//       { new: true }
//     );
//     res.json(promo);
//   }
// );

// // Delete
// router.delete(
//   "/promocode/:id",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     await PromoCode.findByIdAndDelete(req.params.id);
//     res.json({ message: "Deleted" });
//   }
// );
// router.get("/referrals", protect, authorize("admin"), async (req, res) => {
//   const users = await User.find({ referralCode: { $exists: true } }).select(
//     "name email referralCode referralRewards"
//   );
//   const referred = await User.find({ referredBy: { $exists: true } }).select(
//     "name email referredBy createdAt"
//   );

//   res.json({ referrers: users, referred });
// });
// // Soft delete a user
// router.patch(
//   "/users/:id/soft-delete",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id);
//       if (!user || user.isDeleted) {
//         return res
//           .status(404)
//           .json({ message: "User not found or already deleted" });
//       }

//       user.isDeleted = true;
//       user.deletedAt = new Date();
//       await user.save();

//       res.json({ message: "✅ User soft-deleted", user });
//     } catch (err) {
//       console.error("❌ Failed to soft-delete user:", err);
//       res.status(500).json({ message: "Failed to soft-delete user" });
//     }
//   }
// );

// // Restore a soft-deleted user
// router.patch(
//   "/users/:id/restore",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id);
//       if (!user || !user.isDeleted) {
//         return res.status(404).json({ message: "Deleted user not found" });
//       }

//       user.isDeleted = false;
//       user.deletedAt = null;
//       await user.save();

//       res.json({ message: "✅ User restored", user });
//     } catch (err) {
//       console.error("❌ Failed to restore user:", err);
//       res.status(500).json({ message: "Failed to restore user" });
//     }
//   }
// );
// router.patch(
//   "/listings/:id/soft-delete",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const listing = await Listing.findById(req.params.id);
//       if (!listing || listing.isDeleted) {
//         return res
//           .status(404)
//           .json({ message: "Listing not found or already deleted" });
//       }

//       listing.isDeleted = true;
//       listing.deletedAt = new Date();
//       await listing.save();

//       res.json({ message: "✅ Listing soft-deleted", listing });
//     } catch (err) {
//       console.error("❌ Failed to soft-delete listing:", err);
//       res.status(500).json({ message: "Failed to soft-delete listing" });
//     }
//   }
// );
// router.patch(
//   "/listings/:id/restore",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const listing = await Listing.findById(req.params.id);
//       if (!listing || !listing.isDeleted) {
//         return res.status(404).json({ message: "Deleted listing not found" });
//       }

//       listing.isDeleted = false;
//       listing.deletedAt = null;
//       await listing.save();

//       res.json({ message: "✅ Listing restored", listing });
//     } catch (err) {
//       console.error("❌ Failed to restore listing:", err);
//       res.status(500).json({ message: "Failed to restore listing" });
//     }
//   }
// );
// // routes/admin.js
// // routes/admin.js
// router.patch(
//   "/toggle-maintenance",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       let config = await GlobalConfig.findOne();
//       if (!config) config = new GlobalConfig();

//       // Auto toggle instead of relying on request body
//       config.maintenanceMode = !config.maintenanceMode;
//       await config.save();

//       res.json({
//         message: "Maintenance mode toggled",
//         maintenanceMode: config.maintenanceMode,
//       });
//     } catch (err) {
//       console.error("Toggle failed:", err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );
// // /routes/admin.js

// router.get("/export/users", protect, authorize("admin"), async (req, res) => {
//   try {
//     const users = await User.find().select("-password -__v");
//     const fields = [
//       "_id",
//       "name",
//       "email",
//       "phone",
//       "role",
//       "isVerified",
//       "kyc.status",
//       "createdAt",
//     ];
//     const opts = { fields };
//     const parser = new Parser(opts);
//     const csv = parser.parse(users);

//     res.header("Content-Type", "text/csv");
//     res.attachment("users.csv");
//     return res.send(csv);
//   } catch (err) {
//     console.error("❌ Export failed:", err);
//     res.status(500).json({ message: "Failed to export users" });
//   }
// });

// router.get(
//   "/export/users-xlsx",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const users = await User.find().select("-password");

//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet("Users");

//       // Add header row
//       worksheet.columns = [
//         { header: "Name", key: "name", width: 25 },
//         { header: "Email", key: "email", width: 30 },
//         { header: "Role", key: "role", width: 15 },
//         { header: "Verified", key: "isVerified", width: 10 },
//         { header: "Created At", key: "createdAt", width: 20 },
//       ];

//       // Add user rows
//       users.forEach((user) => {
//         worksheet.addRow({
//           name: user.name || "N/A",
//           email: user.email || "N/A",
//           role: user.role || "N/A",
//           isVerified: user.isVerified ? "✅" : "❌",
//           createdAt: user.createdAt
//             ? user.createdAt.toISOString().split("T")[0]
//             : "N/A",
//         });
//       });

//       // Set response headers
//       res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       );
//       res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

//       // Write workbook to response
//       await workbook.xlsx.write(res);
//       res.end();
//     } catch (err) {
//       console.error("❌ Excel export error:", err);
//       res.status(500).json({ message: "Failed to export users as Excel" });
//     }
//   }
// );
// // routes/admin.js

// router.get("/search", protect, authorize("admin"), async (req, res) => {
//   const { query } = req.query;
//   if (!query) return res.status(400).json({ message: "Query is required" });

//   const results = {};
//   const isObjectId = mongoose.Types.ObjectId.isValid(query);

//   try {
//     // User by email or ID
//     const user = await User.findOne({
//       $or: [{ email: query }, ...(isObjectId ? [{ _id: query }] : [])],
//     }).select("-password");

//     if (user) results.user = user;

//     // Booking by ID or transaction
//     const booking = await Booking.findOne({
//       $or: [
//         ...(isObjectId ? [{ _id: query }] : []),
//         { "extraPayment.tran_id": query },
//       ],
//     })
//       .populate("guestId listingId")
//       .lean();

//     if (booking) results.booking = booking;

//     // Trip reservation by ID or tran_id
//     const tripRes = await require("../models/TripReservation")
//       .findOne({
//         $or: [...(isObjectId ? [{ _id: query }] : []), { tran_id: query }],
//       })
//       .populate("tripId userId")
//       .lean();

//     if (tripRes) results.tripReservation = tripRes;

//     res.json(results);
//   } catch (err) {
//     console.error("❌ Admin search failed:", err);
//     res.status(500).json({ message: "Search failed" });
//   }
// });

// router.get("/export-search", async (req, res) => {
//   const { query, type, token } = req.query;
//   if (!query || !type || !token) return res.status(400).send("Missing params");

//   const jwt = require("jsonwebtoken");
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const admin = await User.findById(decoded.id);
//   if (!admin || admin.role !== "admin")
//     return res.status(403).send("Forbidden");

//   const regex = new RegExp(query, "i");

//   const users = await User.find({
//     $or: [{ name: regex }, { email: regex }],
//   });

//   if (type === "csv") {
//     const fields = ["name", "email", "role", "isVerified"];
//     const parser = new Parser({ fields });
//     const csv = parser.parse(users);
//     res.header("Content-Type", "text/csv");
//     res.attachment("search_results.csv");
//     return res.send(csv);
//   }

//   if (type === "pdf") {
//     const doc = new PDFDocument();
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=search_results.pdf"
//     );
//     doc.pipe(res);
//     doc.fontSize(18).text("Search Results", { underline: true });
//     users.forEach((u) => {
//       doc.moveDown();
//       doc.text(`Name: ${u.name}`);
//       doc.text(`Email: ${u.email}`);
//       doc.text(`Role: ${u.role}`);
//       doc.text(`Verified: ${u.isVerified ? "Yes" : "No"}`);
//     });
//     doc.end();
//   }
// });
// // Get one booking (for admin detail view)
// // ✅ Admin-only route to fetch one booking
// router.get("/bookings/:id", protect, authorize("admin"), async (req, res) => {
//   const booking = await Booking.findById(req.params.id)
//     .populate("guestId", "name email phone")
//     .populate("listingId", "title location");

//   if (!booking) return res.status(404).json({ message: "Booking not found" });
//   res.json(booking);
// });
// router.get("/listings/:id", protect, authorize("admin"), async (req, res) => {
//   const listing = await Listing.findById(req.params.id).populate("hostId");
//   if (!listing) return res.status(404).json({ message: "Listing not found" });
//   res.json(listing);
// });
// const Trip = require("../models/Trip");
// router.get("/trips/:id", protect, authorize("admin"), async (req, res) => {
//   const trip = await Trip.findById(req.params.id).populate("driver");
//   if (!trip) return res.status(404).json({ message: "Trip not found" });
//   res.json(trip);
// });
// module.exports = router;

// routes/admin.js
const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

const ctrl = require("../controllers/adminController");

// every route requires admin unless explicitly widened
const adminOnly = [protect, authorize("admin")];

/* -------- Flagged -------- */
router.get("/flagged/reviews", ...adminOnly, ctrl.getFlaggedReviews);
router.get("/flagged/listings", ...adminOnly, ctrl.getFlaggedListings);
router.get("/flagged/users", ...adminOnly, ctrl.getFlaggedUsers);
router.get("/flagged", ...adminOnly, ctrl.getFlaggedAll);
router.put("/unflag/:type/:id", ...adminOnly, ctrl.unflagItem);

/* -------- Users -------- */
router.get("/users", ...adminOnly, ctrl.getUsers);
router.get("/users/:id", ...adminOnly, ctrl.getUserById);
router.put("/users/:id/role", ...adminOnly, ctrl.updateUserRole);
router.patch("/users/:id/soft-delete", ...adminOnly, ctrl.softDeleteUser);
router.patch("/users/:id/restore", ...adminOnly, ctrl.restoreUser);
router.get("/user-breakdown", ...adminOnly, ctrl.userBreakdown);

/* -------- Listings -------- */
router.get("/listings", ...adminOnly, ctrl.getListings);
router.get("/listings/:id", ...adminOnly, ctrl.getListingById);
router.patch("/listings/:id/soft-delete", ...adminOnly, ctrl.softDeleteListing);
router.patch("/listings/:id/restore", ...adminOnly, ctrl.restoreListing);

/* -------- Bookings -------- */
router.get("/bookings", ...adminOnly, ctrl.getBookings);
router.get("/bookings/:id", ...adminOnly, ctrl.getBookingById);

/* -------- KYC -------- */
router.get("/kyc", ...adminOnly, ctrl.getKycGroups);
router.get("/kyc/pending", ...adminOnly, ctrl.getKycPending);
router.patch("/kyc/:userId", ...adminOnly, ctrl.patchKycStatus);

/* -------- payment-accounts -------- */
router.get(
  "/payment-accounts/pending",
  ...adminOnly,
  ctrl.getPendingPaymentAccounts
);
router.patch(
  "/payment-accounts/:userId/verify",
  ...adminOnly,
  ctrl.adminVerifyPaymentDetails
);

/* -------- Revenue & Stats -------- */
router.get("/revenue", ...adminOnly, ctrl.getRevenue);
router.get("/stats", ...adminOnly, ctrl.getStats);
router.get(
  "/stats/reviews",
  protect,
  authorize("admin", "host"),
  ctrl.getMonthlyReviews
);
router.get(
  "/stats/earnings",
  protect,
  authorize("admin", "host"),
  ctrl.getMonthlyEarnings
);

/* -------- Payouts (Hosts) -------- */
router.get("/payouts/pending", ...adminOnly, ctrl.getPendingPayouts);
router.put("/payouts/:id/mark-paid", ...adminOnly, ctrl.markPayoutPaid);
router.get("/payouts/overdue", ...adminOnly, ctrl.getOverduePayouts);

/* -------- Payouts (Drivers) -------- */
router.get(
  "/driver-payouts/pending",
  ...adminOnly,
  ctrl.getPendingDriverPayouts
);
router.put(
  "/driver-payouts/:id/mark-paid",
  ...adminOnly,
  ctrl.markDriverPayoutPaid
);

/* -------- Maintenance -------- */
router.patch("/toggle-maintenance", ...adminOnly, ctrl.toggleMaintenance);

/* -------- Promo Codes -------- */
router.get("/promocode", ...adminOnly, ctrl.getPromocodes);
router.post("/promocode", ...adminOnly, ctrl.createPromocode);
router.patch(
  "/promocode/:id/deactivate",
  ...adminOnly,
  ctrl.deactivatePromocode
);
router.delete("/promocode/:id", ...adminOnly, ctrl.deletePromocode);

/* -------- Referrals -------- */
router.get("/referrals", ...adminOnly, ctrl.getReferrals);

/* -------- Export -------- */
router.get("/export/users", ...adminOnly, ctrl.exportUsersCSV);
router.get("/export/users-xlsx", ...adminOnly, ctrl.exportUsersXLSX);

/* -------- Search -------- */
router.get("/search", ...adminOnly, ctrl.adminSearch);
router.get("/export-search", ctrl.exportSearch); // performs its own token/admin check

/* -------- Trips -------- */
router.get("/trips/:id", ...adminOnly, ctrl.getTripById);

module.exports = router;
