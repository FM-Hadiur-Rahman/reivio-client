// TripSearchPage.jsx (Premium + Production-ready Map: persistent map instance, markers refresh, bounds fit, empty state)
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import RideResults from "../components/RideResults";
import mapboxgl from "mapbox-gl";
import { toast } from "react-toastify";
import { initiateTripPayment } from "../utils/initiateTripPayment";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const TripSearchPage = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchParams] = useSearchParams(); // kept (you may use later for from/to/date)
  const navigate = useNavigate();

  const [vehicleType, setVehicleType] = useState(
    localStorage.getItem("vehicleType") || "",
  );
  const [minPrice, setMinPrice] = useState(
    localStorage.getItem("minPrice") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    localStorage.getItem("maxPrice") || "",
  );
  const [sortOption, setSortOption] = useState(
    localStorage.getItem("sortOption") || "date",
  );

  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch trips once
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/trips`,
        );
        setTrips(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Failed to fetch trips", err);
      }
    };
    fetchTrips();
  }, []);

  // Apply filters + sort
  useEffect(() => {
    let results = [...trips];

    if (vehicleType)
      results = results.filter((trip) => trip.vehicleType === vehicleType);

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!Number.isNaN(min))
        results = results.filter((trip) => trip.farePerSeat >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!Number.isNaN(max))
        results = results.filter((trip) => trip.farePerSeat <= max);
    }

    if (sortOption === "price") {
      results.sort((a, b) => (a.farePerSeat || 0) - (b.farePerSeat || 0));
    } else {
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredTrips(results);
    setCurrentPage(1);
  }, [trips, vehicleType, minPrice, maxPrice, sortOption]);

  // Pagination
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrips.slice(start, start + itemsPerPage);
  }, [filteredTrips, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));
  }, [filteredTrips.length]);

  // Create + update map when showMap/filteredTrips change
  useEffect(() => {
    if (!showMap || !mapRef.current) return;

    // Create map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [90.4125, 23.8103],
        zoom: 6,
      });
      mapInstanceRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "top-right",
      );
    }

    const map = mapInstanceRef.current;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasAny = false;

    filteredTrips.forEach((trip) => {
      const c = trip.location?.coordinates;
      if (Array.isArray(c) && c.length === 2) {
        hasAny = true;
        bounds.extend(c);

        // Custom teal marker element (click => open trip)
        const el = document.createElement("div");
        el.style.width = "18px";
        el.style.height = "18px";
        el.style.borderRadius = "999px";
        el.style.background = "#0f766e"; // teal-700
        el.style.boxShadow = "0 10px 25px rgba(0,0,0,.18)";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        el.addEventListener("click", () => navigate(`/trips/${trip._id}`));

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(c)
          .setPopup(
            new mapboxgl.Popup({ offset: 20 }).setText(
              `${trip.from} → ${trip.to}`,
            ),
          )
          .addTo(map);

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to markers
    if (hasAny) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 700 });
    }
  }, [showMap, filteredTrips, navigate]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Reserve + pay
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

  // Cancel reservation
  const handleCancel = async (trip) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in to cancel a ride");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/trips/${trip._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("❌ Reservation canceled successfully!");
      setTrips((prev) =>
        prev.map((t) => (t._id === trip._id ? res.data.trip : t)),
      );
    } catch (err) {
      console.error("❌ Ride cancellation failed", err);
      toast.error(
        err?.response?.data?.message || "Failed to cancel reservation",
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
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Premium background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* FILTERS */}
        <aside className="md:col-span-1">
          <div className="sticky top-24 rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-sky-500 text-white shadow-sm">
                  🔎
                </span>
                Filters
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Narrow down rides by type, price and sort.
              </p>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Vehicle type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => {
                    setVehicleType(e.target.value);
                    localStorage.setItem("vehicleType", e.target.value);
                  }}
                  className="w-full h-11 rounded-2xl bg-white ring-1 ring-slate-200/80 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-300/60"
                >
                  <option value="">All Vehicle Types</option>
                  <option value="car">🚗 Car</option>
                  <option value="bike">🏍️ Bike</option>
                </select>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  Price range
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500">Min</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        localStorage.setItem("minPrice", e.target.value);
                      }}
                      className="w-full h-11 rounded-2xl bg-white ring-1 ring-slate-200/80 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-300/60 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500">Max</span>
                    <input
                      type="number"
                      placeholder="Any"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        localStorage.setItem("maxPrice", e.target.value);
                      }}
                      className="w-full h-11 rounded-2xl bg-white ring-1 ring-slate-200/80 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-300/60 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Sort
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    localStorage.setItem("sortOption", e.target.value);
                  }}
                  className="w-full h-11 rounded-2xl bg-white ring-1 ring-slate-200/80 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-300/60"
                >
                  <option value="date">Sort by Date</option>
                  <option value="price">Sort by Price</option>
                </select>
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="w-full rounded-2xl bg-white ring-1 ring-slate-200/80 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition"
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>
        </aside>

        {/* RESULTS */}
        <main className="md:col-span-3 space-y-4">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-sm">
                  🚗
                </span>
                Ride Results
                <span className="ml-2 inline-flex items-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-200 px-2.5 py-1 text-xs font-semibold">
                  {filteredTrips.length}
                </span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Showing {filteredTrips.length} ride(s)
              </p>
            </div>

            {/* Teal segmented toggle */}
            <div className="relative inline-flex items-center rounded-full bg-white ring-1 ring-slate-200/80 shadow-sm p-1">
              <div
                className={`
                  absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-teal-600
                  transition-transform duration-300 ease-out
                  ${showMap ? "translate-x-full" : "translate-x-0"}
                `}
              />

              <button
                type="button"
                onClick={() => setShowMap(false)}
                className={`relative z-10 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  !showMap ? "text-white" : "text-slate-700 hover:text-teal-700"
                }`}
              >
                📄 List
              </button>

              <button
                type="button"
                onClick={() => setShowMap(true)}
                className={`relative z-10 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  showMap ? "text-white" : "text-slate-700 hover:text-teal-700"
                }`}
              >
                🗺️ Map
              </button>
            </div>
          </div>

          {/* Content */}
          {showMap ? (
            <div className="rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Route preview
                </p>
                <span className="text-xs text-slate-500">
                  Tap marker for details
                </span>
              </div>
              <div ref={mapRef} className="w-full h-96" />
            </div>
          ) : paginatedTrips.length === 0 ? (
            <div className="rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center">
                🔍
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No rides match your filters
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Try changing vehicle type, price range, or sorting.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 rounded-2xl bg-teal-600 px-5 py-2.5 text-white font-semibold hover:bg-teal-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <RideResults
              trips={paginatedTrips}
              onReserve={handleReserve}
              onCancel={handleCancel}
            />
          )}

          {/* Pagination */}
          {!showMap && filteredTrips.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-full px-4 py-2 text-sm font-semibold bg-white text-teal-700 ring-1 ring-teal-200 shadow-sm hover:bg-teal-50 active:scale-[0.99] disabled:opacity-50 disabled:ring-slate-200 disabled:text-slate-500 disabled:hover:bg-white transition"
              >
                ◀ Previous
              </button>

              <span className="text-sm text-slate-600">
                Page{" "}
                <span className="font-semibold text-slate-900">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {totalPages}
                </span>
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-full px-4 py-2 text-sm font-semibold bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 transition"
              >
                Next ▶
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TripSearchPage;
