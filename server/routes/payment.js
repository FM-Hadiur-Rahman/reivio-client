require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");
const sendEmail = require("../utils/email/sendEmail");
const IPNLog = require("../models/IPNLog");
const qs = require("querystring");
const generateInvoice = require("../utils/generateInvoice");
const Notification = require("../models/Notification");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Payout = require("../models/Payout");
const protect = require("../middleware/protect");

router.post("/initiate", async (req, res) => {
  const { amount, bookingId, customer } = req.body;

  const tran_id = `BNB_${bookingId}_${Date.now()}`;

  await Booking.findByIdAndUpdate(bookingId, {
    transactionId: tran_id,
    paymentStatus: "unpaid",
  });

  const data = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASS,
    total_amount: amount,
    currency: "BDT",
    tran_id,
    success_url: "https://banglabnb-api.onrender.com/api/payment/success",
    fail_url: "https://banglabnb.com/payment-fail",
    cancel_url: "https://banglabnb.com/payment-cancel",
    ipn_url: "https://banglabnb-api.onrender.com/api/payment/ipn",
    cus_name: customer.name,
    cus_email: customer.email,
    cus_add1: customer.address || "Dhaka",
    cus_city: "Dhaka",
    cus_postcode: "1200",
    cus_country: "Bangladesh",
    cus_phone: customer.phone || "01763558585",
    shipping_method: "NO",
    product_name: "BanglaBnB Booking",
    product_category: "Reservation",
    product_profile: "general",
  };

  try {
    const response = await axios.post(
      process.env.SSLCOMMERZ_API_URL,
      qs.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.data.GatewayPageURL) {
      return res.status(400).json({ error: "Payment gateway URL missing" });
    }

    res.json({ url: response.data.GatewayPageURL });
  } catch (err) {
    console.error("SSLCOMMERZ initiation error:", err.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

router.post("/success", async (req, res) => {
  const { tran_id, val_id, amount } = req.body;

  try {
    const booking = await Booking.findOne({ transactionId: tran_id })
      .populate("guestId")
      .populate({
        path: "listingId",
        populate: { path: "hostId" }, // ✅ populate the host data
      });

    if (!booking) return res.status(404).send("Booking not found");

    booking.paymentStatus = "paid";
    booking.valId = val_id;
    booking.paidAmount = amount;
    booking.paidAt = new Date();
    booking.status = "confirmed";
    await booking.save();

    const guest = booking.guestId;
    const listing = booking.listingId;
    // 🎁 Referral reward (after first paid booking)
    try {
      const bookingsByGuest = await Booking.countDocuments({
        guestId: guest._id,
        paymentStatus: "paid",
      });

      if (guest.referredBy && !guest.referralRewarded) {
        const referrer = await User.findOne({ referralCode: guest.referredBy });
        if (referrer) {
          referrer.referralRewards += 1;
          await referrer.save();

          guest.referralRewarded = true; // ✅ prevent double rewarding
          await guest.save();

          await PromoCode.create({
            code: `REF${Date.now()}`,
            discount: 150,
            type: "flat",
            for: "stay",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            usageLimit: 1,
          });

          await sendEmail({
            to: referrer.email,
            subject: "🎉 Referral Bonus Earned!",
            html: `<p>Someone used your referral code and completed their first booking. You've earned a reward!</p>`,
          });
        }
      }
    } catch (e) {
      console.warn("Referral logic failed:", e.message);
    }

    const from = new Date(booking.dateFrom).toLocaleDateString();
    const to = new Date(booking.dateTo).toLocaleDateString();

    const invoicePath = await generateInvoice(booking, listing, guest);

    try {
      await sendEmail({
        to: guest.email,
        subject: "📄 Your BanglaBnB Invoice is Ready!",
        html: `
        <div style="font-family: Arial, sans-serif; color: #1a202c; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
          <h2 style="color: #10b981; text-align: center;">🧾 BanglaBnB Booking Invoice</h2>
          <p>Dear <strong>${guest.name}</strong>,</p>
          <p>Thank you for your booking with <strong>BanglaBnB</strong>! Your payment has been successfully processed.</p>
          <hr style="margin: 20px 0;" />
          <h3>🛏️ Listing Details</h3>
          <p><strong>${listing.title}</strong></p>
          <p>📍 ${listing.location?.address}</p>
          <p>📅 <strong>${from} → ${to}</strong></p>
          <h3>💵 Payment Summary</h3>
          <p>Total Paid: <strong>৳${booking.paidAmount}</strong></p>
          <p>Status: ✅ Paid</p>
          <p style="font-size: 14px; color: #4a5568;">আপনার বুকিং ইনভয়েস তৈরি হয়েছে। এটি মেইলে সংযুক্ত রয়েছে।</p>
        </div>
      `,
        attachments: [
          {
            filename: `invoice-${booking._id}.pdf`,
            path: invoicePath,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (e) {
      console.warn("Guest email failed:", e.message);
    }
    // 📧 Host email with same attachment
    if (listing.hostId?.email) {
      try {
        await sendEmail({
          to: listing.hostId.email,
          subject: "📢 New Paid Booking on Your Listing!",
          html: `
        <div style="font-family: Arial, sans-serif; color: #1a202c; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">📢 New Booking Received!</h2>
          <p>Dear <strong>${listing.hostId.name}</strong>,</p>
          <p>🎉 A guest has paid and confirmed a booking on your listing <strong>${
            listing.title
          }</strong>.</p>
          <p>📍 ${listing.location?.address}</p>
          <p>📅 ${from} → ${to}</p>
          <p>👤 ${guest.name} (${guest.email})</p>
          <p>💵 ৳${booking.paidAmount} — Paid</p>
          <p>💰 Guest Paid: ৳${booking.paidAmount}</p>
          <p>📉 Platform Fee (5%): ৳${Math.round(hostFee)}</p>
          <p>✅ Payout to You: ৳${Math.round(hostPayout)}</p>
          <p style="font-size: 14px; color: #4a5568;">ইনভয়েস মেইলের সাথে সংযুক্ত রয়েছে।</p>

        </div>
      `,
          attachments: [
            {
              filename: `invoice-${booking._id}.pdf`,
              path: invoicePath,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (e) {
        console.warn("Host email failed:", e.message);
      }
    }

    try {
      await Notification.create({
        userId: guest._id,
        message: `Payment received for booking at ${listing.title}`,
        type: "payment",
      });
    } catch (e) {
      console.warn("Notification failed:", e.message);
    }

    fs.unlink(invoicePath, (err) => {
      if (err) console.warn("Could not delete invoice:", err.message);
    });

    try {
      const token = jwt.sign({ id: guest._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      if (process.env.API_URL) {
        await axios.post(
          `${process.env.API_URL}/api/chats`,
          {
            bookingId: booking._id,
            listingId: listing._id,
            hostId: listing.hostId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        console.warn("API_URL not set, skipping chat creation.");
      }
    } catch (e) {
      console.warn("Chat creation failed:", e.message);
    }

    try {
      const gross = booking.paidAmount; // e.g., 2300
      const guestFee = (gross * 10) / 115; // = 200
      const hostFee = (gross - guestFee) * 0.05; // = 105
      const totalRevenue = guestFee + hostFee; // = 305
      const tax = totalRevenue * 0.15; // = 45.75 (your responsibility)

      const hostPayout = gross - hostFee; // ✅ = 2195

      await Payout.create({
        bookingId: booking._id,
        hostId: listing.hostId._id,
        amount: hostPayout,
        hostFee: Math.round(hostFee),
        guestFee: Math.round(guestFee),
        vat: Math.round(tax),
        method: "manual",
        status: "pending",
        notes: `Auto-created after payment of ৳${gross}`,
      });
    } catch (e) {
      console.warn("Payout creation failed:", e.message);
    }

    res.redirect(
      `https://banglabnb.com/payment-success?status=paid&tran_id=${tran_id}`
    );
  } catch (err) {
    console.error("Payment success error:", err.message);
    res.status(500).send("Server error");
  }
});

router.post("/fail", (req, res) => {
  res.redirect("https://banglabnb.com/payment-fail");
});

router.post("/cancel", (req, res) => {
  res.redirect("https://banglabnb.com/payment-cancel");
});

router.post("/ipn", async (req, res) => {
  await IPNLog.create({ payload: req.body });
  const { tran_id, status } = req.body;

  if (status === "VALID") {
    await Booking.findOneAndUpdate(
      { transactionId: tran_id },
      {
        paymentStatus: "paid",
        status: "confirmed",
      }
    );
  }

  res.status(200).send("IPN received");
});

// POST /api/payment/extra
router.post("/extra", async (req, res) => {
  const { bookingId, amount } = req.body;
  const booking = await Booking.findById(bookingId).populate("guestId");

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const extraTranId = `EXTRA_${bookingId}_${Date.now()}`;

  booking.extraPayment = {
    amount,
    status: "pending",
    transactionId: extraTranId,
  };

  await booking.save();

  const customer = booking.guestId;

  const data = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASS,
    total_amount: amount,
    currency: "BDT",
    tran_id: extraTranId,
    success_url: "https://banglabnb-api.onrender.com/api/payment/extra-success",
    fail_url: "https://banglabnb.com/payment-fail",
    cancel_url: "https://banglabnb.com/payment-cancel",
    cus_name: customer.name,
    cus_email: customer.email,
    cus_add1: customer.address || "Dhaka",
    cus_city: "Dhaka",
    cus_postcode: "1200",
    cus_country: "Bangladesh",
    cus_phone: customer.phone || "01700000000",
    shipping_method: "NO",
    product_name: "Extra Booking Payment",
    product_category: "Reservation",
    product_profile: "general",
  };

  try {
    const response = await axios.post(
      process.env.SSLCOMMERZ_API_URL,
      qs.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.data.GatewayPageURL) {
      return res.status(400).json({ error: "Payment URL generation failed" });
    }

    res.json({ url: response.data.GatewayPageURL });
  } catch (err) {
    console.error("SSLCOMMERZ extra payment error:", err.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});
router.post("/extra-success", async (req, res) => {
  const { tran_id, amount } = req.body;

  const booking = await Booking.findOne({
    "extraPayment.transactionId": tran_id,
  }).populate("guestId");

  if (!booking) return res.status(404).send("Booking not found");

  booking.extraPayment.status = "paid";
  booking.paidAmount += Number(amount);
  booking.paymentStatus = "paid"; // booking is now fully paid
  await booking.save();

  // 🔔 Send notification or email if needed
  try {
    await sendEmail({
      to: booking.guestId.email,
      subject: "✅ Extra Payment Received",
      html: `<p>Thank you for paying ৳${amount}. Your updated booking is now fully confirmed.</p>`,
    });
  } catch (e) {
    console.warn("Extra payment email failed:", e.message);
  }

  return res.redirect(
    `https://banglabnb.com/payment-success?tran_id=${tran_id}&status=extra-paid`
  );
});
router.post("/claim-refund", protect, async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);

  if (!booking || booking.guestId.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (
    booking.extraPayment?.status !== "refund_pending" ||
    booking.extraPayment?.refundClaimed
  ) {
    return res
      .status(400)
      .json({ message: "Refund not applicable or already claimed" });
  }

  // ✅ Mark refund as claimed
  booking.extraPayment.status = "refund_requested";
  booking.extraPayment.refundClaimed = true;
  await booking.save();

  // 📧 Notify admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "⚠️ Refund Request from Guest",
    html: `
      <p>Guest <strong>${
        req.user.name
      }</strong> has claimed a refund for booking ID: ${bookingId}</p>
      <p>Amount: ৳${Math.abs(booking.extraPayment.amount)}</p>
      <p>Please review and process the refund manually.</p>
    `,
  });

  res.json({ message: "Refund claim submitted" });
});
router.post("/premium", protect, async (req, res) => {
  const user = req.user;

  const tran_id = `PREMIUM_${user._id}_${Date.now()}`;

  const data = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASS,
    total_amount: 499,
    currency: "BDT",
    tran_id,
    success_url: `${process.env.API_URL}/api/payment/premium-success`,
    fail_url: "https://banglabnb.com/payment-fail",
    cancel_url: "https://banglabnb.com/payment-cancel",
    cus_name: user.name,
    cus_email: user.email,
    cus_add1: user.address || "Bangladesh",
    cus_city: "Dhaka",
    cus_postcode: "1200",
    cus_country: "Bangladesh",
    cus_phone: user.phone || "01700000000",
    shipping_method: "NO",
    product_name: "Premium Host Upgrade",
    product_category: "Membership",
    product_profile: "general",
  };

  try {
    const response = await axios.post(
      process.env.SSLCOMMERZ_API_URL,
      qs.stringify(data),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!response.data.GatewayPageURL) {
      return res.status(400).json({ error: "Payment URL generation failed" });
    }

    res.json({ url: response.data.GatewayPageURL });
  } catch (err) {
    console.error("SSLCOMMERZ premium payment error:", err.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});
router.post("/premium-success", async (req, res) => {
  const { tran_id, val_id, amount } = req.body;

  if (!tran_id?.startsWith("PREMIUM_")) {
    return res.status(400).json({ message: "Invalid premium transaction" });
  }

  const userId = tran_id.split("_")[1];

  try {
    await User.findByIdAndUpdate(userId, {
      premium: {
        isActive: true,
        upgradedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        paymentInfo: {
          transactionId: tran_id,
          amount: Number(amount),
        },
      },
    });

    const user = await User.findById(userId);

    await sendEmail({
      to: user.email,
      subject: "🎉 You're Now a Premium Host!",
      html: `<p>Thank you for upgrading to Premium! Your premium listing boost is now active until <strong>${user.premium.expiresAt.toDateString()}</strong>.</p>`,
    });

    return res.redirect("https://banglabnb.com/host/dashboard?status=premium");
  } catch (err) {
    console.error("Premium activation error:", err.message);
    return res.status(500).send("Premium activation failed");
  }
});

module.exports = router;
