// middleware/ensureHostReadyForListing.js
const User = require("../models/User");

async function ensureHostReadyForListing(req, res, next) {
  try {
    const u = await User.findById(req.userId)
      .select([
        "roles",
        "kyc.status",
        "identityVerified",
        "phoneVerified",
        "paymentDetails.verified",
        "isDeleted",
      ])
      .lean();

    if (!u) return res.status(401).json({ message: "Unauthorized" });
    if (u.isDeleted)
      return res.status(403).json({ message: "Account is deactivated." });
    if (!(u.roles || []).includes("host")) {
      return res
        .status(403)
        .json({ message: "You must switch to Host to create a listing." });
    }
    if (u.kyc?.status !== "approved") {
      return res
        .status(403)
        .json({ message: "KYC approval required before creating a listing." });
    }
    if (!u.identityVerified) {
      return res
        .status(403)
        .json({
          message: "Upload ID (front/back) and live selfie to verify identity.",
        });
    }
    if (!u.phoneVerified) {
      return res
        .status(403)
        .json({ message: "Verify your mobile number to continue." });
    }
    if (!u.paymentDetails?.verified) {
      return res
        .status(403)
        .json({
          message: "Add and verify your payout method to receive earnings.",
        });
    }

    next();
  } catch (err) {
    console.error("ensureHostReadyForListing error:", err);
    res.status(500).json({ message: "Guard failed", error: err.message });
  }
}

module.exports = { ensureHostReadyForListing };
