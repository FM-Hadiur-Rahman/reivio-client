// scripts/seed-admin.js
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db.js");
const User = require("../models/User.js");

const {
  // sanity check only; connectDB should use this
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME = "Super Admin",
  ADMIN_PHONE = "+8801400921655",
} = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_PHONE) {
  console.error(
    "Missing MONGO_URI / ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_PHONE"
  );
  process.exit(1);
}

(async () => {
  try {
    await connectDB(); // make sure connectDB returns a promise
    console.log("MongoDB connected");

    // roles is an array → use $in
    const existingAdmin = await User.findOne({
      roles: { $in: ["admin"] },
    }).lean();

    if (existingAdmin) {
      console.log(
        "✅ Admin already exists ->",
        existingAdmin.email || existingAdmin._id
      );
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("ℹ️  No admin found. Creating one...");

    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // hashed by pre('save')
      phone: ADMIN_PHONE, // REQUIRED by your schema (BD regex)
      isVerified: true,
      phoneVerified: true,
      agreedToTerms: true,
      primaryRole: "admin",
      roles: ["admin", "user"],
    });

    await admin.save();
    console.log("🎉 Admin created:", admin.email);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err?.message || err);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
})();
