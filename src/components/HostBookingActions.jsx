import React from "react";
import axios from "axios";

const HostBookingActions = ({ bookingId, refresh }) => {
  const token = localStorage.getItem("token");

  const updateStatus = async (action) => {
    const confirmMsg =
      action === "accept"
        ? "Are you sure you want to accept this booking?"
        : "Are you sure you want to cancel this booking?";
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;
    const url = `${
      import.meta.env.VITE_API_URL
    }/api/bookings/${bookingId}/${action}`;

    console.log("➡️ Cancel URL:", url);
    try {
      await axios.put(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      refresh(); // callback to re-fetch bookings
    } catch (err) {
      console.error(`❌ Failed to ${action} booking:`, err);
      alert(`Booking ${action} failed.`);
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => updateStatus("accept")}
        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
      >
        Accept
      </button>
      <button
        onClick={() => updateStatus("cancel")}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Cancel
      </button>
    </div>
  );
};

export default HostBookingActions;
