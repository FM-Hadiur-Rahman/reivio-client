const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Booking = require("../models/Booking");
const User = require("../models/User");
const sendEmail = require("../utils/email/sendEmail");
const generateToken = require("../utils/generateToken");
const { cloudinary } = require("../config/cloudinary"); // adjust the path if needed

exports.getMe = async (req, res) => {
  try {
    const fresh = await User.findById(req.userId)
      .select([
        "name",
        "email",
        "phone",
        "avatar",
        "isVerified",
        "phoneVerified",
        "identityVerified",
        "primaryRole",
        "roles",
        "kyc.status",
        "paymentDetails.verified",
      ])
      .lean();

    if (!fresh) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user: {
        ...fresh,
        paymentDetails: { verified: Boolean(fresh.paymentDetails?.verified) },
        kyc: fresh.kyc || null,
      },
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.registerStep1 = async (req, res) => {
  let createdUserId = null;

  try {
    const {
      name,
      email,
      password,
      phone,
      primaryRole,
      roles,
      location,
      drivingLicense,
      vehicleType,
      seatsOffered,
      referralCode,
      agreedToTerms,
    } = req.body;

    const { division, district } = location || {};

    // ✅ 1) Field validation (return ALL errors)
    const errors = {};
    if (!name) errors.name = "Name is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!phone) errors.phone = "Phone is required";
    if (!division) errors.division = "Division is required";
    if (!district) errors.district = "District is required";
    if (!agreedToTerms) errors.agreedToTerms = "You must accept terms";

    if (primaryRole === "driver") {
      if (!drivingLicense)
        errors.drivingLicense = "Driving license is required";
      if (!vehicleType) errors.vehicleType = "Vehicle type is required";
      if (!seatsOffered) errors.seatsOffered = "Seats offered is required";
    }

    if (Object.keys(errors).length) {
      return res
        .status(400)
        .json({ message: "Validation failed", fields: errors });
    }

    // ✅ 2) Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // ✅ 3) Check existing user
    const existing = await User.findOne({ email: normalizedEmail });

    // 3a) If verified user exists → block
    if (existing && existing.isVerified) {
      return res.status(400).json({
        message: "Email already exists",
        fields: { email: "This email is already registered" },
      });
    }

    // 3b) If user exists but not verified → resend token + return OK (no new user)
    if (existing && !existing.isVerified) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      existing.verificationToken = hashedToken;
      existing.verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await existing.save({ validateBeforeSave: false });

      const verifyUrl = `${
        process.env.CLIENT_URL
      }/verify-email?token=${encodeURIComponent(rawToken)}`;

      try {
        await sendEmail({
          to: normalizedEmail,
          subject: "Verify your Reivio account",
          html: `<h2>Hello ${existing.name},</h2>
            <p>You already started signup but your email is not verified.</p>
            <p>Please verify your email:</p>
            <a href="${verifyUrl}">🌐 Verify via Web</a><br/>
            <a href="reiviomobile://verify-email?token=${encodeURIComponent(
              rawToken
            )}">📱 Open in App</a>`,
        });
      } catch (e) {
        // Don't block user if email fails — they can try resend again
        console.error("❌ Resend verification email failed:", e.message);
      }

      return res.status(200).json({
        message:
          "You already signed up but not verified. We re-sent the verification email.",
        userId: existing._id,
        resent: true,
      });
    }

    // ✅ 4) Referral code (optional; never blocks)
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({
        referralCode: String(referralCode).toUpperCase(),
      }).lean();

      if (referrer) referredBy = String(referralCode).toUpperCase();
      else console.warn("⚠️ Invalid referral code");
    }

    // ✅ 5) Create verification token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // ✅ 6) Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      primaryRole,
      roles,
      location,
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      identityVerified: false,
      signupStep: 1,
      referredBy,
      agreedToTerms: true,
      ...(primaryRole === "driver" && {
        driver: { drivingLicense, vehicleType, seatsOffered },
      }),
    });

    createdUserId = user._id;

    // ✅ 7) Send verification email (rollback if it fails)
    const verifyUrl = `${
      process.env.CLIENT_URL
    }/verify-email?token=${encodeURIComponent(rawToken)}`;

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your Reivio account",
      html: `<h2>Hi ${name},</h2>
        <p>Please verify your email:</p>
        <a href="${verifyUrl}">🌐 Verify via Web</a><br/>
        <a href="reiviomobile://verify-email?token=${encodeURIComponent(
          rawToken
        )}">📱 Open in App</a>`,
    });

    return res.status(201).json({
      message: "✅ Step 1 complete. Check your email to verify your account.",
      userId: user._id,
    });
  } catch (err) {
    console.error("❌ Error in registerStep1:", err);

    // ✅ Rollback only if we actually created a new user
    if (createdUserId) {
      try {
        await User.findByIdAndDelete(createdUserId);
        console.warn(
          "🧹 Rolled back user due to failed signup step1:",
          createdUserId
        );
      } catch (rollbackErr) {
        console.error("❌ Rollback failed:", rollbackErr.message);
      }
    }

    return res
      .status(500)
      .json({ message: "Registration failed. Please try again." });
  }
};

exports.verifyIdentityHandler = async (req, res) => {
  try {
    const { userId, livePhotoBase64 } = req.body;
    const files = req.files || {};

    const idDocument = files.idDocument?.[0];
    const idBack = files.idBack?.[0];
    const livePhoto = files.livePhoto?.[0]; // optional
    const drivingLicense = files.drivingLicense?.[0]; // optional (driver)

    // ✅ Field-level validation
    const errors = {};
    if (!userId) errors.userId = "User ID is required";
    if (!idDocument) errors.idDocument = "Front side of ID is required";
    if (!idBack) errors.idBack = "Back side of ID is required";

    if (Object.keys(errors).length) {
      return res
        .status(400)
        .json({ message: "Validation failed", fields: errors });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Save required docs (multer->cloudinary already uploaded)
    user.idDocumentUrl = idDocument.path;
    user.idBackUrl = idBack.path;

    // ✅ Optional: driving license (for drivers)
    if (drivingLicense?.path) {
      user.drivingLicenseUrl = drivingLicense.path;
    }

    // ✅ Optional: live photo (file OR base64)
    if (livePhoto?.path) {
      user.livePhotoUrl = livePhoto.path;
    } else if (livePhotoBase64) {
      try {
        const result = await cloudinary.uploader.upload(livePhotoBase64, {
          folder: "reivio/verifications", // ✅ fixed folder
          public_id: `livePhoto-${userId}-${Date.now()}`,
        });
        user.livePhotoUrl = result.secure_url;
      } catch (err) {
        console.error("❌ Cloudinary base64 upload failed:", err.message);
        return res.status(500).json({ message: "Failed to upload live photo" });
      }
    }
    // ✅ If neither provided, it's OK (because UI says Optional)

    // ✅ Mark step + status
    user.signupStep = 2;
    user.identityVerified = false;

    // (optional) if you have kyc
    user.kyc = user.kyc || {};
    user.kyc.status = "pending";

    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ message: "✅ Identity verification submitted" });
  } catch (err) {
    console.error("❌ verifyIdentityHandler error:", err);
    return res.status(500).json({ message: "Failed to submit verification" });
  }
};

// authController.js

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() }, // 🔐 Check expiry
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  res.json({
    message: "✅ Email verified successfully!",
    userId: user._id,
    role: user.primaryRole,
  });
};
// POST /api/auth/resend-verification
exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified." });
  }

  // Generate new token and expiry
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.verificationToken = hashedToken;
  user.verificationTokenExpires = Date.now() + 60 * 60 * 1000; // ⏰ 1 hour from now
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  await sendEmail({
    to: email,
    subject: "🔁 Resend Verification - BanglaBnB",
    html: `<h2>Hello ${user.name},</h2>
    <p>Please verify your email to activate your account:</p>
    <a href="${verifyUrl}">🌐 Verify via Web</a><br/>
    <a href="banglabnbmobile://verify-email?token=${rawToken}">📱 Open in App</a>`,
  });

  res.json({ message: "✅ New verification email sent." });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // IMPORTANT: select the password hash explicitly
    const user = await User.findOne({ email }).select(
      "+password +roles +primaryRole +kyc.status"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first." });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Add isVerified to response
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        isVerified: user.isVerified,
        referralCode: user.referralCode || "",
        primaryRole: user.primaryRole,
        roles: user.roles,
        kyc: user.kyc || null,
        phoneVerified: user.phoneVerified || false,
        identityVerified: user.identityVerified || false,
        paymentDetails: { verified: user.paymentDetails?.verified || false },
      },
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetToken = hashedToken;
  user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
  // Send `resetUrl` to user via email (use nodemailer/sendgrid/etc)
  // ✅ Send Email
  await sendEmail({
    to: user.email,
    subject: "🔐 Reset your password",
    html: `
    <p>Hello ${user.name},</p>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>This link will expire in 15 minutes.</p>
  `,
  });

  res.json({ message: "✅ Reset link sent to your email." });
};

exports.resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email,
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ message: "✅ Password reset successfully!" });
};

// PATCH /api/auth/add-role
// POST /api/auth/add-role
exports.addRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const allowedRoles = ["user", "host", "driver"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (user.roles.includes(role)) {
    return res.status(400).json({ message: "Role already exists" });
  }

  user.roles.push(role);
  user.primaryRole = role; // optional auto-switch
  await user.save();

  res.json({
    message: `✅ ${role} role added successfully!`,
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    primaryRole: user.primaryRole,
    roles: user.roles,
    kyc: user.kyc, // if needed
  });
};

// PATCH /api/auth/switch-role
exports.switchRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.roles.includes(role)) {
    return res
      .status(403)
      .json({ message: "You don't have access to this role" });
  }

  // ✅ Guard: if switching to driver, require profile
  if (role === "driver") {
    const d = user.driver || {};
    const fields = {};
    if (!d.drivingLicense) fields.drivingLicense = "Required";
    if (!d.vehicleType) fields.vehicleType = "Required";
    if (!d.seatsOffered) fields.seatsOffered = "Required";

    if (Object.keys(fields).length) {
      return res.status(400).json({
        message: "Complete driver profile first",
        fields,
        code: "DRIVER_PROFILE_INCOMPLETE",
      });
    }
  }

  user.primaryRole = role;
  await user.save({ validateBeforeSave: false });

  return res.json({
    message: "Role switched",
    primaryRole: user.primaryRole,
    roles: user.roles,
  });
};

exports.becomeDriver = async (req, res) => {
  const { drivingLicense, vehicleType, seatsOffered } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ Validate fields
  const fields = {};
  if (!drivingLicense) fields.drivingLicense = "Driving license is required";
  if (!vehicleType) fields.vehicleType = "Vehicle type is required";
  if (!seatsOffered) fields.seatsOffered = "Seats offered is required";

  if (Object.keys(fields).length) {
    return res.status(400).json({ message: "Validation failed", fields });
  }

  // ✅ Save driver info
  user.driver = {
    drivingLicense,
    vehicleType,
    seatsOffered: Number(seatsOffered),
  };

  // ✅ Add role if missing
  if (!user.roles.includes("driver")) user.roles.push("driver");

  // ✅ Switch primary role
  user.primaryRole = "driver";

  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    message: "✅ Driver profile saved. You are now a driver.",
    primaryRole: user.primaryRole,
    roles: user.roles,
    driver: user.driver,
  });
};

exports.getUserIdFromToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is required" });

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ verificationToken: hashed });

  if (!user)
    return res.status(404).json({ message: "Invalid or expired token" });

  return res.status(200).json({ userId: user._id });
};
exports.myReferral = async (req, res) => {
  try {
    const referrals = await User.find({
      referredBy: req.user.referralCode,
    }).select("name email createdAt");

    const enriched = await Promise.all(
      referrals.map(async (ref) => {
        const hasBooked = await Booking.exists({
          guestId: ref._id,
          paymentStatus: "paid",
        });
        return {
          ...ref.toObject(),
          hasBooked,
        };
      })
    );

    res.json({ count: enriched.length, referrals: enriched });
  } catch (err) {
    console.error("❌ Referral lookup failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};
