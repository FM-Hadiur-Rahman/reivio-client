import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";

const InvoiceDownload = React.lazy(() =>
  import("../components/InvoiceDownload")
);

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true); // new

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/bookings/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setBookings(res.data))
      .catch((err) => console.error("❌ Failed to fetch bookings:", err))
      .finally(() => setLoading(false)); // ✅ hide loader
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
        My Bookings
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">⏳ Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-500">You have no bookings yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border border-gray-200 rounded-lg shadow hover:shadow-md transition bg-white p-4"
            >
              <h3 className="text-lg font-semibold mb-2 text-green-800">
                {booking.listingId?.title || "Untitled Listing"}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                📍 {booking.listingId?.location?.address || "Unknown"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                💰{" "}
                <span className="font-medium text-green-700">
                  ৳{booking.listingId?.price}
                </span>{" "}
                / night
              </p>
              <p className="text-sm text-gray-600 mb-1">
                📅 {new Date(booking.dateFrom).toLocaleDateString()} →{" "}
                {new Date(booking.dateTo).toLocaleDateString()}
              </p>
              <span
                className={`inline-block mt-3 px-3 py-1 text-xs rounded-full font-semibold ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : booking.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {booking.status.toUpperCase()}
              </span>
              {booking.paymentStatus === "paid" && (
                <div className="mt-3">
                  <Suspense fallback={<div>Loading invoice...</div>}>
                    <InvoiceDownload bookingId={booking._id} />
                  </Suspense>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
