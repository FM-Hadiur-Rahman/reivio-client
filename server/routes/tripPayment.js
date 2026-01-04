const express = require("express");
const router = express.Router();
const axios = require("axios");
const protect = require("../middleware/protect");
const TripReservation = require("../models/TripReservation");
const Trip = require("../models/Trip");
const qs = require("querystring");
const sendEmail = require("../utils/email/sendEmail");
const generateTripInvoice = require("../utils/generateTripInvoice");
const User = require("../models/User");

require("dotenv").config();

// ✅ Trip Payment Initiation
router.post("/trip-initiate", protect, async (req, res) => {
  const { tripId, seats } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const farePerSeat = trip.farePerSeat;
    const subtotal = seats * farePerSeat;
    const serviceFee = Math.round(subtotal * 0.1); // 10%
    const vat = Math.round(serviceFee * 0.15); // 15%
    const totalAmount = subtotal + serviceFee;
    const driverPayout = subtotal - serviceFee;

    const tran_id = `TRIP_${tripId}_${Date.now()}`;

    const reservation = await TripReservation.create({
      tripId,
      userId: req.user._id,
      transactionId: tran_id,
      numberOfSeats: seats,
      farePerSeat,
      subtotal,
      serviceFee,
      vat,
      totalAmount,
      driverPayout,
      status: "pending",
    });

    const data = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASS,
      total_amount: totalAmount,
      currency: "BDT",
      tran_id,
      success_url: `${process.env.API_URL}/api/trip-payment/trip-success`,
      fail_url: `${process.env.CLIENT_URL}/trip-payment-fail`,
      cancel_url: `${process.env.CLIENT_URL}/trip-payment-cancel`,
      ipn_url: `${process.env.API_URL}/api/trip-payment/ipn`, // Optional
      cus_name: req.user.name,
      cus_email: req.user.email,
      cus_add1: req.user.address || "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1200",
      cus_country: "Bangladesh",
      cus_phone: req.user.phone || "01700000000",
      shipping_method: "NO",
      product_name: "BanglaBnB Trip Reservation",
      product_category: "Ride",
      product_profile: "general",
    };

    const response = await axios.post(
      process.env.SSLCOMMERZ_API_URL,
      qs.stringify(data),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!response.data.GatewayPageURL)
      return res.status(400).json({ error: "Payment gateway URL missing" });

    res.json({ url: response.data.GatewayPageURL });
  } catch (err) {
    console.error("Trip payment initiation failed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Trip Payment Success
router.post("/trip-success", async (req, res) => {
  const { tran_id, val_id, amount } = req.body;

  try {
    const reservation = await TripReservation.findOne({
      transactionId: tran_id,
    })
      .populate("tripId")
      .populate("userId");

    if (!reservation || !reservation.tripId || !reservation.userId) {
      return res
        .status(404)
        .json({ message: "Missing reservation, trip, or user" });
    }

    // Calculate values
    const subtotal = reservation.farePerSeat * reservation.numberOfSeats;
    const serviceFee = subtotal * 0.1;
    const vat = serviceFee * 0.15;
    const totalAmount = subtotal + serviceFee;
    const driverPayout = subtotal - serviceFee;

    // Update reservation
    reservation.status = "paid";
    reservation.valId = val_id;
    reservation.paidAt = new Date();
    reservation.subtotal = subtotal;
    reservation.serviceFee = serviceFee;
    reservation.vat = vat;
    reservation.totalAmount = totalAmount;
    reservation.driverPayout = driverPayout;

    await reservation.save();

    // Push to passengers
    await Trip.findByIdAndUpdate(reservation.tripId._id, {
      $push: {
        passengers: {
          user: reservation.userId._id,
          seats: reservation.numberOfSeats,
          status: "reserved",
        },
      },
    });

    // Generate invoice and send to rider
    const user = reservation.userId;
    const trip = reservation.tripId;
    const invoicePath = await generateTripInvoice(reservation, trip, user);

    await sendEmail({
      to: user.email,
      subject: "🧾 Your Trip Reservation Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a202c; padding: 24px;">
          <h2 style="color: #2563eb;">✅ Your Trip is Confirmed!</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your seat(s) for the ride from <strong>${trip.from}</strong> to <strong>${trip.to}</strong> on ${trip.date} at ${trip.time} has been confirmed.</p>
          <p><strong>Seats:</strong> ${reservation.numberOfSeats}</p>
          <p><strong>Subtotal:</strong> ৳${reservation.subtotal}</p>
          <p><strong>Service Fee (10%):</strong> ৳${reservation.serviceFee}</p>
          <p><strong>VAT (15%):</strong> ৳${reservation.vat}</p>
          <p><strong>Total Paid:</strong> <strong>৳${reservation.totalAmount}</strong></p>
          <p>Attached is your booking invoice. Thank you for using BanglaBnB!</p>
        </div>
      `,
      attachments: [
        {
          filename: `trip-invoice-${reservation._id}.pdf`,
          path: invoicePath,
          contentType: "application/pdf",
        },
      ],
    });

    // Send to driver
    const driver = await User.findById(trip.driverId);
    if (driver?.email) {
      await sendEmail({
        to: driver.email,
        subject: "📢 A New Passenger Has Reserved Your Trip",
        html: `
        <div style="font-family: Arial, sans-serif; color: #1a202c; padding: 24px;">
          <h2 style="color: #16a34a;">🚘 New Trip Reservation</h2>
          <p>Dear <strong>${driver.name}</strong>,</p>
          <p><strong>${user.name}</strong> has reserved <strong>${reservation.numberOfSeats}</strong> seat(s) for your trip.</p>
         <p>Trip Date: <strong>${trip.date}</strong> at <strong>${trip.time}</strong></p>
          <p><strong>Total Fare Paid by Passenger:</strong> ৳${reservation.totalAmount}</p>
          <p><strong>Platform Service Fee (10%):</strong> ৳${reservation.serviceFee}</p>
          <p><strong>Your Earnings:</strong> ৳${reservation.driverPayout}</p>
          <p><strong>Seats Reserved:</strong> ${reservation.numberOfSeats}</p>
          <p style="font-size: 14px; color: #4a5568;">ইনভয়েস সংযুক্ত রয়েছে।</p>

        </div>
      `,
        attachments: [
          {
            filename: `trip-invoice-${reservation._id}.pdf`,
            path: invoicePath,
            contentType: "application/pdf",
          },
        ],
      });
    }

    // ✅ Redirect
    res.redirect(
      `${process.env.CLIENT_URL}/trip-payment-success?tran_id=${tran_id}`
    );
  } catch (err) {
    console.error("Trip payment success error:", err.message);
    res.status(500).send("Server error");
  }
});

// ✅ Get Trip Reservation by Transaction ID (Protected)
router.get("/reservation/:tran_id", async (req, res) => {
  try {
    const reservation = await TripReservation.findOne({
      transactionId: req.params.tran_id,

      status: "paid", // ✅ Only return if reservation is paid
    })
      .populate("tripId")
      .populate("userId", "name email");

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json(reservation);
  } catch (err) {
    console.error("❌ Failed to fetch reservation:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/my-paid-reservations", protect, async (req, res) => {
  try {
    const reservations = await TripReservation.find({
      userId: req.user._id,
      status: "paid",
    }).populate("tripId");

    res.json(reservations);
  } catch (err) {
    console.error("❌ Failed to fetch paid reservations", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
