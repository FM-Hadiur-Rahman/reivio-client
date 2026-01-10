import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import MapboxAutocomplete from "../components/MapboxAutocomplete";
import LocationAutocomplete from "../components/LocationAutocomplete";
import MapboxRouteMap from "../components/MapboxRouteMap";
import { fetchSuggestions } from "../utils/mapboxUtils";

const DriverTripForm = () => {
  const [form, setForm] = useState({
    from: "",
    to: "",
    fromLocation: null,
    toLocation: null,
    date: "",
    time: "",
    vehicleType: "car",
    vehicleModel: "",
    licensePlate: "",
    totalSeats: 1,
    farePerSeat: 0,
    image: null,
    location: {
      coordinates: [],
      address: "",
    },
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const autoDetectLocation = async () => {
      try {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          const res = await fetchSuggestions(coords.join(","), true);
          const place = res?.[0];
          if (place) {
            setForm((prev) => ({
              ...prev,
              from: place.place_name,
              fromLocation: {
                type: "Point",
                coordinates: place.center,
                address: place.place_name,
              },
            }));
          }
        });
      } catch (err) {
        console.error("❌ Auto-GPS failed:", err);
      }
    };

    if (!form.fromLocation) autoDetectLocation();
  }, []);
  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      let file = files[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        try {
          const compressedFile = await imageCompression(file, {
            fileType: "image/jpeg",
            maxWidthOrHeight: 1024,
            maxSizeMB: 1,
          });

          file = new File([compressedFile], "converted.jpg", {
            type: "image/jpeg",
          });

          setMessage("⚠️ Unsupported image converted to JPG.");
        } catch (err) {
          console.error("❌ Image conversion failed:", err);
          setMessage("❌ Unsupported image type. Use JPG or PNG.");
          return;
        }
      }

      setForm((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();

    // ✅ Ensure fallback: location = form.location || form.fromLocation
    const pickup =
      form.location?.coordinates?.length > 0
        ? form.location
        : form.fromLocation;

    formData.append("location", JSON.stringify(pickup));
    formData.append("fromLocation", JSON.stringify(form.fromLocation));
    formData.append("toLocation", JSON.stringify(form.toLocation));

    Object.entries(form).forEach(([key, value]) => {
      if (["location", "fromLocation", "toLocation"].includes(key)) return;
      formData.append(key, value);
    });

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/trips`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ Trip created!");
      navigate("/dashboard/driver");
    } catch (err) {
      console.error("❌ Trip creation failed", err);
      setMessage("❌ Something went wrong.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        🚗 Publish a Trip
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            🧭 Trip Information
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <LocationAutocomplete
                placeholder="From (e.g. Sylhet)"
                value={form.from}
                showCurrent={true}
                onClear={() =>
                  setForm((prev) => ({
                    ...prev,
                    from: "",
                    fromLocation: null,
                  }))
                }
                onSelect={({ name, coordinates }) => {
                  setForm((prev) => ({
                    ...prev,
                    from: name,
                    fromLocation: {
                      type: "Point",
                      coordinates,
                      address: name,
                    },
                  }));
                }}
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    const coords = [pos.coords.longitude, pos.coords.latitude];
                    const res = await fetchSuggestions(coords.join(","), true);
                    const place = res?.[0];
                    if (place) {
                      setForm((prev) => ({
                        ...prev,
                        from: place.place_name,
                        fromLocation: {
                          type: "Point",
                          coordinates: place.center,
                          address: place.place_name,
                        },
                      }));
                    }
                  });
                } catch (err) {
                  console.error("❌ GPS detect failed:", err);
                }
              }}
              className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
            >
              📍 Use GPS
            </button>
          </div>

          {/* To field below */}
          <div className="mt-3 relative">
            <LocationAutocomplete
              placeholder="To (e.g. Dhaka Airport)"
              value={form.to}
              showCurrent={false}
              onClear={() =>
                setForm((prev) => ({
                  ...prev,
                  to: "",
                  toLocation: null,
                }))
              }
              onSelect={({ name, coordinates }) => {
                setForm((prev) => ({
                  ...prev,
                  to: name,
                  toLocation: {
                    type: "Point",
                    coordinates,
                    address: name,
                  },
                }));
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            🗺️ Trip Route on Map
          </h3>
          <MapboxRouteMap
            fromLocation={form.fromLocation}
            toLocation={form.toLocation}
            onSetFrom={(val) =>
              setForm((prev) => ({ ...prev, fromLocation: val }))
            }
            onSetTo={(val) => setForm((prev) => ({ ...prev, toLocation: val }))}
            onSetFromText={(placeName) =>
              setForm((prev) => ({ ...prev, from: placeName }))
            }
            onSetToText={(placeName) =>
              setForm((prev) => ({ ...prev, to: placeName }))
            }
            onSetPickup={(loc) =>
              setForm((prev) => ({ ...prev, location: loc }))
            }
          />
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            📍 Optional: Pin Exact Pickup Point
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            By default, your pickup point will be based on the "From" location.
            You can tap the map to manually set a more accurate pickup spot.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📅 Trip Date
          </label>
          <input
            type="date"
            name="date"
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🕒 Trip Time
          </label>
          <input
            type="time"
            name="time"
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded w-full"
          />
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            🚘 Vehicle Type
          </h3>
          <div className="flex gap-4">
            {["car", "bike"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, vehicleType: type })}
                className={`flex-1 px-4 py-2 rounded border flex items-center justify-center gap-2 ${
                  form.vehicleType === type
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {type === "car" ? "🚗" : "🏍️"}{" "}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            🚙 Vehicle Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="vehicleModel"
              placeholder="Vehicle Model (e.g. Toyota Axio)"
              onChange={handleChange}
              className="border px-4 py-2 rounded w-full"
            />
            <input
              name="licensePlate"
              placeholder="License Plate"
              onChange={handleChange}
              className="border px-4 py-2 rounded w-full"
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            💸 Fare & Total Seats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              name="totalSeats"
              min="1"
              placeholder="Total Seats"
              onChange={handleChange}
              required
              className="border px-4 py-2 rounded w-full"
            />
            <input
              type="number"
              name="farePerSeat"
              placeholder="Fare per seat (৳)"
              onChange={handleChange}
              required
              className="border px-4 py-2 rounded w-full"
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            🖼 Vehicle Image (optional)
          </h3>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-sm text-gray-600"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-3 w-48 h-32 object-cover rounded border"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-medium text-lg"
        >
          🚀 Publish Trip
        </button>

        {message && (
          <p className="text-center text-red-600 mt-2 font-medium">{message}</p>
        )}
      </form>
    </div>
  );
};

export default DriverTripForm;
