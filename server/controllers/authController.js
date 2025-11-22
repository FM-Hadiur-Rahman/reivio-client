const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Booking = require("../models/Booking");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
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
    if (!name || !email || !password || !phone || !division || !district) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({
        referralCode: referralCode.toUpperCase(),
      });
      if (referrer) referredBy = referralCode.toUpperCase();
      else console.warn("⚠️ Invalid referral code");
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 👤 Create new user
    const user = await User.create({
      name,
      email,
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
      ...(primaryRole === "driver" && {
        driver: {
          drivingLicense,
          vehicleType,
          seatsOffered,
        },
      }),
      agreedToTerms: req.body.agreedToTerms || false,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your BanglaBnB account",
      html: `<h2>Hi ${name},</h2>
        <p>Thanks for signing up as a ${primaryRole}.</p>
        <p>Please verify your email:</p>
        <a href="${verifyUrl}">🌐 Verify via Web</a><br/>
        <a href="banglabnbmobile://verify-email?token=${rawToken}">📱 Open in App</a>`,
    });

    res.status(201).json({
      message: "✅ Step 1 complete. Check your email to verify your account.",
      userId: user._id,
    });
  } catch (err) {
    console.error("❌ Error in registerStep1:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyIdentityHandler = async (req, res) => {
  const { userId, livePhotoBase64 } = req.body;
  const { idDocument, idBack, livePhoto, drivingLicense } = req.files || {};

  if (!userId || !idDocument || !idBack) {
    return res
      .status(400)
      .json({ message: "Missing required ID document, ID back, or user ID." });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ ID Front & Back via multer (already handled by Cloudinary)
  user.idDocumentUrl = idDocument[0].path; // Front side
  user.idBackUrl = idBack[0].path; // ✅ Back side (NEW)
  // ✅ NEW: Driving license
  if (drivingLicense && drivingLicense[0]) {
    user.drivingLicenseUrl = drivingLicense[0].path;
  }

  // ✅ Live photo via file or base64
  if (livePhoto && livePhoto[0]) {
    user.livePhotoUrl = livePhoto[0].path;
  } else if (livePhotoBase64) {
    try {
      const result = await cloudinary.uploader.upload(livePhotoBase64, {
        folder: "banglabnb/verifications",
        public_id: `livePhoto-${Date.now()}`,
      });
      user.livePhotoUrl = result.secure_url;
    } catch (err) {
      console.error("❌ Cloudinary base64 upload failed:", err.message);
      return res.status(500).json({ message: "Failed to upload selfie image" });
    }
  } else {
    return res.status(400).json({ message: "Live photo is required" });
  }

  user.signupStep = 2;
  user.identityVerified = false;

  await user.save();
  res.status(200).json({ message: "Identity verification submitted" });
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

  user.primaryRole = role;
  await user.save({ validateBeforeSave: false });

  res.json({
    message: "Role switched",
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    primaryRole: user.primaryRole,
    roles: user.roles,
    kyc: user.kyc, // optional
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
