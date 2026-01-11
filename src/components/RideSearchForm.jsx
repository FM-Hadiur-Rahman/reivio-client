import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LocationAutocomplete from "./LocationAutocomplete";
import { MapPin, CalendarDays, Ruler, RotateCcw, Search } from "lucide-react";

const RideSearchForm = ({ onResults }) => {
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [radius, setRadius] = useState("30000");

  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  useEffect(() => {
    if (!fromInput) detectCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fromInput.trim() === "") {
      setFromCoords(null);
      setIsUsingCurrentLocation(false);
    }
  }, [fromInput]);

  const detectCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];
        setFromCoords(coords);
        setIsUsingCurrentLocation(true);

        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${
              import.meta.env.VITE_MAPBOX_TOKEN
            }`
          );
          const data = await res.json();
          const place = data?.features?.[0]?.place_name || "Your Location";
          setFromInput(place);
        } catch (err) {
          console.error("❌ Reverse geocoding failed", err);
        }
      },
      (err) => {
        console.warn("📍 GPS error", err);
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const params = {
      date: tripDate,
      from: fromInput,
      to: toInput,
      radius,
    };

    if (Array.isArray(fromCoords) && fromCoords.length === 2) {
      params.fromLat = fromCoords[1];
      params.fromLng = fromCoords[0];
    }

    if (Array.isArray(toCoords) && toCoords.length === 2) {
      params.toLat = toCoords[1];
      params.toLng = toCoords[0];
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/trips`, {
        params,
      });

      const filtered = res.data.filter((trip) => {
        return (
          trip?.fromLocation?.coordinates?.length === 2 &&
          trip?.toLocation?.coordinates?.length === 2
        );
      });

      onResults(filtered);
    } catch (err) {
      console.error("❌ Error fetching trips:", err);
      onResults([]);
    }
  };

  const resetForm = () => {
    setFromInput("");
    setToInput("");
    setTripDate("");
    setRadius("30000");
    setFromCoords(null);
    setToCoords(null);
    setIsUsingCurrentLocation(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Premium card */}
      <form
        onSubmit={handleSearch}
        className="
          relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm
          p-5 sm:p-6
        "
      >
        {/* header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Find a Ride
              </h2>
              <p className="text-sm text-slate-500">
                Search verified drivers and safe routes.
              </p>
            </div>
          </div>
        </div>

        {/* fields */}
        <div className="space-y-4">
          {/* From */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">From</label>
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 focus-within:ring-2 focus-within:ring-teal-300/60 transition">
              <LocationAutocomplete
                placeholder="From (e.g. Sylhet)"
                showCurrent={true}
                value={fromInput}
                onSelect={({ name, coordinates }) => {
                  setFromInput(name);
                  setFromCoords(coordinates);
                  setIsUsingCurrentLocation(true);
                }}
                onChange={(e) => {
                  setFromInput(e.target.value);
                  setIsUsingCurrentLocation(false);
                }}
                onClear={() => {
                  setFromInput("");
                  setFromCoords(null);
                  setIsUsingCurrentLocation(false);
                }}
              />
            </div>

            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={isUsingCurrentLocation}
              className={`
                inline-flex items-center gap-2 text-sm font-semibold
                ${
                  isUsingCurrentLocation
                    ? "text-slate-400"
                    : "text-teal-700 hover:text-teal-800"
                }
              `}
            >
              <MapPin className="w-4 h-4" />
              {isUsingCurrentLocation
                ? "Using current location"
                : "Use current location"}
            </button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">To</label>
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 focus-within:ring-2 focus-within:ring-teal-300/60 transition">
              <LocationAutocomplete
                placeholder="To (e.g. Dhaka Airport)"
                value={toInput}
                onSelect={({ name, coordinates }) => {
                  setToInput(name);
                  setToCoords(coordinates);
                }}
              />
            </div>
          </div>

          {/* Date + Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="
                    w-full h-11 rounded-2xl bg-white ring-1 ring-slate-200/80
                    pl-10 pr-3 text-sm text-slate-800
                    outline-none focus:ring-2 focus:ring-teal-300/60
                  "
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                Search radius
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="
                    w-full h-11 rounded-2xl bg-white ring-1 ring-slate-200/80
                    pl-10 pr-3 text-sm text-slate-800
                    outline-none focus:ring-2 focus:ring-teal-300/60
                  "
                >
                  <option value="10000">📍 10 km</option>
                  <option value="20000">📍 20 km</option>
                  <option value="30000">📍 30 km (default)</option>
                  <option value="50000">📍 50 km</option>
                  <option value="100000">📍 100 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="submit"
              className="
                inline-flex w-full items-center justify-center gap-2
                rounded-2xl bg-teal-600 px-5 py-3
                text-sm font-semibold text-white shadow-sm
                hover:bg-teal-700 active:scale-[0.99] transition
              "
            >
              <Search className="w-4 h-4" />
              Search Rides
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="
                inline-flex w-full sm:w-auto items-center justify-center gap-2
                rounded-2xl bg-white px-5 py-3
                text-sm font-semibold text-slate-700
                ring-1 ring-slate-200/80 hover:bg-slate-50
                active:scale-[0.99] transition
              "
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* footer link */}
          <div className="pt-2 text-center">
            <p className="text-sm text-slate-500">
              Want an{" "}
              <Link
                to="/trip-search"
                className="text-teal-700 font-semibold hover:text-teal-800 underline underline-offset-4"
              >
                Advanced Search
              </Link>
              ?
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RideSearchForm;
