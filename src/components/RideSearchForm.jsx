import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LocationAutocomplete from "./LocationAutocomplete";
import { useEffect } from "react";
const RideSearchForm = ({ onResults }) => {
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [radius, setRadius] = useState("30000"); // Default: 30km

  const [fromCoords, setFromCoords] = useState(null); // [lng, lat]
  const [toCoords, setToCoords] = useState(null); // [lng, lat]
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  useEffect(() => {
    if (!fromInput) detectCurrentLocation();
  }, []);

  useEffect(() => {
    if (fromInput.trim() === "") {
      setFromCoords(null);
      setIsUsingCurrentLocation(false); // ✅ Reset flag
    }
  }, [fromInput]);

  const detectCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];
        setFromCoords(coords);
        setIsUsingCurrentLocation(true); // ✅ Set flag

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
      params.fromLat = fromCoords[1]; // lat
      params.fromLng = fromCoords[0]; // lng
    }

    if (Array.isArray(toCoords) && toCoords.length === 2) {
      params.toLat = toCoords[1]; // lat
      params.toLng = toCoords[0]; // lng
    }

    console.log("🔍 Sending search params:", params);

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
  };

  return (
    <form
      onSubmit={handleSearch}
      className="space-y-4 bg-white p-4 rounded shadow max-w-md mx-auto"
    >
      <div className="space-y-1">
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
            setIsUsingCurrentLocation(false); // ✅ Manual typing = not current location
          }}
          onClear={() => {
            setFromInput("");
            setFromCoords(null);
            setIsUsingCurrentLocation(false); // ✅ Also clear GPS flag on ❌ click
          }}
        />
        <button
          type="button"
          onClick={detectCurrentLocation}
          disabled={isUsingCurrentLocation}
          className="text-sm text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUsingCurrentLocation
            ? "✅ Using Current Location"
            : "📍 Use Current Location"}
        </button>
      </div>

      <LocationAutocomplete
        placeholder="To (e.g. Dhaka Airport)"
        value={toInput}
        onSelect={({ name, coordinates }) => {
          setToInput(name);
          setToCoords(coordinates);
        }}
      />

      <input
        type="date"
        value={tripDate}
        onChange={(e) => setTripDate(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <select
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="10000">📍 10 km</option>
        <option value="20000">📍 20 km</option>
        <option value="30000">📍 30 km (default)</option>
        <option value="50000">📍 50 km</option>
        <option value="100000">📍 100 km</option>
      </select>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded"
        >
          🔍 Search Rides
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 rounded"
        >
          🔄 Reset
        </button>
      </div>

      <p className="text-sm text-center text-gray-500">
        Want to do an{" "}
        <Link to="/trip-search" className="text-blue-600 underline">
          Advanced Search
        </Link>
        ?
      </p>
    </form>
  );
};

export default RideSearchForm;
