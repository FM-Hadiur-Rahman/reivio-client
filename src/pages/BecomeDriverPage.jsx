import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BecomeDriverPage() {
  const navigate = useNavigate();
  const { token, updateUser } = useAuth();

  const [form, setForm] = useState({
    drivingLicense: "",
    vehicleType: "",
    seatsOffered: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/become-driver`,
        {
          drivingLicense: form.drivingLicense,
          vehicleType: form.vehicleType,
          seatsOffered: Number(form.seatsOffered),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(res.data); // should return updated user data
      toast.success("✅ You are now a Driver!");
      navigate("/dashboard/driver");
    } catch (err) {
      const data = err.response?.data;
      if (data?.fields) setErrors(data.fields);
      toast.error(data?.message || "Failed to become driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Become a Driver</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <input
            name="drivingLicense"
            value={form.drivingLicense}
            onChange={onChange}
            placeholder="Driving License Number"
            className="w-full px-4 py-2 border rounded"
          />
          {errors.drivingLicense && (
            <p className="text-sm text-red-600 mt-1">{errors.drivingLicense}</p>
          )}
        </div>

        <div>
          <select
            name="vehicleType"
            value={form.vehicleType}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select Vehicle Type</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
          {errors.vehicleType && (
            <p className="text-sm text-red-600 mt-1">{errors.vehicleType}</p>
          )}
        </div>

        <div>
          <input
            type="number"
            name="seatsOffered"
            value={form.seatsOffered}
            onChange={onChange}
            placeholder="Seats Offered"
            className="w-full px-4 py-2 border rounded"
          />
          {errors.seatsOffered && (
            <p className="text-sm text-red-600 mt-1">{errors.seatsOffered}</p>
          )}
        </div>

        <button
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
