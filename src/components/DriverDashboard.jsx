// ✅ FULLY COMPLETE DriverDashboard.jsx with all modals working
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import getTimeLeft from "../utils/getTimeLeft";
import ConfirmCancelModal from "./modals/ConfirmCancelModal";
import ConfirmTripDeleteModal from "./modals/ConfirmTripDeleteModal";
import CompletionSuccessModal from "./modals/CompletionSuccessModal";
import PassengerListModal from "./modals/PassengerListModal";
import { toast } from "react-toastify";

const DriverDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState([]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [tripRes, statsRes, earningsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/trips/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/trips/driver-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/trips/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTrips(tripRes.data);
        setStats(statsRes.data);
        setEarnings(earningsRes.data.trips);
      } catch (err) {
        console.error("❌ Error loading driver dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteTrip = async (tripId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
      toast.success("Trip deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete trip:", err);
      toast.error("Failed to delete trip");
    }
  };

  const handleCompleteTrip = async (tripId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTrips((prev) =>
        prev.map((trip) =>
          trip._id === tripId ? { ...trip, status: "completed" } : trip
        )
      );
      toast.success("Trip marked as completed");
    } catch (err) {
      console.error("❌ Completion failed:", err);
      toast.error("Failed to mark trip as completed");
    }
  };

  const handleCancelTrip = async (tripId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTrips((prev) =>
        prev.map((trip) =>
          trip._id === tripId ? { ...trip, status: "cancelled" } : trip
        )
      );
      toast.success("Trip cancelled successfully");
    } catch (err) {
      console.error("❌ Cancel trip failed:", err);
      toast.error("Failed to cancel trip");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🚘 My Posted Rides</h2>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-white">
          <div className="bg-blue-600 p-4 rounded shadow">
            <p className="text-sm">Total Trips</p>
            <p className="text-xl font-bold">{stats.totalTrips}</p>
          </div>
          <div className="bg-green-600 p-4 rounded shadow">
            <p className="text-sm">Completed</p>
            <p className="text-xl font-bold">{stats.completed}</p>
          </div>
          <div className="bg-red-600 p-4 rounded shadow">
            <p className="text-sm">Cancelled</p>
            <p className="text-xl font-bold">{stats.cancelled}</p>
          </div>
          <div className="bg-yellow-600 p-4 rounded shadow">
            <p className="text-sm">Total Earnings</p>
            <p className="text-xl font-bold">৳{stats.totalEarnings}</p>
          </div>
        </div>
      )}

      <Link
        to="/dashboard/driver/trips/new"
        className="inline-block bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        ➕ Create New Trip
      </Link>

      {earnings?.length > 0 && (
        <div className="bg-white rounded shadow p-4 mb-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2">💰 Trip Earnings</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Date</th>
                <th className="py-2">From → To</th>
                <th className="py-2">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e) => (
                <tr key={e.tripId} className="border-b">
                  <td className="py-1">{e.date}</td>
                  <td className="py-1">
                    {e.from} → {e.to}
                  </td>
                  <td className="py-1 font-semibold text-green-700">
                    ৳{e.earnings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading your trips...</p>
      ) : trips.length === 0 ? (
        <p className="text-gray-600">You haven't posted any trips yet.</p>
      ) : (
        trips.map((trip) => {
          const isExpired = getTimeLeft(trip.date, trip.time) === "Departed";
          const reservedSeats =
            trip.passengers
              ?.filter((p) => p.status !== "cancelled")
              .reduce((sum, p) => sum + (Number(p.seats) || 1), 0) || 0;
          const availableSeats = Math.max(
            (trip.totalSeats || 0) - reservedSeats,
            0
          );

          return (
            <div
              key={trip._id}
              className={`border p-4 rounded shadow mb-4 bg-white relative ${
                isExpired ? "opacity-60" : ""
              }`}
            >
              <p>
                <strong>From:</strong> {trip.from} → <strong>To:</strong>{" "}
                {trip.to}
              </p>
              <p>
                <strong>Date:</strong> {trip.date.slice(0, 10)} |{" "}
                <strong>Time:</strong> {trip.time}
              </p>
              <p>
                <strong>Countdown:</strong> {getTimeLeft(trip.date, trip.time)}
              </p>
              <p>
                <strong>Fare:</strong> ৳{trip.farePerSeat} |{" "}
                <strong>Seats:</strong> {trip.totalSeats} ({availableSeats}{" "}
                left)
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    trip.status === "available"
                      ? "text-green-600"
                      : trip.status === "cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {trip.status}
                </span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/trips/${trip._id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  View Details
                </Link>
                {!isExpired && trip.status !== "cancelled" && (
                  <>
                    <Link
                      to={`/dashboard/driver/trips/edit/${trip._id}`}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedTrip(trip);
                        setShowCancelModal(true);
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTrip(trip);
                        setShowDeleteModal(true);
                      }}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTrip(trip);
                        setShowCompletionModal(true);
                      }}
                      className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTrip(trip);
                        setShowPassengerModal(true);
                      }}
                      className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800"
                    >
                      Passengers
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* MODALS */}
      {showCancelModal && (
        <ConfirmCancelModal
          trip={selectedTrip}
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => {
            handleCancelTrip(selectedTrip._id);
            setShowCancelModal(false);
          }}
        />
      )}

      {showDeleteModal && (
        <ConfirmTripDeleteModal
          trip={selectedTrip}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            handleDeleteTrip(selectedTrip._id);
            setShowDeleteModal(false);
          }}
        />
      )}

      {showCompletionModal && (
        <CompletionSuccessModal
          trip={selectedTrip}
          onClose={() => setShowCompletionModal(false)}
          onConfirm={() => {
            handleCompleteTrip(selectedTrip._id);
            setShowCompletionModal(false);
          }}
        />
      )}

      {showPassengerModal && (
        <PassengerListModal
          trip={selectedTrip}
          onClose={() => setShowPassengerModal(false)}
        />
      )}
    </div>
  );
};

export default DriverDashboard;
