import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import LocationAutocomplete from "../components/LocationAutocomplete";
import MapboxRouteMap from "../components/MapboxRouteMap";
import { fetchSuggestions } from "../utils/mapboxUtils";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  ImagePlus,
  Info,
  LocateFixed,
  MapPin,
  Route,
  Users,
  Wallet,
} from "lucide-react";

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
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Auto GPS -> fill "From"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      let file = files?.[0];
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

  const canGoStep2 = Boolean(
    form.from && form.to && form.fromLocation && form.toLocation,
  );
  const canGoStep3 = Boolean(
    form.vehicleType && (form.totalSeats || form.totalSeats === 0),
  );
  const canSubmit = Boolean(
    form.date &&
    form.time &&
    Number(form.totalSeats) >= 1 &&
    Number(form.farePerSeat) >= 0,
  );

  const totalPotential = useMemo(() => {
    const seats = Number(form.totalSeats || 0);
    const fare = Number(form.farePerSeat || 0);
    return seats * fare;
  }, [form.totalSeats, form.farePerSeat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();

    // fallback pickup location
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

  const StepPill = ({ n, title, icon: Icon, enabled }) => (
    <button
      type="button"
      onClick={() => enabled && setStep(n)}
      className={[
        "flex-1 rounded-2xl border px-4 py-3 text-left transition",
        step === n
          ? "border-teal-200 bg-teal-50"
          : enabled
            ? "border-gray-200 bg-white hover:bg-gray-50"
            : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            step === n
              ? "bg-white border-teal-200"
              : "bg-white border-gray-200",
          ].join(" ")}
        >
          <Icon className="text-teal-700" size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-500">Step {n}</div>
          <div className="font-semibold text-gray-900 truncate">{title}</div>
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              <Route size={16} />
              Driver • Publish Trip
            </div>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Create a Trip
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              Set your route, pickup point, vehicle details and fare. Make it
              clean and trustworthy for passengers.
            </p>

            {/* Step pills */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StepPill n={1} title="Route" icon={MapPin} enabled={true} />
              <StepPill n={2} title="Vehicle" icon={Car} enabled={canGoStep2} />
              <StepPill
                n={3}
                title="Pricing"
                icon={Wallet}
                enabled={canGoStep2 && canGoStep3}
              />
              <StepPill
                n={4}
                title="Photo & Publish"
                icon={ImagePlus}
                enabled={canGoStep2}
              />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Route */}
              {step === 1 && (
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Route
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose where you start and where you’re going.
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* From */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        From
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
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
                              navigator.geolocation.getCurrentPosition(
                                async (pos) => {
                                  const coords = [
                                    pos.coords.longitude,
                                    pos.coords.latitude,
                                  ];
                                  const res = await fetchSuggestions(
                                    coords.join(","),
                                    true,
                                  );
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
                                },
                              );
                            } catch (err) {
                              console.error("❌ GPS detect failed:", err);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          <LocateFixed size={18} className="text-teal-700" />
                          Use GPS
                        </button>
                      </div>
                    </div>

                    {/* To */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        To
                      </label>
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

                    {/* Map */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                        <Route size={16} className="text-teal-700" />
                        Route on map
                      </div>
                      <MapboxRouteMap
                        fromLocation={form.fromLocation}
                        toLocation={form.toLocation}
                        onSetFrom={(val) =>
                          setForm((prev) => ({ ...prev, fromLocation: val }))
                        }
                        onSetTo={(val) =>
                          setForm((prev) => ({ ...prev, toLocation: val }))
                        }
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

                      <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                        <div className="flex items-start gap-2">
                          <Info size={16} className="mt-0.5 text-teal-700" />
                          <div>
                            Pickup point defaults to your “From” location. You
                            can tap the map to set a more precise pickup.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!canGoStep2}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Vehicle */}
              {step === 2 && (
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Vehicle
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose vehicle type and add basic info.
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Vehicle type toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Vehicle Type
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, vehicleType: "car" }))
                          }
                          className={[
                            "rounded-2xl border p-4 text-left transition",
                            form.vehicleType === "car"
                              ? "border-teal-200 bg-teal-50"
                              : "border-gray-200 bg-white hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl border bg-white flex items-center justify-center">
                              <Car className="text-teal-700" size={20} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                Car
                              </div>
                              <div className="text-sm text-gray-600">
                                Comfort rides
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, vehicleType: "bike" }))
                          }
                          className={[
                            "rounded-2xl border p-4 text-left transition",
                            form.vehicleType === "bike"
                              ? "border-teal-200 bg-teal-50"
                              : "border-gray-200 bg-white hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl border bg-white flex items-center justify-center">
                              <Bike className="text-teal-700" size={20} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                Bike
                              </div>
                              <div className="text-sm text-gray-600">
                                Fast trips
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Vehicle details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Vehicle Model
                        </label>
                        <input
                          name="vehicleModel"
                          placeholder="e.g. Toyota Axio"
                          value={form.vehicleModel}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          License Plate
                        </label>
                        <input
                          name="licensePlate"
                          placeholder="e.g. DHA-1234"
                          value={form.licensePlate}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!canGoStep2}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Pricing */}
              {step === 3 && (
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pricing
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Set seats and fare per seat.
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Total Seats
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="totalSeats"
                            min="1"
                            value={form.totalSeats}
                            onChange={handleChange}
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
                          Fare per seat (৳)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="farePerSeat"
                            min="0"
                            value={form.farePerSeat}
                            onChange={handleChange}
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
                            {Number.isFinite(totalPotential)
                              ? totalPotential
                              : 0}{" "}
                            ৳ ({form.totalSeats || 0} seats ×{" "}
                            {form.farePerSeat || 0} ৳)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Photo + Date/Time + Submit */}
              {step === 4 && (
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Publish
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Set date/time and optionally add a vehicle photo.
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Trip Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="date"
                            value={form.date}
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
                          Trip Time
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            name="time"
                            value={form.time}
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
                                Add a photo
                              </div>
                              <div className="text-sm text-gray-600">
                                Helps passengers trust the ride.
                              </div>
                            </div>
                          </div>

                          <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-white font-semibold hover:bg-teal-700 cursor-pointer">
                            <ImagePlus size={18} />
                            Choose file
                            <input
                              type="file"
                              name="image"
                              accept="image/*"
                              onChange={handleChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="mt-4 w-full max-w-sm h-48 object-cover rounded-2xl border"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Publish Trip <CheckCircle2 size={18} />
                      </button>
                    </div>

                    {message && (
                      <p className="text-center text-rose-600 font-medium">
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right: Sticky Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Summary
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Check everything before publishing.
                  </p>
                </div>

                <div className="p-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">From</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[60%]">
                      {form.from || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">To</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[60%]">
                      {form.to || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pickup</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[60%]">
                      {form.location?.address ||
                        form.fromLocation?.address ||
                        "—"}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 my-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vehicle</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {form.vehicleType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Seats</span>
                    <span className="font-semibold text-gray-900">
                      {form.totalSeats || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fare / seat</span>
                    <span className="font-semibold text-gray-900">
                      {form.farePerSeat || 0} ৳
                    </span>
                  </div>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 mt-2">
                    <div className="text-xs font-semibold text-teal-700">
                      Potential total
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {Number.isFinite(totalPotential) ? totalPotential : 0} ৳
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    Go to Publish{" "}
                    <ArrowRight size={18} className="text-teal-700" />
                  </button>
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
                      Set a clear pickup point (not “random road”). It reduces
                      cancellations and improves ratings.
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

export default DriverTripForm;
