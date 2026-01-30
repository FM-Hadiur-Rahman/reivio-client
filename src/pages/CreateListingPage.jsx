import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  Coins,
  ImagePlus,
  Info,
  LocateFixed,
  MapPin,
  Phone,
  ShieldCheck,
  UploadCloud,
  Users,
  X,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import MapboxAutocomplete from "../components/MapboxAutocomplete";
import { divisions } from "../data/districts";
import { api } from "../services/api";
import { toast } from "react-toastify";

const MAX_IMAGES = 10;
const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function CreateListingPage() {
  const [form, setForm] = useState({
    title: "",
    price: "",
    maxGuests: "",
    division: "",
    district: "",
    roomType: "",
    description: "",
    houseRules: "",
    location: null,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [revgeoBusy, setRevgeoBusy] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  // 🔄 Always fetch fresh profile (keeps localStorage in sync)
  const refreshMe = useCallback(async () => {
    try {
      const res = await api.get("/api/users/me");
      const u = res?.data?.user ?? res?.data;
      if (u) {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch (e) {
      console.warn("Failed to refresh user", e);
    }
  }, []);

  useEffect(() => {
    refreshMe();
    const onFocus = () => refreshMe(); // update when returning to tab
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshMe]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const extractAdminFromMapbox = useCallback(async (lon, lat) => {
    try {
      setRevgeoBusy(true);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,region&access_token=${
          import.meta.env.VITE_MAPBOX_TOKEN
        }`,
      );
      if (!res.ok) throw new Error(`Mapbox ${res.status}`);
      const data = await res.json();
      const features = data?.features ?? [];
      const district = features.find((f) => f.place_type?.includes("place"));
      const division = features.find((f) => f.place_type?.includes("region"));
      setForm((prev) => ({
        ...prev,
        division: division?.text || prev.division || "",
        district: district?.text || prev.district || "",
      }));
    } catch (err) {
      console.warn("❌ Reverse geocoding failed", err);
      toast.warn("Couldn’t auto-fill division/district. Please set manually.");
    } finally {
      setRevgeoBusy(false);
    }
  }, []);

  const handleMapSelect = ({ coordinates, address }) => {
    setForm((prev) => ({
      ...prev,
      location: { type: "Point", coordinates, address },
    }));
    extractAdminFromMapbox(coordinates[0], coordinates[1]);
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return toast.warn("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${
              import.meta.env.VITE_MAPBOX_TOKEN
            }`,
          );
          const data = await res.json();
          const address = data?.features?.[0]?.place_name || "";
          setForm((prev) => ({
            ...prev,
            location: { type: "Point", coordinates: [lon, lat], address },
          }));
        } finally {
          extractAdminFromMapbox(lon, lat);
        }
      },
      () => toast.error("Failed to get current location."),
    );
  };

  const onPickImages = (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    if (arr.length + images.length > MAX_IMAGES)
      return toast.warn(`Max ${MAX_IMAGES} images allowed.`);
    const bad = arr.find(
      (f) =>
        !ALLOWED_TYPES.includes(f.type) || f.size > MAX_IMAGE_MB * 1024 * 1024,
    );
    if (bad)
      return toast.error(
        `Only JPG/PNG/WebP/AVIF up to ${MAX_IMAGE_MB}MB each are allowed.`,
      );
    setImages((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    const beforeUnload = (e) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("beforeunload", beforeUnload);
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [uploading, previews]);

  // ✅ Consider either verified flag OR approved status
  const payoutVerified = Boolean(
    user?.paymentDetails?.verified ||
    (user?.paymentDetails?.status || "").toLowerCase() === "approved",
  );

  const missingFlags = useMemo(() => {
    if (!user) return [];
    const out = [];
    if (!(user.roles || []).includes("host")) out.push("Switch to Host");
    if ((user?.kyc?.status || "").toLowerCase() !== "approved")
      out.push("KYC approval");
    if (!user?.identityVerified) out.push("ID + live selfie");
    if (!user?.phoneVerified) out.push("Mobile verification");
    if (!payoutVerified) out.push("Payout method");
    return out;
  }, [user, payoutVerified]);

  const canSubmit =
    !uploading &&
    !!token &&
    form.title.trim() &&
    form.price &&
    form.maxGuests &&
    form.division &&
    form.district &&
    form.roomType &&
    form.location &&
    images.length > 0 &&
    missingFlags.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.info("Please log in first.");
      navigate("/login");
      return;
    }
    if (!form.location)
      return toast.warn("Please select a location on the map.");
    if (!form.division || !form.district)
      return toast.warn("Please select Division and District.");
    if (images.length === 0)
      return toast.warn("Please add at least one image.");
    if (missingFlags.length > 0)
      return toast.error(`Complete account setup: ${missingFlags.join(", ")}`);

    try {
      setUploading(true);
      const fd = new FormData();
      images.forEach((img) => fd.append("images", img));
      Object.entries({
        title: form.title.trim(),
        price: form.price,
        maxGuests: form.maxGuests,
        division: form.division,
        district: form.district,
        roomType: form.roomType,
        description: form.description || "",
        houseRules: form.houseRules || "",
        location: JSON.stringify(form.location),
      }).forEach(([k, v]) => fd.append(k, v));

      await api.post("/api/listings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Listing created!");
      navigate("/host/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create listing.";
      toast.error(`❌ ${msg}`);
      const m = msg.toLowerCase();
      if (m.includes("host")) navigate("/profile?tab=roles");
      else if (m.includes("kyc")) navigate("/kyc");
      else if (m.includes("upload id")) navigate("/verify-identity");
      else if (m.includes("mobile")) navigate("/verify-phone");
      else if (m.includes("payout")) navigate("/payment-details");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
            <div className="relative p-7 md:p-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                    <ShieldCheck size={16} />
                    Host Publishing
                  </div>

                  <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                    Create a New Listing
                  </h1>

                  <p className="mt-2 max-w-2xl text-gray-600">
                    Add details, choose location, upload photos and publish when
                    your account checks are complete.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <ImagePlus className="text-teal-600" size={16} />
                    Up to {MAX_IMAGES} photos
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <Coins className="text-teal-600" size={16} />
                    Price per night (BDT)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-8 space-y-6">
              {/* Account Status */}
              {user && (
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="text-teal-700" size={18} />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Account readiness
                        </h2>
                      </div>

                      <button
                        onClick={refreshMe}
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Refresh
                        <Info size={16} className="text-teal-600" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      You can publish only when these checks are approved.
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* KYC */}
                      <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                        <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                          <ShieldCheck className="text-teal-700" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900">KYC</p>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                (user?.kyc?.status || "").toLowerCase() ===
                                "approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {user?.kyc?.status || "unknown"}
                            </span>
                          </div>
                          {(user?.kyc?.status || "").toLowerCase() !==
                            "approved" && (
                            <Link
                              to="/kyc"
                              className="text-sm text-teal-700 underline font-medium"
                            >
                              Fix KYC
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Identity */}
                      <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                        <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                          <Camera className="text-teal-700" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900">
                              Identity
                            </p>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                user?.identityVerified
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {user?.identityVerified
                                ? "verified"
                                : "not verified"}
                            </span>
                          </div>
                          {!user?.identityVerified && (
                            <Link
                              to="/verify-identity"
                              className="text-sm text-teal-700 underline font-medium"
                            >
                              Verify identity
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                        <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                          <Phone className="text-teal-700" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900">
                              Mobile
                            </p>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                user?.phoneVerified
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {user?.phoneVerified
                                ? "verified"
                                : "not verified"}
                            </span>
                          </div>
                          {!user?.phoneVerified && (
                            <Link
                              to="/verify-phone"
                              className="text-sm text-teal-700 underline font-medium"
                            >
                              Verify phone
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Payout */}
                      <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                        <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                          <Coins className="text-teal-700" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900">
                              Payout
                            </p>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                payoutVerified
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {payoutVerified ? "verified" : "not verified"}
                            </span>
                          </div>
                          {!payoutVerified && (
                            <Link
                              to="/payment-details"
                              className="text-sm text-teal-700 underline font-medium"
                            >
                              Add payout method
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {missingFlags.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                        <div className="font-semibold">
                          You can’t publish yet
                        </div>
                        <div className="text-sm mt-1">
                          Missing: {missingFlags.join(", ")}.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Listing Basics */}
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Listing details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Title, category, and location region.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Title
                    </label>
                    <input
                      name="title"
                      placeholder="e.g. Cozy beach resort with sea view"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      required
                    />
                  </div>

                  {/* Division / District */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Division
                      </label>
                      <div className="relative">
                        <select
                          name="division"
                          onChange={handleChange}
                          value={form.division}
                          className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                          required
                        >
                          <option value="">Select Division</option>
                          {Object.keys(divisions).map((div) => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                        <Building2
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600"
                          size={18}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        District
                      </label>
                      <div className="relative">
                        <select
                          name="district"
                          onChange={handleChange}
                          value={form.district}
                          className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                          required
                        >
                          <option value="">Select District</option>
                          {(divisions[form.division] || []).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <MapPin
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600"
                          size={18}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Room Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Room Type
                    </label>
                    <select
                      name="roomType"
                      value={form.roomType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      required
                    >
                      <option value="">Select Room Type</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Resort">Resort</option>
                      <option value="Guest House">Guest House</option>
                      <option value="Personal Property">
                        Personal Property
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Description / Rules */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Describe your place, highlights, nearby attractions…"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 resize-none"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        House Rules
                      </label>
                      <textarea
                        name="houseRules"
                        placeholder="e.g. No smoking, no parties, check-in after 2 PM…"
                        value={form.houseRules}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Price / Guests / Autodetect */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Price (BDT / night)
                      </label>
                      <div className="relative">
                        <input
                          name="price"
                          type="number"
                          placeholder="e.g. 3500"
                          value={form.price}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                          min={1}
                          required
                        />
                        <Coins
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600"
                          size={18}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Max Guests
                      </label>
                      <div className="relative">
                        <input
                          name="maxGuests"
                          type="number"
                          placeholder="e.g. 4"
                          value={form.maxGuests}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                          min={1}
                          required
                        />
                        <Users
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600"
                          size={18}
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAutoDetect}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
                        disabled={revgeoBusy}
                      >
                        <LocateFixed size={18} />
                        {revgeoBusy ? "Detecting…" : "Auto-detect"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Location
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Search and select on the map to pinpoint the place.
                  </p>
                </div>

                <div className="p-6">
                  <MapboxAutocomplete
                    onSelectLocation={handleMapSelect}
                    formLocation={form.location}
                  />

                  {form.location?.address && (
                    <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 text-teal-700" size={16} />
                        <div>
                          <div className="font-semibold">Selected address</div>
                          <div className="text-teal-800">
                            {form.location.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Photos
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    High-quality photos increase booking conversions.
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-3 border border-gray-200">
                          <UploadCloud className="text-teal-700" size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Upload images
                          </div>
                          <div className="text-sm text-gray-600">
                            Up to {MAX_IMAGES} images • {MAX_IMAGE_MB}MB each •
                            JPG/PNG/WebP/AVIF
                          </div>
                        </div>
                      </div>

                      <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-white font-semibold hover:bg-teal-700 cursor-pointer">
                        <ImagePlus size={18} />
                        Choose files
                        <input
                          name="images"
                          type="file"
                          accept={ALLOWED_TYPES.join(",")}
                          multiple
                          onChange={(e) => onPickImages(e.target.files)}
                          className="hidden"
                          required={images.length === 0}
                        />
                      </label>
                    </div>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {previews.map((src, i) => (
                        <div
                          key={i}
                          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white"
                        >
                          <img
                            src={src}
                            className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
                            alt="Preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-black/70 text-white w-8 h-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                            aria-label="Remove"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploading && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                      Uploading… Don’t close this tab.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Sticky submit card */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-6 space-y-4">
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Publish
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete required fields to enable submit.
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Location selected</span>
                        {form.location ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 size={16} /> Yes
                          </span>
                        ) : (
                          <span className="text-rose-700 font-semibold">
                            No
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Photos</span>
                        <span className="font-semibold text-gray-900">
                          {images.length}/{MAX_IMAGES}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account checks</span>
                        {missingFlags.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 size={16} /> Ready
                          </span>
                        ) : (
                          <span className="text-rose-700 font-semibold">
                            {missingFlags.length} missing
                          </span>
                        )}
                      </div>
                    </div>

                    {missingFlags.length > 0 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <div className="font-semibold flex items-center gap-2">
                          <Info size={16} className="text-amber-700" />
                          Finish setup to publish
                        </div>
                        <div className="mt-1">{missingFlags.join(", ")}.</div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={!canSubmit}
                      title={
                        !canSubmit
                          ? "Complete form & account checks to enable"
                          : undefined
                      }
                    >
                      {uploading ? "Uploading…" : "Submit Listing"}
                      <CheckCircle2 size={18} />
                    </button>

                    <p className="text-xs text-gray-500">
                      By publishing, you confirm your listing details and photos
                      are accurate.
                    </p>
                  </div>
                </div>

                {/* Small helper card */}
                <div className="rounded-3xl border border-teal-100 bg-teal-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-3 border border-teal-100">
                      <Info className="text-teal-700" size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Pro tip</div>
                      <div className="text-sm text-gray-700 mt-1">
                        Use bright daylight photos and mention nearby landmarks.
                        It improves trust and bookings.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
