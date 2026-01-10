// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { initiateTripPayment } from "../utils/initiateTripPayment";

// const TripDetailPage = () => {
//   const { id } = useParams();
//   const [trip, setTrip] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [seatsToReserve, setSeatsToReserve] = useState(1);
//   const [hasReserved, setHasReserved] = useState(false);
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_API_URL}/api/trips/${id}`)
//       .then((res) => {
//         setTrip(res.data);
//         const alreadyReserved = res.data.passengers?.some(
//           (p) =>
//             (p.user === user?._id || p.user?._id === user?._id) &&
//             p.status !== "cancelled"
//         );
//         setHasReserved(alreadyReserved);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Failed to load trip", err);
//         setLoading(false);
//       });
//   }, [id, user?._id]);

//   const handleReserve = async (trip, seatCount = 1) => {
//     const token = localStorage.getItem("token");
//     if (!token) return toast.error("You must be logged in to reserve a ride");

//     try {
//       const paymentUrl = await initiateTripPayment({
//         tripId: trip._id,
//         seats: seatCount,
//         token,
//       });

//       if (paymentUrl) {
//         toast.success("✅ Redirecting to payment...");
//         window.location.href = paymentUrl;
//       } else {
//         toast.error("Payment initiation failed");
//       }
//     } catch (err) {
//       console.error("❌ Payment initiation error:", err);
//       toast.error(err?.response?.data?.message || "Failed to initiate payment");
//     }
//   };

//   const handleCancel = async () => {
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/trips/${trip._id}/cancel`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("❌ Reservation canceled");
//       setTrip(res.data.trip);
//       setHasReserved(false);
//     } catch (err) {
//       console.error("❌ Cancel failed:", err);
//       toast.error(err.response?.data?.message || "Cancel failed");
//     }
//   };

//   if (loading)
//     return <p className="text-center mt-10">Loading trip details...</p>;
//   if (!trip)
//     return <p className="text-center mt-10 text-red-600">Trip not found.</p>;
//   let reservedSeats = 0;
//   let availableSeats = 0;

//   if (trip?.passengers && Array.isArray(trip.passengers)) {
//     reservedSeats = trip.passengers
//       .filter((p) => p.status !== "cancelled")
//       .reduce((sum, p) => sum + (Number(p.seats) > 0 ? Number(p.seats) : 1), 0);
//     availableSeats = Math.max((trip.totalSeats || 0) - reservedSeats, 0);
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <div className="bg-white shadow-lg rounded-lg p-6">
//         {/* Title */}
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold text-gray-800">
//             🚗 Trip from {trip.from} to {trip.to}
//           </h1>
//           <span
//             className={`text-sm px-2 py-1 rounded ${
//               trip.status === "cancelled"
//                 ? "bg-red-100 text-red-700"
//                 : availableSeats === 0
//                 ? "bg-red-100 text-red-700"
//                 : "bg-green-100 text-green-800"
//             }`}
//           >
//             {trip.status === "cancelled"
//               ? "Cancelled"
//               : availableSeats === 0
//               ? "Fully booked"
//               : "Available"}
//           </span>
//         </div>

//         {/* Date & Time */}
//         <div className="mb-4 text-gray-600">
//           <p>
//             <strong>Date:</strong> {trip.date}
//           </p>
//           <p>
//             <strong>Time:</strong> {trip.time}
//           </p>
//         </div>

//         {/* Fare & Vehicle */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//           <div>
//             <p>
//               <strong>Fare per seat:</strong> ৳{trip.farePerSeat}
//             </p>
//             <p>
//               <strong>Seats Available:</strong> {availableSeats} of{" "}
//               {trip.totalSeats}
//             </p>
//           </div>
//           <div>
//             <p>
//               <strong>Vehicle Type:</strong> {trip.vehicleType}
//             </p>
//             <p>
//               <strong>Model:</strong> {trip.vehicleModel || "N/A"}
//             </p>
//             <p>
//               <strong>License Plate:</strong> {trip.licensePlate || "N/A"}
//             </p>
//           </div>
//         </div>

//         {/* Image */}
//         {trip.image && (
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold mb-2 text-gray-700">
//               🖼 Vehicle Image
//             </h3>
//             <img
//               src={trip.image}
//               alt="Vehicle"
//               className="w-full max-w-md rounded border shadow"
//             />
//           </div>
//         )}

//         {/* Location Map */}
//         {trip.location?.coordinates && (
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold mb-2 text-gray-700">
//               📍 Pickup Location
//             </h3>
//             <iframe
//               title="Trip Map"
//               width="100%"
//               height="300"
//               loading="lazy"
//               className="rounded border"
//               src={`https://maps.google.com/maps?q=${trip.location.coordinates[1]},${trip.location.coordinates[0]}&z=14&output=embed`}
//             ></iframe>
//             <p className="text-sm mt-2 text-gray-500">
//               {trip.location.address}
//             </p>
//           </div>
//         )}

//         {/* Driver Info */}
//         {trip.driverId && typeof trip.driverId === "object" && (
//           <div className="flex items-center gap-4 py-4 border-t">
//             <img
//               src={trip.driverId.avatar || "/default-avatar.png"}
//               alt="Driver"
//               className="w-16 h-16 rounded-full object-cover border"
//             />
//             <div>
//               <p className="font-semibold text-gray-800">
//                 {trip.driverId.name}
//               </p>
//               <p className="text-sm text-gray-600">
//                 📞 {trip.driverId.phone || "Not available"}
//               </p>
//               <div className="flex gap-2 mt-2">
//                 {trip.driverId.phone && (
//                   <a
//                     href={`tel:${trip.driverId.phone}`}
//                     className="text-blue-600 underline text-sm"
//                   >
//                     Call Driver
//                   </a>
//                 )}
//                 <button
//                   onClick={() =>
//                     navigate(
//                       `/chat?receiver=${trip.driverId._id}&tripId=${trip._id}`
//                     )
//                   }
//                   className="text-green-600 underline text-sm"
//                 >
//                   Message Driver
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Reserve Button */}
//         {user?._id !== trip.driverId?._id && (
//           <div className="space-y-4">
//             {hasReserved ? (
//               <button
//                 onClick={handleCancel}
//                 className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
//               >
//                 ❌ Cancel Reservation
//               </button>
//             ) : (
//               <>
//                 <label className="block text-sm font-medium">
//                   Seats to Reserve:
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max={availableSeats}
//                   value={seatsToReserve}
//                   disabled={availableSeats === 0}
//                   onChange={(e) => setSeatsToReserve(parseInt(e.target.value))}
//                   className="border px-3 py-2 rounded w-full"
//                 />
//                 {availableSeats === 0 && (
//                   <p className="text-red-500 font-semibold text-sm">
//                     🚫 This trip is fully booked.
//                   </p>
//                 )}

//                 <button
//                   onClick={() => handleReserve(trip, seatsToReserve)}
//                   disabled={availableSeats === 0}
//                   className={`w-full py-2 rounded text-white ${
//                     availableSeats === 0
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-green-600 hover:bg-green-700"
//                   }`}
//                 >
//                   🚀 Reserve {seatsToReserve} Seat
//                   {seatsToReserve > 1 ? "s" : ""}
//                 </button>
//               </>
//             )}
//           </div>
//         )}

//         {/* Reviews (placeholder) */}
//         <div className="mt-10 border-t pt-6">
//           <h3 className="text-lg font-semibold mb-2 text-gray-700">
//             ⭐ Trip Reviews
//           </h3>
//           <p className="text-sm text-gray-500 italic">
//             No reviews yet. Be the first to leave one after your ride.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TripDetailPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { initiateTripPayment } from "../utils/initiateTripPayment";
import dayjs from "dayjs";
import getTimeLeft from "../utils/getTimeLeft";
import MiniRouteMap from "../components/MiniRouteMap";

const TripDetailPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsToReserve, setSeatsToReserve] = useState(1);
  const [hasReserved, setHasReserved] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/trips/${id}`)
      .then((res) => {
        setTrip(res.data);
        const alreadyReserved = res.data.passengers?.some(
          (p) =>
            (p.user === user?._id || p.user?._id === user?._id) &&
            p.status !== "cancelled"
        );
        setHasReserved(alreadyReserved);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load trip", err);
        setLoading(false);
      });
  }, [id, user?._id]);

  const handleReserve = async (trip, seatCount = 1) => {
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

  const handleCancel = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/trips/${trip._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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
    return <p className="text-center mt-10">Loading trip details...</p>;
  if (!trip)
    return <p className="text-center mt-10 text-red-600">Trip not found.</p>;

  const subtotal = trip.farePerSeat * seatsToReserve;
  const serviceFee = Math.round(subtotal * 0.1); // 10%
  const vat = Math.round(serviceFee * 0.15); // ✅ 15% VAT on the service fee
  const total = subtotal + serviceFee; // ✅ Guest pays only subtotal + platform fee

  const reservedSeats =
    trip.passengers
      ?.filter((p) => p.status !== "cancelled")
      .reduce(
        (sum, p) => sum + (Number(p.seats) > 0 ? Number(p.seats) : 1),
        0
      ) || 0;
  const availableSeats = Math.max((trip.totalSeats || 0) - reservedSeats, 0);
  const isCancelled = trip.status === "cancelled";
  const isExpired = dayjs(`${trip.date} ${trip.time}`).isBefore(dayjs());

  const getTripStatus = () => {
    if (isCancelled)
      return { label: "Cancelled", color: "bg-red-100 text-red-700" };
    if (isExpired)
      return { label: "Expired", color: "bg-gray-200 text-gray-600" };
    if (availableSeats === 0)
      return { label: "Fully booked", color: "bg-red-100 text-red-700" };
    return { label: "Available", color: "bg-green-100 text-green-800" };
  };

  const { label, color } = getTripStatus();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* Title & Status */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🚗 Trip from {trip.from} to {trip.to}
          </h1>
          <div className="flex flex-col items-end">
            <span className={`text-sm px-2 py-1 rounded ${color}`}>
              {label}
            </span>
            {!isExpired && (
              <span className="text-xs text-gray-500 mt-1">
                ⏳ {getTimeLeft(trip.date, trip.time)}
              </span>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="mb-4 text-gray-600">
          <p>
            <strong>Date:</strong> {trip.date}
          </p>
          <p>
            <strong>Time:</strong> {trip.time}
          </p>
        </div>

        {/* Fare & Vehicle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p>
              <strong>Fare per seat:</strong> ৳{trip.farePerSeat}
            </p>
            <p>
              <strong>Seats Available:</strong> {availableSeats} of{" "}
              {trip.totalSeats}
            </p>
          </div>
          <div>
            <p>
              <strong>Vehicle Type:</strong> {trip.vehicleType}
            </p>
            <p>
              <strong>Model:</strong> {trip.vehicleModel || "N/A"}
            </p>
            <p>
              <strong>License Plate:</strong> {trip.licensePlate || "N/A"}
            </p>
          </div>
        </div>

        {/* Image */}
        {trip.image && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              🖼 Vehicle Image
            </h3>
            <img
              src={trip.image}
              alt="Vehicle"
              className="w-full max-w-md rounded border shadow"
            />
          </div>
        )}

        {/* Location Map */}
        {trip.fromLocation?.coordinates && trip.toLocation?.coordinates && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              🗺️ Trip Route
            </h3>
            <MiniRouteMap
              from={{
                coordinates: trip.fromLocation.coordinates,
                name: trip.fromLocation.address,
              }}
              to={{
                coordinates: trip.toLocation.coordinates,
                name: trip.toLocation.address,
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
              <p className="text-sm mt-2 text-gray-500">
                📍 Pickup: {trip.location.address}
              </p>
            )}
          </div>
        )}

        {/* Driver Info */}
        {trip.driverId && typeof trip.driverId === "object" && (
          <div className="flex items-center gap-4 py-4 border-t">
            <img
              src={trip.driverId.avatar || "/default-avatar.png"}
              alt="Driver"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <p className="font-semibold text-gray-800">
                {trip.driverId.name}
              </p>
              <p className="text-sm text-gray-600">
                📞 {trip.driverId.phone || "Not available"}
              </p>
              <div className="flex gap-2 mt-2">
                {trip.driverId.phone && (
                  <a
                    href={`tel:${trip.driverId.phone}`}
                    className="text-blue-600 underline text-sm"
                  >
                    Call Driver
                  </a>
                )}
                <button
                  onClick={() =>
                    navigate(
                      `/chat?receiver=${trip.driverId._id}&tripId=${trip._id}`
                    )
                  }
                  className="text-green-600 underline text-sm"
                >
                  Message Driver
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Section */}
        {user?._id !== trip.driverId?._id && (
          <div className="space-y-4">
            {hasReserved ? (
              <button
                onClick={handleCancel}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
              >
                ❌ Cancel Reservation
              </button>
            ) : (
              <>
                <label className="block text-sm font-medium">
                  Seats to Reserve:
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableSeats}
                  value={seatsToReserve}
                  disabled={availableSeats === 0 || isExpired || isCancelled}
                  onChange={(e) => setSeatsToReserve(parseInt(e.target.value))}
                  className="border px-3 py-2 rounded w-full"
                />
                {(availableSeats === 0 || isExpired) && (
                  <p className="text-red-500 font-semibold text-sm">
                    {isExpired
                      ? "⏳ This trip has already departed."
                      : "🚫 This trip is fully booked."}
                  </p>
                )}
                <div className="bg-gray-50 border rounded p-4 text-sm space-y-1">
                  <p>
                    <strong>Subtotal:</strong> ৳{subtotal}
                  </p>
                  <p>
                    <strong>Service Fee (10%):</strong> ৳{serviceFee}
                  </p>
                  <p className="text-gray-500 text-xs">
                    VAT (15%) is paid by BanglaBnB, not added to your total.
                  </p>
                  <hr />
                  <p className="text-lg font-semibold text-green-700">
                    Total to Pay: ৳{total}
                  </p>
                </div>

                <button
                  onClick={() => handleReserve(trip, seatsToReserve)}
                  disabled={availableSeats === 0 || isExpired || isCancelled}
                  className={`w-full py-2 rounded text-white ${
                    availableSeats === 0 || isExpired || isCancelled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  🚀 Reserve {seatsToReserve} Seat
                  {seatsToReserve > 1 ? "s" : ""}
                </button>
              </>
            )}
          </div>
        )}

        {/* Reviews Placeholder */}
        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            ⭐ Trip Reviews
          </h3>
          <p className="text-sm text-gray-500 italic">
            No reviews yet. Be the first to leave one after your ride.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
