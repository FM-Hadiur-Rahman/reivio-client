import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { initiateTripPayment } from "../utils/initiateTripPayment";
import dayjs from "dayjs";
import getTimeLeft from "../utils/getTimeLeft";
import MiniRouteMap from "../components/MiniRouteMap";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Car,
  Clock,
  Coins,
  CreditCard,
  Flame,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Users,
  XCircle,
} from "lucide-react";

const TripDetailPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsToReserve, setSeatsToReserve] = useState(1);
  const [hasReserved, setHasReserved] = useState(false);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/trips/${id}`)
      .then((res) => {
        setTrip(res.data);

        const alreadyReserved = res.data.passengers?.some(
          (p) =>
            (p.user === user?._id || p.user?._id === user?._id) &&
            p.status !== "cancelled",
        );

        setHasReserved(Boolean(alreadyReserved));
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load trip", err);
        setLoading(false);
      });
  }, [id, user?._id]);

  const handleReserve = async (tripObj, seatCount = 1) => {
    if (!token) return toast.error("You must be logged in to reserve a ride");

    try {
      const paymentUrl = await initiateTripPayment({
        tripId: tripObj._id,
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

  const handleCancel = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/trips/${trip._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("❌ Reservation canceled");
      setTrip(res.data.trip);
      setHasReserved(false);
    } catch (err) {
      console.error("❌ Cancel failed:", err);
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
        <p className="text-center pt-16 text-gray-600">Loading trip details…</p>
      </div>
    );

  if (!trip)
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
        <p className="text-center pt-16 text-rose-600 font-semibold">
          Trip not found.
        </p>
      </div>
    );

  // --- Calculations ---
  const reservedSeats =
    trip.passengers
      ?.filter((p) => p.status !== "cancelled")
      .reduce(
        (sum, p) => sum + (Number(p.seats) > 0 ? Number(p.seats) : 1),
        0,
      ) || 0;

  const availableSeats = Math.max((trip.totalSeats || 0) - reservedSeats, 0);
  const isCancelled = trip.status === "cancelled";
  const isExpired = dayjs(`${trip.date} ${trip.time}`).isBefore(dayjs());
  const isUrgent = dayjs(trip.date).diff(dayjs(), "hour") < 24 && !isExpired;

  const subtotal = Number(trip.farePerSeat || 0) * Number(seatsToReserve || 1);
  const serviceFee = Math.round(subtotal * 0.1); // 10%
  const vat = Math.round(serviceFee * 0.15); // paid by platform, not user
  const total = subtotal + serviceFee;

  const getTripStatus = () => {
    if (isCancelled)
      return {
        label: "Cancelled",
        cls: "bg-rose-50 text-rose-700 border-rose-200",
      };
    if (isExpired)
      return {
        label: "Expired",
        cls: "bg-slate-50 text-slate-700 border-slate-200",
      };
    if (availableSeats === 0)
      return {
        label: "Fully booked",
        cls: "bg-rose-50 text-rose-700 border-rose-200",
      };
    return {
      label: "Available",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  const status = getTripStatus();

  const isOwner = user?._id && user?._id === trip.driverId?._id;
  const canReserve =
    !isOwner &&
    !hasReserved &&
    !isExpired &&
    !isCancelled &&
    availableSeats > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <Car size={16} />
                  Trip Details
                </div>

                <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-gray-900 truncate">
                  {trip.from} → {trip.to}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${status.cls}`}
                  >
                    {status.label}
                  </span>

                  {isUrgent && !isCancelled && availableSeats > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 animate-pulse">
                      <Flame size={14} />
                      Urgent
                    </span>
                  )}

                  {!isExpired && !isCancelled && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-semibold text-gray-800">
                      <Clock size={14} className="text-teal-700" />
                      {getTimeLeft(trip.date, trip.time)}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-semibold text-gray-800">
                    <Users size={14} className="text-teal-700" />
                    {availableSeats} / {trip.totalSeats} seats
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-semibold text-gray-800">
                    <Coins size={14} className="text-teal-700" />৳
                    {trip.farePerSeat}/seat
                  </span>
                </div>
              </div>

              <Link
                to="/trips"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50"
              >
                <ArrowLeft size={18} className="text-teal-700" />
                Back
              </Link>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Schedule + Vehicle */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Trip Info
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Date, time, vehicle and pickup details.
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-gray-500 flex items-center gap-2">
                    <CalendarDays size={16} className="text-teal-700" />
                    Date
                  </div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {String(trip.date).slice(0, 10)}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-gray-500 flex items-center gap-2">
                    <Clock size={16} className="text-teal-700" />
                    Time
                  </div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {trip.time}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-gray-500 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-teal-700" />
                    Vehicle
                  </div>
                  <div className="mt-1 font-semibold text-gray-900 capitalize">
                    {trip.vehicleType || "car"} • {trip.vehicleModel || "N/A"}
                  </div>
                  <div className="mt-1 text-gray-600">
                    Plate:{" "}
                    <span className="font-semibold text-gray-900">
                      {trip.licensePlate || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-gray-500 flex items-center gap-2">
                    <MapPin size={16} className="text-teal-700" />
                    Pickup
                  </div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {trip.location?.address ||
                      trip.fromLocation?.address ||
                      "—"}
                  </div>
                </div>
              </div>

              {trip.image && (
                <div className="px-6 pb-6">
                  <div className="text-sm font-semibold text-gray-800 mb-2">
                    Vehicle Image
                  </div>
                  <img
                    src={trip.image}
                    alt="Vehicle"
                    className="w-full max-w-xl rounded-2xl border bg-white object-cover"
                  />
                </div>
              )}
            </div>

            {/* Map */}
            {trip.fromLocation?.coordinates && trip.toLocation?.coordinates && (
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Route</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    From, destination and pickup point.
                  </p>
                </div>

                <div className="p-6">
                  <MiniRouteMap
                    from={{
                      coordinates: trip.fromLocation.coordinates,
                      name: trip.fromLocation.address || trip.from,
                    }}
                    to={{
                      coordinates: trip.toLocation.coordinates,
                      name: trip.toLocation.address || trip.to,
                    }}
                    pickup={
                      trip.location?.coordinates
                        ? {
                            coordinates: trip.location.coordinates,
                            name: trip.location.address,
                          }
                        : null
                    }
                  />

                  {trip.location?.address && (
                    <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="mt-0.5 text-teal-700" />
                        <div>
                          Pickup:{" "}
                          <span className="font-semibold">
                            {trip.location.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Driver */}
            {trip.driverId && typeof trip.driverId === "object" && (
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Driver
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Contact the driver after booking if needed.
                  </p>
                </div>

                <div className="p-6 flex items-start gap-4">
                  <img
                    src={trip.driverId.avatar || "/default-avatar.png"}
                    alt="Driver"
                    className="w-16 h-16 rounded-2xl object-cover border bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900 truncate">
                        {trip.driverId.name}
                      </p>
                      {trip.driverId?.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <BadgeCheck size={14} />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      📞 {trip.driverId.phone || "Not available"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {trip.driverId.phone && (
                        <a
                          href={`tel:${trip.driverId.phone}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          <Phone size={16} className="text-teal-700" />
                          Call
                        </a>
                      )}
                      <button
                        onClick={() =>
                          navigate(
                            `/chat?receiver=${trip.driverId._id}&tripId=${trip._id}`,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-white font-semibold hover:bg-teal-700"
                      >
                        <MessageSquare size={16} />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews placeholder */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Reviews appear after rides are completed.
                </p>
              </div>
              <div className="p-6 text-sm text-gray-600 italic flex items-center gap-2">
                <Star size={16} className="text-teal-700" />
                No reviews yet. Be the first to leave one after your ride.
              </div>
            </div>
          </div>

          {/* Right sticky reserve card */}
          {!isOwner && (
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-6 space-y-4">
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reserve a seat
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Secure your seat with payment.
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {hasReserved ? (
                      <button
                        onClick={handleCancel}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-white font-semibold hover:bg-rose-700"
                      >
                        <XCircle size={18} />
                        Cancel Reservation
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-1">
                            Seats
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={availableSeats}
                            value={seatsToReserve}
                            disabled={!canReserve}
                            onChange={(e) =>
                              setSeatsToReserve(
                                parseInt(e.target.value, 10) || 1,
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:opacity-60"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {availableSeats} seat(s)
                          </p>
                        </div>

                        {!canReserve && (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 font-medium">
                            {isCancelled
                              ? "This trip is cancelled."
                              : isExpired
                                ? "⏳ This trip has already departed."
                                : availableSeats === 0
                                  ? "🚫 This trip is fully booked."
                                  : hasReserved
                                    ? "You already reserved."
                                    : "Reservation not available."}
                          </div>
                        )}

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold text-gray-900">
                              ৳{subtotal}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              Service Fee (10%)
                            </span>
                            <span className="font-semibold text-gray-900">
                              ৳{serviceFee}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            VAT (15%) on service fee is paid by BanglaBnB (৳
                            {vat}) — not added to your total.
                          </div>
                          <div className="h-px bg-gray-200 my-2" />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              Total to Pay
                            </span>
                            <span className="text-lg font-bold text-emerald-700">
                              ৳{total}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReserve(trip, seatsToReserve)}
                          disabled={!canReserve}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <CreditCard size={18} />
                          Reserve {seatsToReserve} Seat
                          {seatsToReserve > 1 ? "s" : ""}
                        </button>

                        {!token && (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            <div className="flex items-start gap-2">
                              <Info
                                size={16}
                                className="mt-0.5 text-amber-700"
                              />
                              <div>Please log in to reserve.</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-teal-100 bg-teal-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-3 border border-teal-100">
                      <Info className="text-teal-700" size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Tip</div>
                      <div className="text-sm text-gray-700 mt-1">
                        Choose the exact number of seats you need. After
                        payment, your seat(s) are reserved instantly.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
