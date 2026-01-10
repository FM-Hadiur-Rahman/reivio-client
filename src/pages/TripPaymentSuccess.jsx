import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { authHeader } from "../utils/authHeader";

const TripPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get("tran_id");
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/trip-payment/reservation/${tran_id}`,
          authHeader()
        );
        setReservation(res.data);
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        toast.error("Reservation not found");
      }
    };

    if (tran_id) fetchReservation();
  }, [tran_id]);

  if (!reservation)
    return <div className="p-4 text-center">Loading reservation...</div>;

  const { tripId: trip, userId: user } = reservation;

  return (
    <div className="max-w-xl mx-auto p-6 border border-gray-200 rounded-lg shadow mt-8">
      <h2 className="text-xl font-bold text-green-600 mb-4">
        ✅ Trip Reservation Confirmed!
      </h2>
      <p className="text-gray-800 mb-2">
        Thank you, <strong>{user.name}</strong>!
      </p>
      <p>
        You've reserved <strong>{reservation.numberOfSeats}</strong> seat(s) on
        this trip:
      </p>

      <div className="my-4 p-4 bg-gray-100 rounded">
        <p>
          <strong>🛣️ From:</strong> {trip.from}
        </p>
        <p>
          <strong>🏁 To:</strong> {trip.to}
        </p>
        <p>
          <strong>📅 Date:</strong> {trip.date}
        </p>
        <p>
          <strong>⏰ Time:</strong> {trip.time}
        </p>
      </div>

      <p>
        <strong>Total Paid:</strong> ৳{reservation.totalAmount}
      </p>
      <p>
        <strong>Transaction ID:</strong> {reservation.transactionId}
      </p>
      <a
        href={`${import.meta.env.VITE_API_URL}/invoices/trip-invoice-${
          reservation._id
        }.pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4 inline-block"
      >
        📄 View Trip Invoice
      </a>
    </div>
  );
};

export default TripPaymentSuccess;
