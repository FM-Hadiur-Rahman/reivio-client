const express = require("express");
const router = express.Router();
const upload = require("../middleware/cloudinaryUpload");
const protect = require("../middleware/protect");
const checkSignupStep = require("../middleware/checkSignupStep");
const { sendOTP, verifyOTP } = require("../controllers/otpController");

const {
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  registerStep1,
  verifyIdentityHandler,
  getUserIdFromToken,
  switchRole,
  resendVerificationEmail,
  getMe,
  myReferral,
  addRole,
  becomeDriver,
} = require("../controllers/authController");

router.get("/me", protect, getMe);

router.post("/signup/step1", registerStep1); // ✅ preferred

// Step 2: Upload ID + Live Photo for verification
router.post(
  "/signup/step2",
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "idBack", maxCount: 1 }, // ✅ You must add this
    { name: "livePhoto", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
  ]),
  checkSignupStep,
  verifyIdentityHandler
);

router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
// routes/authRoutes.js
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.patch("/switch-role", protect, switchRole);
router.post("/add-role", protect, addRole);
router.post("/become-driver", protect, becomeDriver);

router.get("/verify-token", getUserIdFromToken);
router.post("/resend-verification", resendVerificationEmail);
router.post("/send-otp", protect, sendOTP);
router.post("/verify-otp", protect, verifyOTP);
router.get("/my-referrals", protect, myReferral);

module.exports = router;
