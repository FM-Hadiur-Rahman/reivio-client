import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const tranId = params.get("tran_id");
  const status = params.get("status"); // 'paid' or 'extra-paid'
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (tranId) {
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/api/bookings/transaction/${tranId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => setBooking(res.data))
        .catch((err) => {
          toast.error("Failed to load booking.");
          console.error("❌ Booking fetch failed", err);
        });
    }
  }, [tranId]);

  if (!tranId)
    return (
      <p className="text-center mt-10 text-red-500">Missing transaction ID.</p>
    );
  if (!booking)
    return <p className="text-center mt-10">Loading booking details...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border p-6 rounded shadow max-w-lg w-full space-y-4">
        <h1 className="text-2xl font-bold text-green-600">
          ✅{" "}
          {status === "extra-paid"
            ? "Extra Payment Received"
            : "Booking Confirmed"}
        </h1>
        <p className="text-gray-600">
          {status === "extra-paid"
            ? "Thank you! We've received your additional payment. Your booking is now fully confirmed."
            : "Thank you for your reservation!"}
        </p>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div>
            <strong>Booking ID:</strong> {booking._id}
          </div>
          <div>
            <strong>Listing:</strong> {booking.listingId?.title}
          </div>
          <div>
            <strong>From:</strong>{" "}
            {new Date(booking.dateFrom).toLocaleDateString()}
          </div>
          <div>
            <strong>To:</strong> {new Date(booking.dateTo).toLocaleDateString()}
          </div>
          <div>
            <strong>Guests:</strong> {booking.guests}
          </div>
          <div>
            <strong>Total Paid:</strong> ৳{booking.paidAmount}
          </div>
        </div>

        <Link
          to="/my-bookings"
          className="inline-block mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
