import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import LocationAutocomplete from "../components/LocationAutocomplete";
import MapboxAutocomplete from "../components/MapboxAutocomplete";
import MapboxRouteMap from "../components/MapboxRouteMap";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  ImagePlus,
  Info,
  LocateFixed,
  MapPin,
  Save,
  Users,
  Wallet,
} from "lucide-react";

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
          },
        );
        const trip = res.data;

        setFormData({
          from: trip.from || "",
          to: trip.to || "",
          fromLocation: trip.fromLocation || null,
          toLocation: trip.toLocation || null,
          location: trip.location || null,
          date: trip.date || "",
          time: trip.time || "",
          totalSeats: trip.totalSeats ?? 1,
          farePerSeat: trip.farePerSeat ?? 0,
          vehicleType: trip.vehicleType || "car",
          vehicleModel: trip.vehicleModel || "",
          licensePlate: trip.licensePlate || "",
          image: trip.image || "",
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
    setImageFile(e.target.files?.[0] || null);
  };

  const potentialTotal = useMemo(() => {
    const seats = Number(formData.totalSeats || 0);
    const fare = Number(formData.farePerSeat || 0);
    return seats * fare;
  }, [formData.totalSeats, formData.farePerSeat]);

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

      const finalFormData = { ...formData, location: pickup };

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
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <MapPin size={16} />
                  Driver • Edit Trip
                </div>

                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Edit Trip
                </h2>

                <p className="mt-2 max-w-2xl text-gray-600">
                  Update route, pickup point, schedule, and pricing. You can
                  also replace the vehicle image.
                </p>
              </div>

              <Link
                to="/dashboard/driver"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50"
              >
                <ArrowLeft size={18} className="text-teal-700" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            {/* Route */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Route</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Update From/To locations. You can keep the same route if you
                  only want to change time or fare.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    From
                  </label>
                  <LocationAutocomplete
                    placeholder="From"
                    value={formData.from} // remove if your component doesn't support
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    To
                  </label>
                  <LocationAutocomplete
                    placeholder="To"
                    value={formData.to} // remove if your component doesn't support
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
                </div>

                <div className="pt-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <LocateFixed size={16} className="text-teal-700" />
                    Optional: pin exact pickup point
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Default pickup is your “From” location. Tap the map to set a
                    more accurate pickup spot.
                  </p>

                  <MapboxAutocomplete
                    fromLocation={formData.fromLocation}
                    toLocation={formData.toLocation}
                    initialCoordinates={formData.location?.coordinates}
                    onSelectLocation={({ coordinates, address }) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { type: "Point", coordinates, address },
                      }))
                    }
                  />

                  <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="mt-0.5 text-teal-700" />
                      <div>
                        Pickup used for saving:{" "}
                        <span className="font-semibold">
                          {formData.location?.address ||
                            formData.fromLocation?.address ||
                            "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <MapPin size={16} className="text-teal-700" />
                    Route preview
                  </div>
                  <MapboxRouteMap
                    fromLocation={formData.fromLocation}
                    toLocation={formData.toLocation}
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Trip time must be in the future.
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date?.slice(0, 10) || ""}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                    <CalendarDays
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="time"
                      value={formData.time || ""}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                    <Clock
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing + Seats */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Seats & Pricing
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Update available seats and price per seat.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Total Seats
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="totalSeats"
                        value={formData.totalSeats}
                        onChange={handleChange}
                        min={1}
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      />
                      <Users
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-700"
                        size={18}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Fare per Seat (৳)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="farePerSeat"
                        value={formData.farePerSeat}
                        onChange={handleChange}
                        min={0}
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      />
                      <Wallet
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-700"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="mt-0.5 text-teal-700" />
                    <div>
                      <div className="font-semibold">Potential total</div>
                      <div className="text-teal-800">
                        {Number.isFinite(potentialTotal) ? potentialTotal : 0} ৳
                        ({formData.totalSeats || 0} ×{" "}
                        {formData.farePerSeat || 0})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Keep details accurate for trust.
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Vehicle type as premium toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Vehicle Type
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: "car", label: "Car", icon: Car },
                      { key: "bike", label: "Bike", icon: Bike },
                      { key: "microbus", label: "Microbus", icon: Users },
                    ].map(({ key, label, icon: Icon }) => {
                      const active = formData.vehicleType === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({ ...p, vehicleType: key }))
                          }
                          className={[
                            "rounded-2xl border p-4 text-left transition",
                            active
                              ? "border-teal-200 bg-teal-50"
                              : "border-gray-200 bg-white hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl border bg-white flex items-center justify-center">
                              <Icon className="text-teal-700" size={20} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {active ? "Selected" : "Tap to select"}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      placeholder="e.g. Toyota Axio"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      License Plate
                    </label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      placeholder="e.g. DHA-1234"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Vehicle Image (optional)
                  </label>

                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-3 border border-gray-200">
                          <ImagePlus className="text-teal-700" size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Replace image
                          </div>
                          <div className="text-sm text-gray-600">
                            Upload a new image if you changed the vehicle.
                          </div>
                        </div>
                      </div>

                      <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-white font-semibold hover:bg-teal-700 cursor-pointer">
                        <ImagePlus size={18} />
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {(imageFile || formData.image) && (
                      <div className="mt-4">
                        <div className="text-xs font-semibold text-gray-500 mb-2">
                          Current image
                        </div>
                        <img
                          src={
                            imageFile
                              ? URL.createObjectURL(imageFile)
                              : formData.image
                          }
                          alt="Vehicle"
                          className="w-full max-w-sm h-56 object-cover rounded-2xl border bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile save button (non-sticky) */}
            <button
              type="submit"
              disabled={loading}
              className={`lg:hidden w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
              <Save size={18} />
            </button>
          </form>

          {/* Right Sticky Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Summary
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Review changes before saving.
                  </p>
                </div>

                <div className="p-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">From</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[60%]">
                      {formData.from || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">To</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[60%]">
                      {formData.to || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Pickup</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[60%]">
                      {formData.location?.address ||
                        formData.fromLocation?.address ||
                        "—"}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 my-2" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Date</span>
                    <span className="font-semibold text-gray-900">
                      {(formData.date || "").slice(0, 10) || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Time</span>
                    <span className="font-semibold text-gray-900">
                      {formData.time || "—"}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 my-2" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Vehicle</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {formData.vehicleType || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Seats</span>
                    <span className="font-semibold text-gray-900">
                      {formData.totalSeats || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Fare / seat</span>
                    <span className="font-semibold text-gray-900">
                      {formData.farePerSeat || 0} ৳
                    </span>
                  </div>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 mt-2">
                    <div className="text-xs font-semibold text-teal-700">
                      Potential total
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {Number.isFinite(potentialTotal) ? potentialTotal : 0} ৳
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`hidden lg:inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700 ${
                      loading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                    <CheckCircle2 size={18} />
                  </button>

                  <p className="text-xs text-gray-500">
                    Make sure the trip schedule is in the future.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-teal-100 bg-teal-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-3 border border-teal-100">
                    <Info className="text-teal-700" size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Pro tip</div>
                    <div className="text-sm text-gray-700 mt-1">
                      If your route changes, update pickup point so passengers
                      don’t get confused.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTripForm;
