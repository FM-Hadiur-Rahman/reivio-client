import React, { useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import getTimeLeft from "../utils/getTimeLeft";
import MiniRouteMap from "./MiniRouteMap";

const RideResults = ({
  trips = [],
  onReserve,
  onCancel,
  selectedTrip,
  onSelectTrip,
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [confirmTrip, setConfirmTrip] = useState(null);
  const [seatSelections, setSeatSelections] = useState({});

  const [selectedSeats, setSelectedSeats] = useState(1);

  const calculateTotal = (baseFare, seats) => {
    const subtotal = baseFare * seats;

    return subtotal;
  };
  const handleSeatChange = (tripId, value) => {
    setSeatSelections((prev) => ({
      ...prev,
      [tripId]: value,
    }));
  };

  const validTrips = trips.filter(
    (trip) =>
      Array.isArray(trip.fromLocation?.coordinates) &&
      trip.fromLocation.coordinates.length === 2 &&
      Array.isArray(trip.toLocation?.coordinates) &&
      trip.toLocation.coordinates.length === 2 &&
      Array.isArray(trip.location?.coordinates) &&
      trip.location.coordinates.length === 2
  );

  if (!validTrips.length)
    return <p className="text-center text-gray-600 py-6">❌ No rides found.</p>;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {validTrips.map((trip) => {
          const isUrgent = dayjs(trip.date).diff(dayjs(), "hour") < 24;
          const isVerified = trip.driverId?.verified;
          const vehicleEmoji = trip.vehicleType === "car" ? "🚗" : "🏍️";
          const reservedSeats = trip.passengers?.reduce(
            (sum, p) => sum + (p.status !== "cancelled" ? p.seats || 1 : 0),
            0
          );
          const seatsLeft = Math.max((trip.totalSeats || 0) - reservedSeats, 0);
          const seatsForTrip = seatSelections[trip._id] || 1;

          const hasReserved = trip.passengers?.some(
            (p) =>
              (p.user === user?._id || p.user?._id === user?._id) &&
              p.status !== "cancelled"
          );

          const isCancelled = trip.status === "cancelled";
          const isExpired = dayjs(`${trip.date} ${trip.time}`).isBefore(
            dayjs()
          );
          const isFullyBooked = seatsLeft === 0;
          const isDisabled = isCancelled || isExpired || isFullyBooked;

          const getTripStatus = () => {
            if (isCancelled)
              return { label: "Cancelled", color: "text-red-500" };
            if (isExpired) return { label: "Expired", color: "text-gray-500" };
            if (seatsLeft === 0)
              return { label: "Fully booked", color: "text-red-500" };
            return { label: "Available", color: "text-green-600" };
          };

          const { label, color } = getTripStatus();

          return (
            <div
              key={trip._id}
              onClick={(e) => {
                if (
                  !onSelectTrip &&
                  !e.target.closest("input") &&
                  !e.target.closest("button")
                ) {
                  window.location.href = `/trips/${trip._id}`;
                }
              }}
              className={`block border rounded-lg shadow transition-all bg-white overflow-hidden group relative hover:shadow-lg hover:border-green-500
    ${selectedTrip?._id === trip._id ? "border-blue-500 bg-blue-50" : ""}
    ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
            >
              <MiniRouteMap
                from={{
                  name: trip.from,
                  coordinates: trip.fromLocation.coordinates,
                }}
                to={{ name: trip.to, coordinates: trip.toLocation.coordinates }}
                pickup={{
                  name: trip.location.address,
                  coordinates: trip.location.coordinates,
                }}
              />

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    {trip.from} ➡ {trip.to}
                  </h2>
                  <div className="flex flex-col items-end">
                    <span
                      className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded"
                      title="Fare per seat"
                    >
                      ৳{trip.farePerSeat}
                    </span>
                    {!isExpired && (
                      <span className="text-xs text-gray-500 mt-1">
                        ⏳ {getTimeLeft(trip.date, trip.time)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap text-sm">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    {vehicleEmoji} {trip.vehicleType.toUpperCase()}
                  </span>
                  {isVerified && (
                    <span
                      className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
                      title="Driver identity verified"
                    >
                      ✅ Verified Driver
                    </span>
                  )}
                  {isUrgent && (
                    <span
                      className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full animate-pulse"
                      title="Trip is within next 24 hours"
                    >
                      🔥 Urgent
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {trip.date.slice(0, 10)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Time:</strong> {trip.time}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Seats:</strong> {seatsLeft} of {trip.totalSeats}{" "}
                  available
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Base Fare:</strong> ৳{trip.farePerSeat}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estimated Total (1 seat):</strong> ৳
                  {calculateTotal(trip.farePerSeat, 1)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong>{" "}
                  <span className={`font-medium ${color}`}>{label}</span>
                </p>

                {!user ? (
                  <span className="block mt-2 text-blue-500 text-sm font-medium">
                    🔒 Login to reserve a ride
                  </span>
                ) : onReserve ? (
                  seatsLeft > 0 && !isExpired && !isCancelled ? (
                    <>
                      <input
                        type="number"
                        min="1"
                        max={seatsLeft}
                        value={seatsForTrip}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleSeatChange(trip._id, parseInt(e.target.value))
                        }
                        className="border mt-2 px-2 py-1 w-full rounded text-sm"
                      />

                      <p className="text-sm text-gray-600">
                        <strong>
                          Estimated Total ({seatsForTrip} seat
                          {seatsForTrip > 1 ? "s" : ""}):
                        </strong>{" "}
                        ৳{calculateTotal(trip.farePerSeat, seatsForTrip)}
                      </p>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onReserve(trip, seatsForTrip);
                        }}
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium"
                      >
                        📩 Reserve {seatsForTrip} Seat
                        {seatsForTrip > 1 ? "s" : ""}
                      </button>
                    </>
                  ) : (
                    <span className="block mt-2 text-red-500 font-medium">
                      {isExpired ? "⏳ This trip has expired." : "Fully booked"}
                    </span>
                  )
                ) : onCancel && trip.reservationId ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmTrip(trip);
                    }}
                    className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium"
                  >
                    ❌ Cancel Reservation
                  </button>
                ) : null}

                {onSelectTrip && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectTrip(trip);
                    }}
                    className={`mt-2 w-full ${
                      selectedTrip?._id === trip._id
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    } py-2 rounded text-sm font-medium`}
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

      {confirmTrip && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">
              ❓ Confirm Cancellation
            </h2>
            <p className="mb-4">
              Are you sure you want to cancel your reservation from{" "}
              <strong>{confirmTrip.from}</strong> to{" "}
              <strong>{confirmTrip.to}</strong> on{" "}
              {dayjs(confirmTrip.date).format("YYYY-MM-DD")}? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmTrip(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                No
              </button>
              <button
                onClick={() => {
                  onCancel(confirmTrip);
                  setConfirmTrip(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RideResults;
