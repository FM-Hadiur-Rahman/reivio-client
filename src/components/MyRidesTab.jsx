import React, { useEffect, useState } from "react";
import axios from "axios";
import RideResults from "./RideResults";
import { toast } from "react-toastify";

const MyRidesTab = () => {
  const [myRides, setMyRides] = useState([]);

  const fetchRides = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/trip-payment/my-paid-reservations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // ✅ Extract the actual trip info from each reservation
      const paidTrips = res.data
        .filter((r) => r.status === "paid")
        .map((r) => ({
          ...r.tripId,
          reservationId: r._id, // optional: pass reservation ID if needed
          reservedSeats: r.seats, // optional: show how many seats were reserved
        }));

      setMyRides(paidTrips);
    } catch (err) {
      console.error("❌ Failed to fetch reserved rides", err);
      toast.error("Could not load your reserved rides.");
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">🚘 My Reserved Rides</h2>

      <button
        onClick={fetchRides}
        className="mb-4 px-4 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
      >
        🔄 Refresh
      </button>

      <RideResults
        trips={myRides}
        onCancel={async (trip) => {
          const hoursLeft = Math.floor(
            (new Date(trip.date) - new Date()) / (1000 * 60 * 60)
          );

          if (hoursLeft < 24) {
            toast.warn(
              "🚫 You can only cancel at least 24 hours before the trip."
            );
            return;
          }

          try {
            const res = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/trips/${trip._id}/cancel`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            toast.success("❌ Ride canceled");
            fetchRides(); // Refresh list after cancellation
          } catch (err) {
            console.error("❌ Cancel failed", err);
            toast.error("Could not cancel ride.");
          }
        }}
      />
    </div>
  );
};

export default MyRidesTab;
