import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import getTimeLeft from "../utils/getTimeLeft";
import MiniRouteMap from "./MiniRouteMap";
import {
  BadgeCheck,
  Bike,
  CalendarDays,
  Car,
  Clock,
  Coins,
  Flame,
  Info,
  MapPin,
  Users,
  X,
} from "lucide-react";

const RideResults = ({
  trips = [],
  onReserve,
  onCancel,
  selectedTrip,
  onSelectTrip,
}) => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [confirmTrip, setConfirmTrip] = useState(null);
  const [seatSelections, setSeatSelections] = useState({});

  const calculateTotal = (baseFare, seats) => {
    const subtotal = Number(baseFare || 0) * Number(seats || 0);
    return subtotal;
  };

  const handleSeatChange = (tripId, value) => {
    const v = Number(value || 1);
    setSeatSelections((prev) => ({
      ...prev,
      [tripId]: v < 1 ? 1 : v,
    }));
  };

  const validTrips = useMemo(() => {
    return (Array.isArray(trips) ? trips : []).filter(
      (trip) =>
        Array.isArray(trip.fromLocation?.coordinates) &&
        trip.fromLocation.coordinates.length === 2 &&
        Array.isArray(trip.toLocation?.coordinates) &&
        trip.toLocation.coordinates.length === 2 &&
        Array.isArray(trip.location?.coordinates) &&
        trip.location.coordinates.length === 2,
    );
  }, [trips]);

  if (!validTrips.length)
    return (
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <Info className="text-teal-700" size={22} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No rides found
        </h3>
        <p className="mt-1 text-gray-600">
          Try changing your route, date, or search area.
        </p>
      </div>
    );

  const StatusBadge = ({ label, tone = "neutral" }) => {
    const tones = {
      good: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bad: "bg-rose-50 text-rose-700 border-rose-200",
      warn: "bg-amber-50 text-amber-700 border-amber-200",
      neutral: "bg-slate-50 text-slate-700 border-slate-200",
      info: "bg-teal-50 text-teal-700 border-teal-200",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
      >
        {label}
      </span>
    );
  };

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {validTrips.map((trip) => {
          const isUrgent = dayjs(trip.date).diff(dayjs(), "hour") < 24;
          const isVerified = Boolean(trip.driverId?.verified);

          const reservedSeats =
            trip.passengers?.reduce(
              (sum, p) => sum + (p.status !== "cancelled" ? p.seats || 1 : 0),
              0,
            ) || 0;

          const seatsLeft = Math.max((trip.totalSeats || 0) - reservedSeats, 0);
          const seatsForTrip = Math.min(
            seatSelections[trip._id] || 1,
            Math.max(seatsLeft, 1),
          );

          const isCancelled = trip.status === "cancelled";
          const isExpired = dayjs(`${trip.date} ${trip.time}`).isBefore(
            dayjs(),
          );
          const isFullyBooked = seatsLeft === 0;
          const isDisabled = isCancelled || isExpired || isFullyBooked;

          const statusMeta = (() => {
            if (isCancelled) return { label: "Cancelled", tone: "bad" };
            if (isExpired) return { label: "Expired", tone: "neutral" };
            if (isFullyBooked) return { label: "Fully booked", tone: "bad" };
            return { label: "Available", tone: "good" };
          })();

          const vehicleType = (trip.vehicleType || "car").toLowerCase();
          const VehicleIcon = vehicleType === "bike" ? Bike : Car;

          // Click behavior:
          // - If selection mode is OFF (no onSelectTrip), clicking card goes to details
          // - If selection mode is ON, clicking card does nothing (use button)
          const allowCardNav = typeof onSelectTrip !== "function";

          return (
            <div
              key={trip._id}
              onClick={(e) => {
                if (!allowCardNav) return;
                if (e.target.closest("input") || e.target.closest("button"))
                  return;
                window.location.href = `/trips/${trip._id}`;
              }}
              className={[
                "group rounded-3xl border bg-white shadow-sm overflow-hidden transition",
                "hover:shadow-lg hover:border-teal-200",
                selectedTrip?._id === trip._id
                  ? "border-teal-400 ring-4 ring-teal-100"
                  : "border-gray-200",
                isDisabled ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="relative">
                <MiniRouteMap
                  from={{
                    name: trip.from,
                    coordinates: trip.fromLocation.coordinates,
                  }}
                  to={{
                    name: trip.to,
                    coordinates: trip.toLocation.coordinates,
                  }}
                  pickup={{
                    name: trip.location.address,
                    coordinates: trip.location.coordinates,
                  }}
                />

                {/* Top badges overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <StatusBadge
                    label={statusMeta.label}
                    tone={statusMeta.tone}
                  />
                  {isUrgent && !isExpired && !isCancelled && !isFullyBooked && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                      <Flame size={14} />
                      Urgent
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900"
                    title="Fare per seat"
                  >
                    <Coins size={14} className="text-teal-700" />৳
                    {trip.farePerSeat}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {trip.from} → {trip.to}
                    </h2>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-teal-700" />
                      <span className="truncate">
                        Pickup: {trip.location?.address || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                    <VehicleIcon size={14} />
                    {vehicleType.toUpperCase()}
                  </span>

                  {isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <BadgeCheck size={14} />
                      Verified driver
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                    <Users size={14} className="text-teal-700" />
                    {seatsLeft} / {trip.totalSeats} seats
                  </span>
                </div>

                {/* Date/time/countdown */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-gray-200 p-3">
                    <div className="text-gray-500 flex items-center gap-2">
                      <CalendarDays size={16} className="text-teal-700" />
                      Date
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {String(trip.date).slice(0, 10)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-3">
                    <div className="text-gray-500 flex items-center gap-2">
                      <Clock size={16} className="text-teal-700" />
                      Time
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {trip.time}
                    </div>
                  </div>
                </div>

                {!isExpired && !isCancelled && (
                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
                    ⏳{" "}
                    <span className="font-semibold">
                      {getTimeLeft(trip.date, trip.time)}
                    </span>
                  </div>
                )}

                {/* Actions area */}
                {!user ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    🔒 Login to reserve a ride
                  </div>
                ) : onReserve ? (
                  !isDisabled ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Seats
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={seatsLeft}
                            value={seatsForTrip}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleSeatChange(
                                trip._id,
                                parseInt(e.target.value, 10),
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                          />
                        </div>

                        <div className="min-w-[140px]">
                          <div className="text-xs font-semibold text-gray-600 mb-1">
                            Total
                          </div>
                          <div className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 font-bold text-gray-900">
                            ৳{calculateTotal(trip.farePerSeat, seatsForTrip)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onReserve(trip, seatsForTrip);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-white font-semibold shadow-sm hover:bg-teal-700"
                      >
                        Reserve {seatsForTrip} seat{seatsForTrip > 1 ? "s" : ""}
                      </button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 font-medium">
                      {isExpired
                        ? "⏳ This trip has expired."
                        : isCancelled
                          ? "This trip is cancelled."
                          : "Fully booked."}
                    </div>
                  )
                ) : onCancel && trip.reservationId ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmTrip(trip);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-white font-semibold hover:bg-rose-700"
                  >
                    Cancel reservation
                  </button>
                ) : null}

                {/* Selection mode button */}
                {typeof onSelectTrip === "function" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectTrip(trip);
                    }}
                    className={[
                      "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                      selectedTrip?._id === trip._id
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {selectedTrip?._id === trip._id
                      ? "✅ Selected for Booking"
                      : "Select This Ride"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Confirm Modal */}
      {confirmTrip && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setConfirmTrip(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-rose-600/10 to-amber-500/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Confirm cancellation
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setConfirmTrip(null)}
                  className="rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50"
                  aria-label="Close"
                >
                  <X size={18} className="text-gray-700" />
                </button>
              </div>
            </div>

            <div className="p-6 text-sm text-gray-700">
              Are you sure you want to cancel your reservation from{" "}
              <span className="font-semibold text-gray-900">
                {confirmTrip.from}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {confirmTrip.to}
              </span>{" "}
              on{" "}
              <span className="font-semibold text-gray-900">
                {dayjs(confirmTrip.date).format("YYYY-MM-DD")}
              </span>
              ?
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setConfirmTrip(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-800 hover:bg-gray-50"
              >
                Keep it
              </button>
              <button
                onClick={() => {
                  onCancel(confirmTrip);
                  setConfirmTrip(null);
                }}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white hover:bg-rose-700"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RideResults;
