import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import RideSearchForm from "../components/RideSearchForm";
import RideResults from "../components/RideResults";
import { initiateTripPayment } from "../utils/initiateTripPayment";

const RideResultsPage = () => {
  const [rideResults, setRideResults] = useState([]);
  const [tripFrom, setTripFrom] = useState("");
  const [tripTo, setTripTo] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  useEffect(() => {
    handleTripSearch(); // 👈 Automatically fetch trips on first load
  }, []);

  const handleTripSearch = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/trips`);
      const filtered = res.data.filter((trip) => {
        return (
          (!tripFrom ||
            trip.from.toLowerCase().includes(tripFrom.toLowerCase())) &&
          (!tripTo || trip.to.toLowerCase().includes(tripTo.toLowerCase())) &&
          (!tripDate || trip.date.startsWith(tripDate))
        );
      });
      setRideResults(filtered);
      setHasSearched(true);
    } catch (err) {
      console.error("❌ Failed to fetch rides", err);
    }
  };

  const handleReserveSeat = async (trip, seatCount = 1) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in to reserve a ride");

    try {
      const paymentUrl = await initiateTripPayment({
        tripId: trip._id,
        seats: seatCount,
        token,
      });

      if (paymentUrl) {
        toast.success("✅ Redirecting to payment...");
        window.location.href = paymentUrl;
      } else {
        toast.error("Payment initiation failed");
      }
    } catch (err) {
      console.error("❌ Payment initiation error:", err);
      toast.error(err?.response?.data?.message || "Failed to initiate payment");
    }
  };

  const cancelReservation = async (tripId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("❌ Reservation cancelled");
      handleTripSearch(); // refresh
    } catch (err) {
      console.error("❌ Cancel failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to cancel reservation"
      );
    }
  };

  return (
    <section className="py-8 bg-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <RideSearchForm
            tripFrom={tripFrom}
            tripTo={tripTo}
            tripDate={tripDate}
            setTripFrom={setTripFrom}
            setTripTo={setTripTo}
            setTripDate={setTripDate}
            handleTripSearch={handleTripSearch}
            onResults={setRideResults}
            onCancel={cancelReservation}
          />
        </div>

        <div className="mt-6">
          <RideResults
            trips={rideResults}
            onReserve={handleReserveSeat}
            onCancel={cancelReservation}
            hasSearched={hasSearched}
          />
        </div>
      </div>
    </section>
  );
};

export default RideResultsPage;
