import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import MapboxAutocomplete from "./MapboxAutocomplete";
import LocationSelector from "./LocationSelector";
import { useEffect } from "react";

const SignupFormStep1 = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && localStorage.getItem("token")) {
      navigate("/"); // or "/dashboard"
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    division: "",
    district: "",
    location: {
      coordinates: [],
      address: "",
    },
    licenseNumber: "",
    vehicleType: "",
    seats: "",
    agreedToTerms: false,
  });

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      setFormData((prev) => ({ ...prev, referralCode: ref.toUpperCase() }));
    }
  }, []);

  const extractAdminFromMapbox = async (lon, lat) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,region&access_token=${
          import.meta.env.VITE_MAPBOX_TOKEN
        }`
      );
      const data = await res.json();
      const features = data.features || [];

      const district = features.find((f) => f.place_type.includes("place"));
      const division = features.find((f) => f.place_type.includes("region"));

      setFormData((prev) => ({
        ...prev,
        division: division?.text || "",
      }));
    } catch (err) {
      console.warn("❌ Reverse geocoding failed", err);
    }
  };

  const handleAutoDetect = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${
          import.meta.env.VITE_MAPBOX_TOKEN
        }`
      );
      const data = await res.json();
      const address = data.features[0]?.place_name || "";

      setFormData((prev) => ({
        ...prev,
        location: { coordinates: [lon, lat], address },
      }));

      await extractAdminFromMapbox(lon, lat);
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = async (division, district) => {
    setFormData((prev) => ({ ...prev, division, district }));

    // Fetch coordinates from Mapbox based on known district
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          district + ", " + division + ", Bangladesh"
        )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      );
      const data = await res.json();
      const feature = data.features?.[0];
      if (feature) {
        setFormData((prev) => ({
          ...prev,
          location: {
            coordinates: feature.center, // [lng, lat]
            address: feature.place_name,
          },
        }));
      } else {
        console.warn("❌ No coordinates found for this district.");
      }
    } catch (err) {
      console.error("❌ Mapbox geocoding error", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }
    if (!formData.agreedToTerms) {
      setMessage("❌ You must agree to the Terms and Policies to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const role = formData.role;
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup/step1`,
        {
          ...formData,
          phone: `+${phone}`,
          primaryRole: role,
          roles: [role],
          location: {
            ...formData.location,
            division: formData.division,
            district: formData.district,
          },
        }
      );

      localStorage.setItem("signupUserId", res.data.userId);
      setMessage("✅ Step 1 complete! Check your email to verify.");

      localStorage.setItem("signupUserId", res.data.userId);
      localStorage.setItem("signupRole", formData.role); // ✅ Add this
      navigate("/verify");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          className="w-full px-4 py-2 border rounded"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <PhoneInput
          country={"bd"}
          value={phone}
          onChange={setPhone}
          inputProps={{ name: "phone", required: true }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="w-full px-4 py-2 border rounded"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="referralCode"
          placeholder="Referral Code (optional)"
          className="w-full px-4 py-2 border rounded"
          value={formData.referralCode || ""}
          onChange={handleChange}
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="user">User</option>
          <option value="host">Host</option>
          <option value="driver">Driver</option>
        </select>

        {formData.role === "driver" && (
          <>
            <input
              type="text"
              name="licenseNumber"
              placeholder="Driving License Number"
              className="w-full px-4 py-2 border rounded"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />

            <select
              name="vehicleType"
              className="w-full px-4 py-2 border rounded"
              value={formData.vehicleType}
              onChange={handleChange}
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>

            <input
              type="number"
              name="seats"
              placeholder="Number of Seats"
              className="w-full px-4 py-2 border rounded"
              value={formData.seats}
              onChange={handleChange}
              required
            />
          </>
        )}

        <LocationSelector onChange={handleLocationChange} />
        <MapboxAutocomplete
          onSelectLocation={({ coordinates, address }) => {
            setFormData((prev) => ({
              ...prev,
              location: { coordinates, address },
            }));
            extractAdminFromMapbox(coordinates[0], coordinates[1]);
          }}
        />

        <button
          type="button"
          onClick={handleAutoDetect}
          className="text-sm text-blue-600 underline"
        >
          📍 Use My Current Location
        </button>
        {formData.location.address && (
          <p className="text-sm text-gray-600 mt-2">
            📍 Selected: {formData.location.address}
          </p>
        )}
        <div className="flex items-start gap-2 mt-4">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1"
            checked={formData.agreedToTerms}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                agreedToTerms: e.target.checked,
              }))
            }
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{" "}
            <Link to="/terms" className="text-blue-600 underline">
              Terms & Conditions
            </Link>
            ,{" "}
            <Link to="/privacy" className="text-blue-600 underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/refund-policy" className="text-blue-600 underline">
              Refund Policy
            </Link>
            .
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? <span className="animate-spin">🔄</span> : "Sign Up"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default SignupFormStep1;
