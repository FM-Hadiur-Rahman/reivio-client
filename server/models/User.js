const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Accept either +8801XXXXXXXXX or 01XXXXXXXXX
          return /^(?:\+8801|01)[3-9][0-9]{8}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid Bangladeshi phone number!`,
      },
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: String,
    otpExpires: Date,
    idDocumentUrl: String,
    idBackUrl: String,
    livePhotoUrl: String,
    identityVerified: { type: Boolean, default: false },
    signupStep: { type: Number, default: 1 },

    primaryRole: {
      type: String,
      enum: ["user", "host", "driver", "admin"],
      default: "user",
    },
    roles: {
      type: [String],
      enum: ["user", "host", "driver", "admin"],
      default: ["user"],
    },

    location: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere", // enables geospatial queries
      },
      address: { type: String },
      division: {
        type: String,
        enum: Object.keys(require("../data/districts").divisions), // optional: validate only known divisions
      },
      district: {
        type: String,
        validate: {
          validator: function (value) {
            const { divisions } = require("../data/districts");
            return Object.values(divisions).flat().includes(value);
          },
          message: (props) => `${props.value} is not a valid district.`,
        },
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: {
      type: Date,
    },
    driver: {
      licenseNumber: { type: String },
      vehicleType: { type: String, enum: ["car", "bike"] },
      vehicleModel: { type: String },
      seats: { type: Number }, // default available seats
      approved: { type: Boolean, default: false }, // for KYC
    },

    avatar: { type: String, default: "" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    kyc: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      nidUrl: String,
      selfieUrl: String,
      drivingLicenseUrl: { type: String },

      reason: {
        type: String,
        default: "",
      },
      timestamp: Date,
    },
    agreedToTerms: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
      unique: true,
      uppercase: true,
      default: function () {
        const prefix = this.name ? this.name.slice(0, 3).toUpperCase() : "USR";
        return prefix + crypto.randomBytes(3).toString("hex").toUpperCase();
      },
    },

    referredBy: {
      type: String, // stores the referralCode used
    },
    referralRewards: {
      type: Number,
      default: 0, // e.g., number of successful referrals
    },
    referralRewarded: {
      type: Boolean,
      default: false,
    },
    // models/User.js  (replace only the paymentDetails block)

    paymentDetails: {
      accountType: { type: String, enum: ["bkash", "nagad", "bank", "rocket"] },
      accountNumber: String,
      accountName: String,
      bankName: String, // Only for bank
      routingNumber: String, // Only for bank

      // 🔁 NEW: status replaces 'verified'
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      // optional review meta
      reviewReason: String,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,

      addedAt: { type: Date, default: Date.now },
    },

    premium: {
      isActive: { type: Boolean, default: false },
      expiresAt: Date,
      upgradedAt: Date,
      paymentInfo: {
        transactionId: String,
        amount: Number,
      },
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true, // ✅ This line automatically adds createdAt & updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// models/User.js (under schema definition)
userSchema.pre("save", function (next) {
  if (
    this.isModified("paymentDetails.accountType") ||
    this.isModified("paymentDetails.accountNumber") ||
    this.isModified("paymentDetails.accountName") ||
    this.isModified("paymentDetails.bankName") ||
    this.isModified("paymentDetails.routingNumber")
  ) {
    this.paymentDetails.status = "pending";
    this.paymentDetails.reviewReason = undefined;
    this.paymentDetails.reviewedBy = undefined;
    this.paymentDetails.reviewedAt = undefined;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
