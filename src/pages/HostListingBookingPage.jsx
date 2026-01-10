import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HostBookingActions from "../components/HostBookingActions";
import BookingStatusBadge from "../components/BookingStatusBadge";
import { toast } from "react-toastify";

const HostListingBookingsPage = () => {
  const { id } = useParams(); // listing ID
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings/host`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const filtered = Array.isArray(res.data)
        ? res.data.filter((b) => b?.listingId?._id === id)
        : [];
      setBookings(filtered);
    } catch (err) {
      console.error("❌ Error loading bookings:", err);
    }
  };

  const respondToModification = async (bookingId, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/bookings/${bookingId}/respond-modification`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`✅ Modification ${action}`);
      fetchBookings();
    } catch (err) {
      toast.error("❌ Failed to update booking");
      console.error("Modification error:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-700">
        Bookings for this Listing
      </h1>

      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li
              key={b?._id}
              className="p-4 border rounded bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex-1">
                <p>
                  <strong>Guest:</strong> {b?.guestId?.name}
                </p>
                <p>
                  <strong>📅 Dates:</strong>{" "}
                  {b?.dateFrom && b?.dateTo
                    ? `${new Date(b.dateFrom).toLocaleDateString(
                        "en-GB"
                      )} → ${new Date(b.dateTo).toLocaleDateString("en-GB")}`
                    : "N/A"}
                </p>
                <p className="mt-1">
                  <strong>Status:</strong>{" "}
                  <BookingStatusBadge status={b?.status} />
                </p>

                {b?.modificationRequest?.status === "requested" && (
                  <div className="mt-3 text-sm bg-yellow-100 p-2 rounded text-yellow-800">
                    🔄 <strong>Modification requested:</strong>
                    <br />
                    New Dates:{" "}
                    <strong>
                      {new Date(
                        b.modificationRequest?.requestedDates?.from
                      ).toLocaleDateString("en-GB")}{" "}
                      →{" "}
                      {new Date(
                        b.modificationRequest?.requestedDates?.to
                      ).toLocaleDateString("en-GB")}
                    </strong>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => respondToModification(b._id, "accepted")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => respondToModification(b._id, "rejected")}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {b?.status === "pending" && (
                <HostBookingActions bookingId={b._id} refresh={fetchBookings} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HostListingBookingsPage;
