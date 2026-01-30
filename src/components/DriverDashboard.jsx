// ✅ PREMIUM TEAL DriverDashboard.jsx (all modals still work)
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import getTimeLeft from "../utils/getTimeLeft";
import ConfirmCancelModal from "./modals/ConfirmCancelModal";
import ConfirmTripDeleteModal from "./modals/ConfirmTripDeleteModal";
import CompletionSuccessModal from "./modals/CompletionSuccessModal";
import PassengerListModal from "./modals/PassengerListModal";
import { toast } from "react-toastify";
import {
  Bike,
  Car,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  Info,
  MapPin,
  Pencil,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

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

        setTrips(Array.isArray(tripRes.data) ? tripRes.data : []);
        setStats(statsRes.data || null);
        setEarnings(earningsRes.data?.trips || []);
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
        },
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
        },
      );
      setTrips((prev) =>
        prev.map((trip) =>
          trip._id === tripId ? { ...trip, status: "completed" } : trip,
        ),
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
        },
      );
      setTrips((prev) =>
        prev.map((trip) =>
          trip._id === tripId ? { ...trip, status: "cancelled" } : trip,
        ),
      );
      toast.success("Trip cancelled successfully");
    } catch (err) {
      console.error("❌ Cancel trip failed:", err);
      toast.error("Failed to cancel trip");
    }
  };

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
            <Icon className="text-teal-700" size={18} />
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">{label}</div>
        <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );

  const statusBadge = (s) => {
    const v = (s || "").toLowerCase();
    if (v === "available")
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (v === "cancelled")
      return "bg-rose-50 text-rose-700 border border-rose-200";
    if (v === "completed")
      return "bg-slate-50 text-slate-700 border border-slate-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  const fmtDate = (d) => {
    try {
      return (d || "").slice(0, 10);
    } catch {
      return "";
    }
  };

  const sortedTrips = useMemo(() => {
    const arr = Array.isArray(trips) ? [...trips] : [];
    // sort: upcoming first
    arr.sort((a, b) => {
      const da = new Date(
        `${a?.date?.slice(0, 10)}T${a?.time || "00:00"}`,
      ).getTime();
      const db = new Date(
        `${b?.date?.slice(0, 10)}T${b?.time || "00:00"}`,
      ).getTime();
      return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db);
    });
    return arr;
  }, [trips]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <Car size={16} />
                  Driver Dashboard
                </div>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  My Posted Rides
                </h2>
                <p className="mt-2 max-w-2xl text-gray-600">
                  Manage your trips, passengers, and earnings in one place.
                </p>
              </div>

              <Link
                to="/dashboard/driver/trips/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700"
              >
                ➕ Create New Trip
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={CalendarDays}
              label="Total Trips"
              value={stats.totalTrips}
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={stats.completed}
            />
            <StatCard
              icon={XCircle}
              label="Cancelled"
              value={stats.cancelled}
            />
            <StatCard
              icon={Coins}
              label="Total Earnings"
              value={`৳${stats.totalEarnings}`}
            />
          </div>
        )}

        {/* Earnings table */}
        {earnings?.length > 0 && (
          <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Trip Earnings
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Summary of earnings by trip.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-600">
                    <th className="py-3 px-6 font-semibold">Date</th>
                    <th className="py-3 px-6 font-semibold">Route</th>
                    <th className="py-3 px-6 font-semibold">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.tripId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">{e.date}</td>
                      <td className="py-3 px-6">
                        {e.from} → {e.to}
                      </td>
                      <td className="py-3 px-6 font-semibold text-emerald-700">
                        ৳{e.earnings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trips */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-8 text-gray-600">
              Loading your trips…
            </div>
          ) : sortedTrips.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Info className="text-teal-700" size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No trips yet
              </h3>
              <p className="mt-1 text-gray-600">
                Create your first trip to start receiving passengers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {sortedTrips.map((trip) => {
                const isExpired =
                  getTimeLeft(trip.date, trip.time) === "Departed";
                const reservedSeats =
                  trip.passengers
                    ?.filter((p) => p.status !== "cancelled")
                    .reduce((sum, p) => sum + (Number(p.seats) || 1), 0) || 0;

                const availableSeats = Math.max(
                  (trip.totalSeats || 0) - reservedSeats,
                  0,
                );

                return (
                  <div
                    key={trip._id}
                    className={[
                      "rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden",
                      isExpired ? "opacity-70" : "",
                    ].join(" ")}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm text-gray-500">Route</div>
                          <div className="text-lg font-bold text-gray-900 truncate">
                            {trip.from} → {trip.to}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={[
                                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                                statusBadge(trip.status),
                              ].join(" ")}
                            >
                              {trip.status || "unknown"}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                              <Users size={14} className="text-teal-700" />
                              {availableSeats} seats left
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                              <Coins size={14} className="text-teal-700" />৳
                              {trip.farePerSeat}/seat
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                              {trip.vehicleType === "bike" ? (
                                <Bike size={14} className="text-teal-700" />
                              ) : (
                                <Car size={14} className="text-teal-700" />
                              )}
                              {trip.vehicleType || "car"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-gray-200 p-4">
                          <div className="text-gray-500 flex items-center gap-2">
                            <CalendarDays size={16} className="text-teal-700" />
                            Date
                          </div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {fmtDate(trip.date)}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <div className="text-gray-500 flex items-center gap-2">
                            <Clock size={16} className="text-teal-700" />
                            Time / Countdown
                          </div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {trip.time} • {getTimeLeft(trip.date, trip.time)}
                          </div>
                        </div>
                      </div>

                      {isExpired && (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                          <div className="flex items-start gap-2">
                            <Info size={16} className="mt-0.5 text-amber-700" />
                            <div>
                              This trip has departed. Actions are disabled.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          to={`/trips/${trip._id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          View{" "}
                          <ExternalLink size={16} className="text-teal-700" />
                        </Link>

                        {!isExpired && trip.status !== "cancelled" && (
                          <>
                            <Link
                              to={`/dashboard/driver/trips/edit/${trip._id}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
                            >
                              <Pencil size={16} className="text-teal-700" />
                              Edit
                            </Link>

                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowPassengerModal(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-white font-semibold hover:bg-teal-700"
                            >
                              <Users size={16} />
                              Passengers
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowCompletionModal(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
                            >
                              <CheckCircle2 size={16} />
                              Complete
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowCancelModal(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white font-semibold hover:bg-rose-700"
                            >
                              <XCircle size={16} />
                              Cancel
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowDeleteModal(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
                            >
                              <Trash2 size={16} className="text-rose-700" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
    </div>
  );
};

export default DriverDashboard;
