const dayjs = require("dayjs");

const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const User = require("../models/User");
const Listing = require("../models/Listing");
const generateInvoice = require("../utils/generateInvoice");
const sendEmail = require("../utils/email/sendEmail");
const qs = require("qs");
const axios = require("axios");
const Payout = require("../models/Payout");
const DriverPayout = require("../models/DriverPayout");
require("dotenv").config();

exports.initiateCombinedPayment = async (req, res) => {
  const { bookingId, amount, customer } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const transactionId = `COMBINED_${bookingId}_${Date.now()}`;
    booking.transactionId = transactionId;
    await booking.save();

    const data = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASS,
      total_amount: amount,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.API_URL}/api/combined-payment/success`,
      fail_url: `${process.env.CLIENT_URL}/payment-fail`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      ipn_url: `${process.env.API_URL}/api/combined-payment/ipn`,
      cus_name: customer?.name || "Guest",
      cus_email: customer?.email || "guest@example.com",
      cus_add1: customer?.address || "Bangladesh",
      cus_city: "Dhaka",
      cus_postcode: "1200",
      cus_country: "Bangladesh",
      cus_phone: customer?.phone || "01700000000",
      shipping_method: "NO",
      product_name: "BanglaBnB Stay + Ride",
      product_category: "Combined",
      product_profile: "general",
    };

    const response = await axios.post(
      process.env.SSLCOMMERZ_API_URL,
      qs.stringify(data),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!response.data.GatewayPageURL) {
      return res.status(400).json({
        message: "SSLCommerz initiation failed",
        data: response.data,
      });
    }

    return res.json({ gatewayUrl: response.data.GatewayPageURL });
  } catch (err) {
    console.error("❌ SSLCommerz initiation error:", err.message);
    return res
      .status(500)
      .json({ message: "Payment initiation failed", error: err.message });
  }
};

exports.combinedPaymentSuccess = async (req, res) => {
  const { tran_id, val_id, amount } = req.body;

  try {
    const booking = await Booking.findOne({ transactionId: tran_id });
    if (!booking) return res.status(404).send("Booking not found");

    // Step 1: Update booking payment
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.valId = val_id;
    booking.paidAmount = amount;
    booking.paidAt = new Date();
    await booking.save();

    // Step 2: Get related models
    const guest = await User.findById(booking.guestId);
    const listing = await Listing.findById(booking.listingId);
    const trip = booking.tripId ? await Trip.findById(booking.tripId) : null;

    // Step 3: Generate Invoice
    const invoicePath = await generateInvoice(
      booking,
      listing,
      guest,
      null,
      trip
    );

    // Step 4: Send Email to Guest
    await sendEmail({
      to: guest.email,
      subject: "🧾 Your Combined BanglaBnB Invoice",
      html: `
        <p>Dear ${guest.name},</p>
        <p>Your combined booking (Stay + Ride) is confirmed. Thank you for using BanglaBnB!</p>
        <p>📎 Invoice is attached to this email.</p>
      `,
      attachments: [
        {
          filename: `invoice-${booking._id}.pdf`,
          path: invoicePath,
        },
      ],
    });

    // Step 5: Create Host Payout (for Stay)
    if (listing?.hostId) {
      const nights = dayjs(booking.dateTo).diff(dayjs(booking.dateFrom), "day");
      const staySubtotal = listing.price * nights;
      const guestFee = (staySubtotal * 10) / 115;
      const hostFee = ((staySubtotal - guestFee) * 5) / 100;
      const platformRevenue = guestFee + hostFee;
      const vat = platformRevenue * 0.15;
      const hostPayout = staySubtotal - hostFee;

      await Payout.create({
        bookingId: booking._id,
        hostId: listing.hostId,
        amount: hostPayout,
        guestFee,
        hostFee,
        vat,
        method: "manual",
        status: "pending",
      });

      const host = await User.findById(listing.hostId);
      if (host?.email) {
        await sendEmail({
          to: host.email,
          subject: "📢 You Have a New Paid Booking!",
          html: `
            <p>Hi ${host.name},</p>
            <p>${guest.name} just booked your stay from ${dayjs(
            booking.dateFrom
          ).format("DD MMM")} to ${dayjs(booking.dateTo).format(
            "DD MMM YYYY"
          )}.</p>
            <p>📎 Invoice is attached. Please prepare your listing.</p>
          `,
          attachments: [
            {
              filename: `invoice-${booking._id}.pdf`,
              path: invoicePath,
            },
          ],
        });
      }
    }

    // Step 6: Create Driver Payout (for Ride)
    if (trip?.driverId) {
      const seats = booking.seats || 1; // fallback to 1
      const subtotal = trip.farePerSeat * seats;

      const serviceFee = Math.round(subtotal * 0.1); // 10% platform fee
      const vat = Math.round(serviceFee * 0.15); // 15% VAT on fee
      const driverPayout = subtotal - serviceFee; // Driver gets subtotal minus fee

      // ✅ Ensure values are numbers
      if (
        isNaN(subtotal) ||
        isNaN(serviceFee) ||
        isNaN(vat) ||
        isNaN(driverPayout)
      ) {
        console.error("❌ Invalid payout calculation", {
          seats,
          subtotal,
          serviceFee,
          vat,
          driverPayout,
        });
      } else {
        await DriverPayout.create({
          tripId: trip._id,
          driverId: trip.driverId,
          amount: driverPayout,
          serviceFee,
          vat,
          method: "manual", // Or sslcommerz if auto payout
          status: "pending",
        });
      }

      const driver = await User.findById(trip.driverId);
      if (driver?.email) {
        await sendEmail({
          to: driver.email,
          subject: "🛺 A New Passenger Has Booked Your Trip",
          html: `
            <p>Hi ${driver.name},</p>
            <p>${guest.name} has reserved seat(s) for your trip from <strong>${trip.from}</strong> to <strong>${trip.to}</strong> on ${trip.date} at ${trip.time}.</p>
            <p>📎 Booking invoice is attached for your record.</p>
          `,
          attachments: [
            {
              filename: `invoice-${booking._id}.pdf`,
              path: invoicePath,
            },
          ],
        });
      }
    }

    // Step 7: Redirect
    res.redirect(
      `${process.env.CLIENT_URL}/payment-success?tran_id=${tran_id}`
    );
  } catch (err) {
    console.error("❌ Combined Payment success error:", err);
    res.status(500).send("Server error");
  }
};
