import React, { useEffect, useState } from "react";
import axios from "axios";
import BookingCard from "../components/BookingCard";
import { authHeader } from "../utils/authHeader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DashboardBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        console.log("📦 User bookings:", res.data);
        if (Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          console.warn("⚠️ Unexpected bookings response:", res.data);
          setBookings([]);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load bookings", err);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRequestModification = async (id, from, to) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/bookings/${id}/request-modification`,
        { from: from.toISOString(), to: to.toISOString() },
        authHeader()
      );
      toast.success("📅 Modification request sent");
      fetchBookings();
    } catch (err) {
      toast.error("❌ Failed to send request");
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${id}/checkin`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, checkInAt: new Date().toISOString() } : b
        )
      );

      toast.success("✅ Checked in successfully!");
    } catch (err) {
      toast.error("Check-in failed");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${id}/checkout`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // ✅ Update the checkOutAt in local state instead of re-fetching
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, checkOutAt: new Date().toISOString() } : b
        )
      );

      toast.success("✅ Checked out successfully!");
    } catch (err) {
      console.error("❌ Check-out failed", err);
      toast.error("Check-out failed");
    }
  };

  const handleLeaveReview = (booking) => {
    navigate(
      `/dashboard/reviews?booking=${booking._id}&listing=${booking.listingId._id}`
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">📋 My Bookings</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading bookings...</p>
      ) : Array.isArray(bookings) && bookings.length === 0 ? (
        <p className="text-center text-gray-500">You have no bookings yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.isArray(bookings) &&
            bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onLeaveReview={handleLeaveReview}
                onRequestModification={handleRequestModification}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default DashboardBookings;
