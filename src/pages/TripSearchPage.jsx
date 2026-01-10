// TripSearchPage.jsx (Updated with Seat Selection + Ride Reservation)
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import RideResults from "../components/RideResults";
import mapboxgl from "mapbox-gl";
import { toast } from "react-toastify";
import { initiateTripPayment } from "../utils/initiateTripPayment";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const TripSearchPage = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchParams] = useSearchParams();
  const [vehicleType, setVehicleType] = useState(
    localStorage.getItem("vehicleType") || ""
  );
  const [minPrice, setMinPrice] = useState(
    localStorage.getItem("minPrice") || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    localStorage.getItem("maxPrice") || ""
  );
  const [sortOption, setSortOption] = useState(
    localStorage.getItem("sortOption") || "date"
  );
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/trips`
        );
        setTrips(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch trips", err);
      }
    };
    fetchTrips();
  }, []);

  useEffect(() => {
    let results = [...trips];
    if (vehicleType)
      results = results.filter((trip) => trip.vehicleType === vehicleType);
    if (minPrice)
      results = results.filter(
        (trip) => trip.farePerSeat >= parseFloat(minPrice)
      );
    if (maxPrice)
      results = results.filter(
        (trip) => trip.farePerSeat <= parseFloat(maxPrice)
      );
    if (sortOption === "price")
      results.sort((a, b) => a.farePerSeat - b.farePerSeat);
    else results.sort((a, b) => new Date(a.date) - new Date(b.date));

    setFilteredTrips(results);
    setCurrentPage(1);
  }, [trips, vehicleType, minPrice, maxPrice, sortOption]);

  useEffect(() => {
    if (!showMap || !mapRef.current || !filteredTrips.length) return;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [90.4125, 23.8103],
      zoom: 6,
    });
    filteredTrips.forEach((trip) => {
      if (trip.location?.coordinates?.length === 2) {
        new mapboxgl.Marker()
          .setLngLat(trip.location.coordinates)
          .setPopup(new mapboxgl.Popup().setText(`${trip.from} → ${trip.to}`))
          .addTo(map);
      }
    });
    return () => map.remove();
  }, [showMap, filteredTrips]);

  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReserve = async (trip, seatCount) => {
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

  const handleCancel = async (trip) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in to cancel a ride");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/trips/${trip._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("❌ Reservation canceled successfully!");
      setTrips((prev) =>
        prev.map((t) => (t._id === trip._id ? res.data.trip : t))
      );
    } catch (err) {
      console.error("❌ Ride cancellation failed", err);
      toast.error(
        err?.response?.data?.message || "Failed to cancel reservation"
      );
    }
  };

  const resetFilters = () => {
    setVehicleType("");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("date");
    localStorage.removeItem("vehicleType");
    localStorage.removeItem("minPrice");
    localStorage.removeItem("maxPrice");
    localStorage.setItem("sortOption", "date");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">🔎 Filters</h2>
          <select
            value={vehicleType}
            onChange={(e) => {
              setVehicleType(e.target.value);
              localStorage.setItem("vehicleType", e.target.value);
            }}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">All Vehicle Types</option>
            <option value="car">🚗 Car</option>
            <option value="bike">🏍️ Bike</option>
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              localStorage.setItem("minPrice", e.target.value);
            }}
            className="w-full border rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              localStorage.setItem("maxPrice", e.target.value);
            }}
            className="w-full border rounded px-2 py-1"
          />
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              localStorage.setItem("sortOption", e.target.value);
            }}
            className="w-full border rounded px-2 py-1"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
          </select>
          <button
            onClick={resetFilters}
            className="w-full bg-gray-100 hover:bg-gray-200 text-sm py-2 rounded"
          >
            🔄 Reset Filters
          </button>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">🚗 Ride Results</h2>
            <button
              onClick={() => setShowMap(!showMap)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
            >
              {showMap ? "📄 List View" : "🗺️ Map View"}
            </button>
          </div>

          {showMap ? (
            <div ref={mapRef} className="w-full h-96 border rounded" />
          ) : (
            <RideResults
              trips={paginatedTrips}
              onReserve={handleReserve}
              onCancel={handleCancel}
            />
          )}

          {!showMap && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                ◀ Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of{" "}
                {Math.ceil(filteredTrips.length / itemsPerPage)}
              </span>
              <button
                disabled={currentPage * itemsPerPage >= filteredTrips.length}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripSearchPage;
