// controllers/userController.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/* ---------------- helpers ---------------- */
const pick = (obj, keys) =>
  keys.reduce(
    (acc, k) => (obj[k] !== undefined ? ((acc[k] = obj[k]), acc) : acc),
    {}
  );

const PAYMENT_SENSITIVE_KEYS = [
  "accountType",
  "accountNumber",
  "accountName",
  "bankName",
  "routingNumber",
];

/* ---------------- current user update ---------------- */
exports.updateCurrentUser = async (req, res) => {
  try {
    // NOTE: if you allow password change here, you must hash it in a pre-save hook or here.
    const allowed = [
      "name",
      "phone",
      "avatar",
      "email",
      "role",
      "primaryRole",
      "roles",
    ];
    const updates = pick(req.body, allowed);

    const userBefore = await User.findById(req.user._id)
      .select("-password")
      .lean();

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    // regen token only if sensitive identity fields actually changed
    const sensitiveFields = ["email", "password", "role", "primaryRole"];
    const hasSensitiveChange = sensitiveFields.some((k) => {
      const before = userBefore?.[k];
      const after = user?.[k];
      // roles array compare (shallow)
      if (k === "roles") {
        const b = Array.isArray(userBefore?.roles)
          ? userBefore.roles.join(",")
          : "";
        const a = Array.isArray(user?.roles) ? user.roles.join(",") : "";
        return b !== a;
      }
      return updates[k] !== undefined && before !== after;
    });

    const token = hasSensitiveChange ? generateToken(user) : undefined;
    res.json({ user, token });
  } catch (err) {
    console.error("❌ Failed to update user:", err);
    // Optional: handle unique email error
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(400).json({ error: "Email already in use." });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

/* ---------------- payment details: get ---------------- */
exports.getPaymentDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("paymentDetails");
    res.json(user?.paymentDetails || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment details" });
  }
};

/* ---------------- payment details: update (user) ---------------- */
exports.updatePaymentDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // ensure object exists
    user.paymentDetails = user.paymentDetails || {};

    // figure out if any sensitive keys changed
    let sensitiveChanged = false;
    for (const key of PAYMENT_SENSITIVE_KEYS) {
      if (
        req.body[key] !== undefined &&
        req.body[key] !== user.paymentDetails[key]
      ) {
        sensitiveChanged = true;
      }
    }

    // apply partial updates (only provided keys)
    for (const [k, v] of Object.entries(req.body)) {
      user.paymentDetails[k] = v;
    }

    // reset verification ONLY if sensitive fields changed
    if (sensitiveChanged) {
      user.paymentDetails.verified = false;
      user.paymentDetails.addedAt = new Date();
    }

    await user.save({ validateBeforeSave: true });

    // return fresh user snapshot for the frontend to cache
    const fresh = await User.findById(req.user._id).select("-password");
    res.json({
      message: "✅ Payment details updated",
      paymentDetails: fresh.paymentDetails,
      user: fresh,
    });
  } catch (err) {
    console.error("❌ Update failed:", err);
    res.status(500).json({ message: "Failed to update payment details" });
  }
};
/* ---------------- payment details: verify (admin) ---------------- */
exports.verifyPaymentDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body; // 'approved' | 'rejected'
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.paymentDetails) user.paymentDetails = {};

    user.paymentDetails.status = status;
    user.paymentDetails.reviewReason =
      status === "rejected" ? reason || "Not specified" : undefined;
    user.paymentDetails.reviewedBy = req.user._id;
    user.paymentDetails.reviewedAt = new Date();

    await user.save();

    // (optional) sendEmail({ to: user.email, ... })

    res.json({
      message: `Payout account ${status}`,
      paymentDetails: user.paymentDetails,
    });
  } catch (err) {
    console.error("❌ Verify payment failed:", err);
    res.status(500).json({ message: "Failed to verify payment details" });
  }
};

/* ---------------- payment details: verify (admin) ---------------- */
// attach this to an admin-only route like PATCH /api/admin/users/:id/payment-verify
// exports.verifyPaymentDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { verified = true, note = "" } = req.body;

//     const user = await User.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           "paymentDetails.verified": !!verified,
//           ...(note ? { "paymentDetails.note": String(note) } : {}),
//         },
//       },
//       { new: true, runValidators: true }
//     ).select("-password");

//     if (!user) return res.status(404).json({ message: "User not found" });
//     return res.json({ ok: true, user });
//   } catch (err) {
//     console.error("❌ Verify payment failed:", err);
//     res.status(500).json({ message: "Failed to verify payment details" });
//   }
// };
