// server/cron/expirePendingBookings.js
const dotenv = require("dotenv");
dotenv.config(); // Load .env variables

const connectDB = require("../config/db"); // uses DATABASE and DATABASE_PASSWORD
const Booking = require("../models/Booking");
const sendEmail = require("../utils/email/sendEmail");
const User = require("../models/User");

const expireOldBookings = async () => {
  await connectDB();
  const threshold = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days

  const expired = await Booking.find({
    status: "pending",
    createdAt: { $lt: threshold },
  }).populate("guestId listingId");

  for (let booking of expired) {
    booking.status = "expired";
    await booking.save();

    const host = await User.findById(booking.listingId.hostId);

    await sendEmail({
      to: booking.guestId.email,
      subject: "⏳ Booking Request Expired",
      html: `<p>Hi ${booking.guestId.name},</p>
             <p>Your request for <strong>${booking.listingId.title}</strong> has expired as the host didn't respond within 3 days.</p>`,
    });

    await sendEmail({
      to: host.email,
      subject: "📭 Booking Request Expired",
      html: `<p>Hi ${host.name},</p>
             <p>You did not respond to a booking request for <strong>${booking.listingId.title}</strong>. It has been automatically marked as expired.</p>`,
    });
  }

  console.log(`✅ ${expired.length} pending bookings marked as expired.`);
  process.exit();
};

expireOldBookings();
