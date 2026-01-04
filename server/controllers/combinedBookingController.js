const User = require("../models/User");
const Listing = require("../models/Listing");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const sendEmail = require("../utils/email/sendEmail");

exports.createCombinedBooking = async (req, res) => {
  const { listingId, dateFrom, dateTo, guests, tripId, promoCode } = req.body;

  try {
    const today = new Date();
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    // ❌ Prevent past or invalid date ranges
    if (from < today || to <= from) {
      return res.status(400).json({
        message: "Invalid booking dates. Cannot book in the past.",
      });
    }

    // ✅ Fetch listing
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // ❌ Check blocked date ranges
    const isBlocked = listing.blockedDates?.some(
      (range) => new Date(range.from) <= to && new Date(range.to) >= from
    );

    if (isBlocked) {
      return res.status(409).json({
        message: "Listing is temporarily unavailable for those dates.",
      });
    }

    // ❌ Prevent overlapping bookings
    const overlapping = await Booking.findOne({
      listingId,
      status: { $nin: ["cancelled", "rejected"] },
      $or: [{ dateFrom: { $lte: to }, dateTo: { $gte: from } }],
    });

    if (overlapping) {
      return res.status(409).json({
        message: "This listing is already booked for those dates.",
      });
    }

    // ✅ Start creating the combined booking
    const booking = new Booking({
      listingId,
      guestId: req.user._id,
      dateFrom: from,
      dateTo: to,
      guests,
      price: 0, // updated later
      paymentStatus: "pending",
      status: "pending",
      tripId: tripId || null,
      combined: !!tripId,
      promoCode: promoCode || null,
    });
    await booking.save();

    let trip = null;
    let tripFare = 0;

    // ✅ Trip logic (if selected)
    if (tripId) {
      trip = await Trip.findById(tripId);
      if (!trip) return res.status(404).json({ message: "Trip not found" });

      const reservedSeats = trip.passengers.reduce(
        (sum, p) => sum + (p.status !== "cancelled" ? p.seats : 0),
        0
      );
      const seatsAvailable = trip.totalSeats - reservedSeats;
      if (seatsAvailable < guests)
        return res.status(400).json({ message: "Not enough seats available" });

      // ✅ Add user to trip
      trip.passengers.push({
        user: req.user._id,
        bookingId: booking._id,
        seats: guests,
        status: "reserved",
      });
      await trip.save();

      tripFare = trip.farePerSeat * guests;
    }

    // ✅ Calculate totals
    const nights =
      (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24);
    const staySubtotal = nights * listing.price;
    const serviceFee = Math.round((staySubtotal + tripFare) * 0.1); // combined fee
    const tax = Math.round(serviceFee * 0.15); // 15% VAT on platform fee

    // ✅ Apply promo logic (optional)
    let discount = 0;
    if (promoCode) {
      // TODO: Validate & calculate discount
    }

    const totalAmount = staySubtotal + tripFare + serviceFee - discount;

    // ✅ Update price in booking (optional)
    booking.price = totalAmount;
    await booking.save();

    // ✅ Final response
    res.status(201).json({
      bookingId: booking._id,
      tripId: tripId || null,
      amount: totalAmount,
      breakdown: {
        nights,
        pricePerNight: listing.price,
        staySubtotal,
        tripFare,
        serviceFee,
        tax,
        discount,
        total: totalAmount,
      },
    });
  } catch (err) {
    console.error("❌ Combined booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
