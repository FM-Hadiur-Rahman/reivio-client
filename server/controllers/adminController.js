// controllers/adminController.js
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const PromoCode = require("../models/PromoCode");
const GlobalConfig = require("../models/GlobalConfig");
const Payout = require("../models/Payout");
const DriverPayout = require("../models/DriverPayout");
const Trip = require("../models/Trip");
const sendEmail = require("../utils/email/sendEmail");

/* ===================== FLAGGED ===================== */
exports.getFlaggedReviews = async (req, res) => {
  const flagged = await Review.find({ flagged: true })
    .populate("userId")
    .populate("listingId");
  res.json(flagged);
};

exports.getFlaggedListings = async (req, res) => {
  const flagged = await Listing.find({ flagged: true }).populate("hostId");
  res.json(flagged);
};

exports.getFlaggedUsers = async (req, res) => {
  const flagged = await User.find({ flagged: true });
  res.json(flagged);
};

exports.getFlaggedAll = async (req, res) => {
  const users = await User.find({ flagged: true }).select(
    "name email primaryRole"
  );
  const listings = await Listing.find({ flagged: true }).populate(
    "hostId",
    "name email"
  );
  const reviews = await Review.find({ flagged: true })
    .populate("userId", "name email")
    .populate("listingId", "title");
  res.json({ users, listings, reviews });
};

exports.unflagItem = async (req, res) => {
  const { type, id } = req.params;
  let item;
  if (type === "user")
    item = await User.findByIdAndUpdate(id, { flagged: false });
  else if (type === "listing")
    item = await Listing.findByIdAndUpdate(id, { flagged: false });
  else if (type === "review")
    item = await Review.findByIdAndUpdate(id, { flagged: false });
  else return res.status(400).json({ message: "Invalid type" });
  res.json({ message: "✅ Unflagged", item });
};

/* ===================== USERS ===================== */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "host", "driver", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      primaryRole: role,
      $addToSet: { roles: role },
    },
    { new: true }
  );

  res.json({ message: `Primary role updated to ${role}`, user });
};

exports.userBreakdown = async (req, res) => {
  const total = await User.countDocuments();
  const users = await User.countDocuments({ primaryRole: "user" });
  const hosts = await User.countDocuments({ primaryRole: "host" });
  const drivers = await User.countDocuments({ primaryRole: "driver" });
  res.json({ total, users, hosts, drivers });
};

/* ---- Soft delete / restore ---- */
exports.softDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res
        .status(404)
        .json({ message: "User not found or already deleted" });
    }
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    res.json({ message: "✅ User soft-deleted", user });
  } catch (err) {
    console.error("❌ Failed to soft-delete user:", err);
    res.status(500).json({ message: "Failed to soft-delete user" });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.isDeleted) {
      return res.status(404).json({ message: "Deleted user not found" });
    }
    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();
    res.json({ message: "✅ User restored", user });
  } catch (err) {
    console.error("❌ Failed to restore user:", err);
    res.status(500).json({ message: "Failed to restore user" });
  }
};

/* ===================== LISTINGS ===================== */
exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate("hostId", "name email");
    res.json(listings);
  } catch (err) {
    console.error("❌ Failed to fetch listings:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
};

exports.getListingById = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("hostId");
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  res.json(listing);
};

exports.softDeleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.isDeleted) {
      return res
        .status(404)
        .json({ message: "Listing not found or already deleted" });
    }
    listing.isDeleted = true;
    listing.deletedAt = new Date();
    await listing.save();
    res.json({ message: "✅ Listing soft-deleted", listing });
  } catch (err) {
    console.error("❌ Failed to soft-delete listing:", err);
    res.status(500).json({ message: "Failed to soft-delete listing" });
  }
};

exports.restoreListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || !listing.isDeleted) {
      return res.status(404).json({ message: "Deleted listing not found" });
    }
    listing.isDeleted = false;
    listing.deletedAt = null;
    await listing.save();
    res.json({ message: "✅ Listing restored", listing });
  } catch (err) {
    console.error("❌ Failed to restore listing:", err);
    res.status(500).json({ message: "Failed to restore listing" });
  }
};

/* ===================== BOOKINGS ===================== */
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("guestId", "name email")
      .populate("listingId", "title location");
    res.json(bookings);
  } catch (err) {
    console.error("❌ Failed to fetch bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("guestId", "name email phone")
    .populate("listingId", "title location");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};

/* ===================== KYC ===================== */
exports.getKycGroups = async (req, res) => {
  const pending = await User.find({ "kyc.status": "pending" });
  const approved = await User.find({ "kyc.status": "approved" });
  const rejected = await User.find({ "kyc.status": "rejected" });
  res.json({ pending, approved, rejected });
};

exports.getKycPending = async (req, res) => {
  const users = await User.find({ "kyc.status": "pending" });
  res.json(users);
};

exports.patchKycStatus = async (req, res) => {
  const { userId } = req.params;
  const { status, reason } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.kyc.status = status;
  user.kyc.reason = status === "rejected" ? reason || "No reason provided" : "";
  user.kyc.timestamp = new Date();
  user.identityVerified = status === "approved";
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: `Your BanglaBnB KYC has been ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a202c; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
          <h2 style="color: ${status === "approved" ? "#10b981" : "#ef4444"};">
            KYC ${status.charAt(0).toUpperCase() + status.slice(1)}
          </h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your identity verification request on <strong>BanglaBnB</strong> has been <strong>${status}</strong>.</p>
          ${
            status === "rejected"
              ? `<p><strong>Reason:</strong> ${user.kyc.reason}</p>`
              : ""
          }
          <p>If you have any questions, please contact support.</p>
        </div>
      `,
    });
  } catch (err) {
    console.warn("⚠️ Email send failed:", err.message);
  }

  res.json({ message: `User KYC ${status}` });
};

/* ===================== PAYMENT ACCOUNTS ===================== */
exports.getPendingPaymentAccounts = async (req, res) => {
  const users = await User.find({ "paymentDetails.status": "pending" }).select(
    "name email phone paymentDetails"
  );
  res.json(users);
};

exports.adminVerifyPaymentDetails = async (req, res) => {
  const { userId } = req.params;
  const { status, reason } = req.body; // 'approved' | 'rejected'
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const user = await User.findById(userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  user.paymentDetails = user.paymentDetails || {};
  user.paymentDetails.status = status;
  user.paymentDetails.verified = status === "approved";
  user.paymentDetails.reviewReason =
    status === "rejected" ? reason || "Not specified" : undefined;
  user.paymentDetails.reviewedBy = req.user._id;
  user.paymentDetails.reviewedAt = new Date();

  await user.save();
  res.json({
    message: `Payout account ${status}`,
    paymentDetails: user.paymentDetails,
  });
};

/* ===================== REVENUE & STATS ===================== */
exports.getRevenue = async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "paid" }).populate({
      path: "listingId",
      populate: { path: "hostId", select: "name" },
    });

    const PLATFORM_FEE_PERCENT = 10;
    const TAX_PERCENT = 5;
    let totalRevenue = 0,
      totalTax = 0,
      totalPlatformFee = 0,
      totalHostPayout = 0;
    const monthly = {},
      listingMap = {},
      hostMap = {};

    bookings.forEach((b) => {
      const amount = b.paidAmount || 0;
      const tax = (amount * TAX_PERCENT) / 100;
      const fee = (amount * PLATFORM_FEE_PERCENT) / 100;
      const hostIncome = amount - tax - fee;

      totalRevenue += amount;
      totalTax += tax;
      totalPlatformFee += fee;
      totalHostPayout += hostIncome;

      const month = new Date(b.createdAt).toISOString().slice(0, 7);
      monthly[month] = (monthly[month] || 0) + amount;

      const listing = b.listingId;
      if (listing?._id) {
        listingMap[listing._id] = listingMap[listing._id] || {
          title: listing.title,
          total: 0,
        };
        listingMap[listing._id].total += amount;
      }

      const host = listing?.hostId;
      if (host?._id) {
        hostMap[host._id] = hostMap[host._id] || { name: host.name, total: 0 };
        hostMap[host._id].total += hostIncome;
      }
    });

    const topListings = Object.entries(listingMap)
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const topHosts = Object.entries(hostMap)
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalTax,
      totalPlatformFee,
      totalHostPayout,
      monthly,
      topListings,
      topHosts,
    });
  } catch (err) {
    console.error("❌ Revenue analytics error:", err);
    res.status(500).json({ message: "Failed to fetch revenue data" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const users = await User.countDocuments({ primaryRole: "user" });
    const hosts = await User.countDocuments({ primaryRole: "host" });
    const drivers = await User.countDocuments({ primaryRole: "driver" });
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments({
      paymentStatus: "paid",
    });

    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    res.json({
      users: totalUsers,
      guests: users,
      hosts,
      drivers,
      listings: totalListings,
      bookings: totalBookings,
      revenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    console.error("❌ Failed to fetch admin stats:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
};
/* ===================== MONTHLY REVIEWS & EARNINGS STATS ===================== */
exports.getMonthlyReviews = async (req, res) => {
  try {
    let matchStage = {};

    // If host, filter reviews for their own listings
    if (req.user.primaryRole === "host") {
      const listings = await Listing.find({ hostId: req.user._id }).select(
        "_id"
      );
      const listingIds = listings.map((l) => l._id);
      matchStage.listingId = { $in: listingIds };
    }

    const data = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = data.map((item) => ({
      month: item._id,
      count: item.count,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Failed to get review stats:", err);
    res.status(500).json([]);
  }
};

exports.getMonthlyEarnings = async (req, res) => {
  try {
    let matchStage = { paymentStatus: "paid" };

    // If host, only include bookings from their listings
    if (req.user.primaryRole === "host") {
      const listings = await Listing.find({ hostId: req.user._id }).select(
        "_id"
      );
      const listingIds = listings.map((l) => l._id);
      matchStage.listingId = { $in: listingIds };
    }

    const data = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          amount: { $sum: "$paidAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = data.map((item) => ({
      month: item._id,
      amount: item.amount,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Failed to get earnings stats:", err);
    res.status(500).json([]);
  }
};

/* ===================== PAYOUTS ===================== */
exports.getPendingPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ status: "pending" })
      .populate("bookingId", "paidAmount createdAt")
      .populate("hostId", "name email phone");
    res.json(payouts);
  } catch (err) {
    console.error("❌ Failed to fetch pending payouts:", err);
    res.status(500).json({ message: "Failed to fetch payouts" });
  }
};

exports.markPayoutPaid = async (req, res) => {
  try {
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status: "paid", date: new Date() },
      { new: true }
    );
    if (payout?.bookingId) {
      await Booking.findByIdAndUpdate(payout.bookingId, { payoutIssued: true });
    }
    res.json({ message: "✅ Payout marked as paid", payout });
  } catch (err) {
    console.error("❌ Failed to update payout:", err);
    res.status(500).json({ message: "Failed to update payout" });
  }
};

exports.getOverduePayouts = async (req, res) => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const overdue = await Booking.find({
    paymentStatus: "paid",
    checkInAt: { $lte: cutoff },
    payoutIssued: { $ne: true },
  }).populate("guestId listingId");
  res.json(overdue);
};

/* ---- Driver payouts ---- */
exports.getPendingDriverPayouts = async (req, res) => {
  try {
    const payouts = await DriverPayout.find({ status: "pending" })
      .populate("tripId", "fare createdAt")
      .populate("driverId", "name email phone");
    res.json(payouts);
  } catch (err) {
    console.error("❌ Failed to fetch driver payouts:", err);
    res.status(500).json({ message: "Failed to fetch driver payouts" });
  }
};

exports.markDriverPayoutPaid = async (req, res) => {
  try {
    const payout = await DriverPayout.findByIdAndUpdate(
      req.params.id,
      { status: "paid", paidAt: new Date() },
      { new: true }
    );
    if (payout?.tripId) {
      await Trip.findByIdAndUpdate(payout.tripId, { payoutIssued: true });
    }
    res.json({ message: "✅ Driver payout marked as paid", payout });
  } catch (err) {
    console.error("❌ Failed to update driver payout:", err);
    res.status(500).json({ message: "Failed to update driver payout" });
  }
};

/* ===================== MAINTENANCE ===================== */
exports.toggleMaintenance = async (req, res) => {
  try {
    let config = await GlobalConfig.findOne();
    if (!config) config = new GlobalConfig();
    config.maintenanceMode = !config.maintenanceMode;
    await config.save();
    res.json({
      message: "Maintenance mode toggled",
      maintenanceMode: config.maintenanceMode,
    });
  } catch (err) {
    console.error("Toggle failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== PROMOCODES ===================== */
exports.getPromocodes = async (req, res) => {
  const promos = await PromoCode.find().sort({ createdAt: -1 });
  res.json(promos);
};

exports.createPromocode = async (req, res) => {
  const promo = await PromoCode.create(req.body);
  res.status(201).json(promo);
};

exports.deactivatePromocode = async (req, res) => {
  const promo = await PromoCode.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );
  res.json(promo);
};

exports.deletePromocode = async (req, res) => {
  await PromoCode.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

/* ===================== REFERRALS ===================== */
exports.getReferrals = async (req, res) => {
  const referrers = await User.find({ referralCode: { $exists: true } }).select(
    "name email referralCode referralRewards"
  );
  const referred = await User.find({ referredBy: { $exists: true } }).select(
    "name email referredBy createdAt"
  );
  res.json({ referrers, referred });
};

/* ===================== EXPORTS ===================== */
exports.exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    const rows = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.primaryRole || "user",
      isVerified: u.isVerified,
      kycStatus: u.kyc?.status,
      createdAt: u.createdAt,
    }));
    const fields = Object.keys(rows[0] || {});
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ Export failed:", err);
    res.status(500).json({ message: "Failed to export users" });
  }
};

exports.exportUsersXLSX = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");
    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Role", key: "role", width: 15 },
      { header: "Verified", key: "isVerified", width: 10 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];
    users.forEach((u) =>
      worksheet.addRow({
        name: u.name || "N/A",
        email: u.email || "N/A",
        role: u.primaryRole || "user",
        isVerified: u.isVerified ? "✅" : "❌",
        createdAt: u.createdAt
          ? u.createdAt.toISOString().split("T")[0]
          : "N/A",
      })
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Excel export error:", err);
    res.status(500).json({ message: "Failed to export users as Excel" });
  }
};

/* ===================== SEARCH ===================== */
exports.adminSearch = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const results = {};
  const isObjectId = mongoose.Types.ObjectId.isValid(query);
  try {
    const user = await User.findOne({
      $or: [{ email: query }, ...(isObjectId ? [{ _id: query }] : [])],
    }).select("-password");
    if (user) results.user = user;

    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: query }] : []),
        { "extraPayment.tran_id": query },
      ],
    })
      .populate("guestId listingId")
      .lean();
    if (booking) results.booking = booking;

    const TripReservation = require("../models/TripReservation");
    const tripRes = await TripReservation.findOne({
      $or: [...(isObjectId ? [{ _id: query }] : []), { tran_id: query }],
    })
      .populate("tripId userId")
      .lean();
    if (tripRes) results.tripReservation = tripRes;

    res.json(results);
  } catch (err) {
    console.error("❌ Admin search failed:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

exports.getTripById = async (req, res) => {
  const trip = await Trip.findById(req.params.id).populate("driver");
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json(trip);
};

/* ===================== EXPORT SEARCH RESULTS ===================== */
exports.exportSearch = async (req, res) => {
  try {
    const { query, type, token } = req.query;
    if (!query || !type || !token)
      return res.status(400).send("Missing params");

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);
    if (!admin || admin.primaryRole !== "admin")
      return res.status(403).send("Forbidden");

    const regex = new RegExp(query, "i");

    // You can choose to export only users here
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
    }).select("name email primaryRole isVerified");

    if (type === "csv") {
      const fields = ["name", "email", "primaryRole", "isVerified"];
      const parser = new Parser({ fields });
      const csv = parser.parse(users);
      res.header("Content-Type", "text/csv");
      res.attachment("search_results.csv");
      return res.send(csv);
    }

    if (type === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=search_results.pdf"
      );
      doc.pipe(res);
      doc.fontSize(18).text("Search Results", { underline: true });
      users.forEach((u) => {
        doc.moveDown();
        doc.text(`Name: ${u.name}`);
        doc.text(`Email: ${u.email}`);
        doc.text(`Role: ${u.primaryRole}`);
        doc.text(`Verified: ${u.isVerified ? "Yes" : "No"}`);
      });
      doc.end();
    }
  } catch (err) {
    console.error("❌ Export search failed:", err);
    res.status(500).send("Export failed");
  }
};
