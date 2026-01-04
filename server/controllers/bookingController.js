// 📁 server/controllers/bookingController.js
const sendEmail = require("../utils/email/sendEmail");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ✅ Create a new booking (guest)

exports.createBooking = async (req, res) => {
  const { listingId, dateFrom, dateTo, guests = 1 } = req.body;

  try {
    const today = new Date();
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (from < today || to <= from) {
      return res
        .status(400)
        .json({ message: "Invalid booking dates. Cannot book in the past." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (guests > listing.maxGuests) {
      return res
        .status(400)
        .json({ message: "Too many guests for this listing." });
    }

    const isBlocked = listing.blockedDates?.some(
      (range) => new Date(range.from) <= to && new Date(range.to) >= from
    );

    if (isBlocked) {
      return res.status(409).json({
        message: "Listing is temporarily unavailable for those dates.",
      });
    }

    const overlapping = await Booking.findOne({
      listingId,
      status: { $ne: "cancelled" },
      $or: [{ dateFrom: { $lte: to }, dateTo: { $gte: from } }],
    });

    if (overlapping) {
      return res
        .status(409)
        .json({ message: "This listing is already booked for those dates." });
    }

    const nights =
      (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
      (1000 * 60 * 60 * 24);

    const newBooking = await Booking.create({
      guestId: req.user._id,
      listingId,
      dateFrom,
      dateTo,
      guests,
      nights,
      pricePerNight: listing.price,
    });

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("❌ Booking failed:", err);
    res
      .status(500)
      .json({ message: "Failed to create booking", error: err.message });
  }
};

// ✅ Get all bookings made by the current user (guest)
exports.getBookingsByGuest = async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.user._id })
      .populate("listingId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: err.message });
  }
};

// ✅ Get all bookings for listings owned by the current host
exports.getBookingsByHost = async (req, res) => {
  try {
    const hostListings = await Listing.find({ hostId: req.user._id });
    const listingIds = hostListings.map((l) => l._id);
    const bookings = await Booking.find({ listingId: { $in: listingIds } })
      .populate("guestId")
      .populate("listingId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch host bookings", error: err.message });
  }
};

exports.getBookingsForListing = async (req, res) => {
  try {
    const bookings = await Booking.find({
      listingId: req.params.listingId,
      status: { $ne: "cancelled" },
    }).select("dateFrom dateTo");

    res.json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: err.message });
  }
};

// ✅ Accept a booking
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params._id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only host can accept
    const listing = await Listing.findById(booking.listingId);
    if (listing.hostId.toString() !== req.user._id)
      return res.status(403).json({ message: "Not authorized" });

    booking.status = "confirmed";
    await booking.save();
    // Fetch guest to get email
    const guest = await User.findById(booking.guestId);

    await sendEmail({
      to: guest.email,
      subject: "🎉 Your booking has been accepted!",
      html: `
    <h3>Hi ${guest.name},</h3>
    <p>Your booking for <strong>${listing.title}</strong> has been <span style="color:green;"><b>accepted</b></span> by the host.</p>
    <p>We look forward to hosting you!</p>
    <p>BanglaBnB Team</p>
  `,
    });

    res.json({ message: "Booking accepted" });
  } catch (err) {
    console.error("❌ Accept failed:", err);
    res.status(500).json({ message: "Failed to accept booking" });
  }
};

// ✅ Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params._id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Find the listing to check host ownership
    const listing = await Listing.findById(booking.listingId);
    const isHost = listing.hostId.toString() === req.user._id;
    const isGuest = booking.guestId.toString() === req.user._id;

    if (!isHost && !isGuest) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    const guest = await User.findById(booking.guestId);
    const host = await User.findById(listing.hostId);

    const recipient = isHost ? guest.email : host.email;
    const cancelerName = isHost ? host.name : guest.name;

    await sendEmail({
      to: recipient,
      subject: "❌ Booking Cancelled",
      html: `
    <h3>Hello,</h3>
    <p>The booking for <strong>${listing.title}</strong> has been <span style="color:red;"><b>cancelled</b></span> by ${cancelerName}.</p>
    <p>If this was a mistake, please reach out to the other party directly.</p>
    <p>BanglaBnB Team</p>
  `,
    });

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("❌ Cancel failed:", err);
    res
      .status(500)
      .json({ message: "Failed to cancel booking", error: err.message });
  }
};

exports.checkIn = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("guestId", "name email")
    .populate("listingId");

  if (!booking || booking.guestId._id.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Unauthorized" });

  const now = new Date();
  if (now < new Date(booking.dateFrom))
    return res.status(400).json({ message: "Too early to check in" });

  booking.checkInAt = now;
  booking.checkedInAt = new Date();

  await booking.save();

  const host = await User.findById(booking.listingId.hostId).select(
    "name email"
  );

  // ✅ Send emails with try/catch to avoid crash
  try {
    await sendEmail({
      to: booking.guestId.email,
      subject: "✅ You’ve successfully checked in!",
      html: `<p>Hi ${booking.guestId.name},</p>
             <p>You checked into <strong>${booking.listingId.title}</strong>. Enjoy your stay!</p>`,
    });
  } catch (err) {
    console.error("❌ Failed to send guest email:", err.message);
  }

  try {
    await sendEmail({
      to: host.email,
      subject: "🏠 Guest has checked in",
      html: `<p>Hi ${host.name},</p>
             <p>Your guest <strong>${booking.guestId.name}</strong> has checked into <strong>${booking.listingId.title}</strong>.</p>`,
    });
  } catch (err) {
    console.error("❌ Failed to send host email:", err.message);
  }

  res.json({ message: "Checked in", booking });
};

exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("guestId", "email name")
      .populate("listingId", "title hostId price");

    if (
      !booking ||
      booking.guestId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const now = new Date();
    if (now < new Date(booking.dateTo)) {
      return res.status(400).json({ message: "Too early to check out" });
    }

    booking.checkOutAt = now;
    await booking.save();

    // ✅ Safe email logic
    const guestReviewLink = `${process.env.CLIENT_URL}/dashboard/reviews?booking=${booking._id}`;
    await sendEmail({
      to: booking.guestId.email,
      subject: "📝 Leave a Review for Your Stay",
      html: `
        <div style="font-family:sans-serif;">
          <h2>Thanks for staying at ${booking.listingId.title}!</h2>
          <p>Your checkout is now complete. We'd love to hear your feedback.</p>
          <a href="${guestReviewLink}" style="padding:10px 16px; background:#22c55e; color:white; border-radius:6px; text-decoration:none;">Leave a Review</a>
          <p style="font-size:12px; color:gray; margin-top:10px;">Please leave your review within 7 days.</p>
        </div>
      `,
    });

    const host = await User.findById(booking.listingId.hostId).select(
      "email name"
    );
    const earnings = booking.listingId.price;
    const platformFee = earnings * 0.1;
    const payout = earnings - platformFee;

    await sendEmail({
      to: host.email,
      subject: `💰 Booking Completed: Guest Checked Out`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>Your guest has checked out from <strong>${
            booking.listingId.title
          }</strong></h2>
          <p><strong>Guest:</strong> ${booking.guestId.name}</p>
          <p><strong>Total Nights:</strong> ${
            (new Date(booking.dateTo) - new Date(booking.dateFrom)) /
            (1000 * 3600 * 24)
          }</p>
          <p><strong>Total Earned:</strong> ৳${earnings.toFixed(2)}</p>
          <p><strong>Platform Fee:</strong> ৳${platformFee.toFixed(2)}</p>
          <p><strong>Payout to You:</strong> ৳${payout.toFixed(2)}</p>
          <p>We’ll process your payout shortly.</p>
        </div>
      `,
    });

    // ✅ Always send a response
    return res.status(200).json({ message: "Checked out", booking });
  } catch (error) {
    console.error("❌ Checkout failed:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.requestModification = async (req, res) => {
  try {
    const { from, to } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate("listingId")
      .populate("guestId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.status !== "confirmed" ||
      !["paid", "partial"].includes(booking.paymentStatus) ||
      booking.checkInAt
    ) {
      return res.status(400).json({
        message:
          "Only paid, confirmed, and unchecked-in bookings can be modified",
      });
    }

    if (!from || !to || new Date(from) >= new Date(to)) {
      return res
        .status(400)
        .json({ message: "Invalid modification date range" });
    }

    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      listingId: booking.listingId._id,
      status: { $ne: "cancelled" },
      $or: [
        { dateFrom: { $lte: new Date(to) }, dateTo: { $gte: new Date(from) } },
      ],
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: "New dates overlap with another booking" });
    }

    booking.modificationRequest = {
      status: "requested",
      requestedDates: { from, to },
      requestedBy: req.user._id,
    };

    await booking.save();

    const guest = booking.guestId;
    const host = await User.findById(booking.listingId.hostId);

    await Notification.create({
      userId: host._id,
      type: "modification-request",
      message: `📅 ${guest.name} requested to change booking dates.`,
      link: `/host/listings/${booking.listingId._id}/bookings`,
      bookingId: booking._id,
    });

    if (host?.email) {
      await sendEmail({
        to: host.email,
        subject: `📅 Modification Request for Booking ${booking._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1a202c; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
            <h2 style="color: #2563eb;">Booking Modification Requested</h2>
            <p>Hello <strong>${host.name}</strong>,</p>
            <p>Your guest <strong>${
              guest.name
            }</strong> has requested to change the booking dates for your listing: <strong>${
          booking.listingId.title
        }</strong>.</p>
            <p><strong>Current Dates:</strong> ${booking.dateFrom.toDateString()} to ${booking.dateTo.toDateString()}</p>
            <p><strong>Requested Dates:</strong> ${new Date(
              from
            ).toDateString()} to ${new Date(to).toDateString()}</p>
            <p>Please <a href="https://banglabnb.com/dashboard/requests" style="color:#2563eb;">log in</a> to approve or reject this request.</p>
          </div>
        `,
      });
    }

    res.json({ message: "Modification request sent", booking });
  } catch (err) {
    console.error("❌ Server error in requestModification:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.respondModification = async (req, res) => {
  const { action } = req.body; // accepted or rejected
  const booking = await Booking.findById(req.params.id)
    .populate("guestId", "email name")
    .populate("listingId", "title price");

  if (!booking || !["accepted", "rejected"].includes(action)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (action === "accepted") {
    const { from, to } = booking.modificationRequest.requestedDates;

    // 🔐 Conflict check again
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      listingId: booking.listingId,
      status: { $ne: "cancelled" },
      $or: [
        { dateFrom: { $lte: new Date(to) }, dateTo: { $gte: new Date(from) } },
      ],
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: "New dates overlap with another booking" });
    }

    // ✅ Apply changes
    booking.dateFrom = from;
    booking.dateTo = to;

    // 🔢 Calculate new total
    const nights = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
    const newTotal = nights * booking.listingId.price;

    // 💰 Compare paid vs total
    if (booking.paidAmount < newTotal) {
      const extraAmount = newTotal - booking.paidAmount;
      booking.paymentStatus = "partial";
      booking.extraPayment = {
        required: true,
        amount: extraAmount,
        status: "pending",
      };
    } else if (booking.paidAmount > newTotal) {
      const refundAmount = booking.paidAmount - newTotal;
      booking.extraPayment = {
        required: false,
        amount: -refundAmount,
        status: "refund_pending",
      };
    } else {
      booking.extraPayment = {
        required: false,
        amount: 0,
        status: "not_required",
      };
    }
  }

  booking.modificationRequest.status = action;
  await booking.save();

  // 📧 Email guest
  const guest = booking.guestId;
  const nights =
    (new Date(booking.dateTo) - new Date(booking.dateFrom)) /
    (1000 * 60 * 60 * 24);
  const total = nights * booking.listingId.price;

  try {
    await sendEmail({
      to: guest.email,
      subject: `📅 Booking modification ${action}`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>Your booking change was <strong style="color:${
            action === "accepted" ? "green" : "red"
          }">${action}</strong></h2>
          <p><strong>Listing:</strong> ${booking.listingId.title}</p>
          ${
            action === "accepted"
              ? `<p><strong>New Dates:</strong> ${new Date(
                  booking.dateFrom
                ).toLocaleDateString()} → ${new Date(
                  booking.dateTo
                ).toLocaleDateString()}</p>
                 <p><strong>New Total (Est.):</strong> ৳${total.toFixed(2)}</p>
                 ${
                   booking.extraPayment?.status === "pending"
                     ? `<p style="color:#d97706;"><strong>🧾 Payment due:</strong> ৳${booking.extraPayment.amount}</p>`
                     : booking.extraPayment?.status === "refund_pending"
                     ? `<p style="color:#15803d;"><strong>💸 Refund due:</strong> ৳${Math.abs(
                         booking.extraPayment.amount
                       )}</p>`
                     : ""
                 }`
              : `<p>Host could not accommodate your requested dates.</p>`
          }
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Failed to send guest email:", err.message);
  }

  res.json({ message: `Modification ${action}`, booking });
};
exports.getBookingByTransactionId = async (req, res) => {
  try {
    const { tran_id } = req.params;

    const booking = await Booking.findOne({
      $or: [
        { transactionId: tran_id },
        { "extraPayment.transactionId": tran_id },
      ],
    })
      .populate("listingId", "title")
      .populate("guestId", "name");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    console.error("❌ Error fetching booking by tran_id:", err);
    res.status(500).json({ message: "Server error" });
  }
};
