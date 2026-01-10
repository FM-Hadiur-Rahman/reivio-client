import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import LocationAutocomplete from "../components/LocationAutocomplete";
import MapboxAutocomplete from "../components/MapboxAutocomplete";
import MapboxRouteMap from "../components/MapboxRouteMap";

const EditTripForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    fromLocation: null,
    toLocation: null,
    location: null,
    date: "",
    time: "",
    totalSeats: 1,
    farePerSeat: 0,
    vehicleType: "car",
    vehicleModel: "",
    licensePlate: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const trip = res.data;
        setFormData({
          from: trip.from,
          to: trip.to,
          fromLocation: trip.fromLocation || null,
          toLocation: trip.toLocation || null,
          location: trip.location || null,
          date: trip.date,
          time: trip.time,
          totalSeats: trip.totalSeats,
          farePerSeat: trip.farePerSeat,
          vehicleType: trip.vehicleType,
          vehicleModel: trip.vehicleModel,
          licensePlate: trip.licensePlate,
          image: trip.image,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("❌ Trip not found");
          navigate("/dashboard/driver");
        } else {
          toast.error("❌ Failed to load trip data");
        }
        console.error(err);
      }
    };
    fetchTrip();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = dayjs();
    const tripDateTime = dayjs(`${formData.date} ${formData.time}`);

    if (tripDateTime.isBefore(now)) {
      return toast.error("❌ Trip date/time must be in the future");
    }

    try {
      setLoading(true);
      const form = new FormData();

      const pickup = formData.location?.coordinates?.length
        ? formData.location
        : formData.fromLocation;

      const finalFormData = {
        ...formData,
        location: pickup,
      };

      Object.entries(finalFormData).forEach(([key, value]) => {
        if (["fromLocation", "toLocation", "location"].includes(key) && value) {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
      });
      if (imageFile) form.append("image", imageFile);

      await axios.put(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ Trip updated successfully");
      navigate("/dashboard/driver");
    } catch (err) {
      console.error("❌ Update failed", err);
      toast.error(err.response?.data?.message || "❌ Failed to update trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">✏️ Edit Trip</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <LocationAutocomplete
          placeholder="From"
          showCurrent={true}
          onSelect={({ name, coordinates }) =>
            setFormData((prev) => ({
              ...prev,
              from: name,
              fromLocation: {
                type: "Point",
                coordinates,
                address: name,
              },
            }))
          }
        />

        <LocationAutocomplete
          placeholder="To"
          showCurrent={false}
          onSelect={({ name, coordinates }) =>
            setFormData((prev) => ({
              ...prev,
              to: name,
              toLocation: {
                type: "Point",
                coordinates,
                address: name,
              },
            }))
          }
        />

        <div>
          <h3 className="font-semibold text-gray-700 mb-1">
            📍 Optional: Pin Exact Pickup Point
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            Default pickup is your "From" location. Tap map to set exact pickup.
          </p>
          <MapboxAutocomplete
            fromLocation={formData.fromLocation}
            toLocation={formData.toLocation}
            initialCoordinates={formData.location?.coordinates}
            onSelectLocation={({ coordinates, address }) =>
              setFormData((prev) => ({
                ...prev,
                location: {
                  type: "Point",
                  coordinates,
                  address,
                },
              }))
            }
          />
        </div>

        <MapboxRouteMap
          fromLocation={formData.fromLocation}
          toLocation={formData.toLocation}
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          type="number"
          name="totalSeats"
          value={formData.totalSeats}
          onChange={handleChange}
          className="input"
          min={1}
          required
        />
        <input
          type="number"
          name="farePerSeat"
          value={formData.farePerSeat}
          onChange={handleChange}
          className="input"
          min={0}
          required
        />
        <select
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          className="input"
        >
          <option value="car">🚗 Car</option>
          <option value="bike">🏍️ Bike</option>
          <option value="microbus">🚐 Microbus</option>
        </select>
        <input
          type="text"
          name="vehicleModel"
          value={formData.vehicleModel}
          onChange={handleChange}
          placeholder="Vehicle Model"
          className="input"
        />
        <input
          type="text"
          name="licensePlate"
          value={formData.licensePlate}
          onChange={handleChange}
          placeholder="License Plate"
          className="input"
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Upload New Vehicle Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="input"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Current Vehicle"
              className="w-48 mt-2 rounded"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full text-lg ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "💾 Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditTripForm;
