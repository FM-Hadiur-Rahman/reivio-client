// cleanupVerifiedField.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");

(async () => {
  try {
    await connectDB();
    const result = await User.updateMany(
      { "paymentDetails.verified": { $exists: true } },
      { $unset: { "paymentDetails.verified": "" } }
    );
    console.log("✅ Cleanup done:", result);
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
})();
