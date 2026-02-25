// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";

// import MapboxAutocomplete from "./MapboxAutocomplete";
// import LocationSelector from "./LocationSelector";
// import { useEffect } from "react";

// const SignupFormStep1 = () => {
//   const navigate = useNavigate();
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user && localStorage.getItem("token")) {
//       navigate("/"); // or "/dashboard"
//     }
//   }, []);

//   const [isLoading, setIsLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "user",
//     division: "",
//     district: "",
//     location: {
//       coordinates: [],
//       address: "",
//     },
//     licenseNumber: "",
//     vehicleType: "",
//     seats: "",
//     agreedToTerms: false,
//   });

//   const [phone, setPhone] = useState("");
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const ref = urlParams.get("ref");
//     if (ref) {
//       setFormData((prev) => ({ ...prev, referralCode: ref.toUpperCase() }));
//     }
//   }, []);

//   const extractAdminFromMapbox = async (lon, lat) => {
//     try {
//       const res = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,region&access_token=${
//           import.meta.env.VITE_MAPBOX_TOKEN
//         }`
//       );
//       const data = await res.json();
//       const features = data.features || [];

//       const district = features.find((f) => f.place_type.includes("place"));
//       const division = features.find((f) => f.place_type.includes("region"));

//       setFormData((prev) => ({
//         ...prev,
//         division: division?.text || "",
//       }));
//     } catch (err) {
//       console.warn("❌ Reverse geocoding failed", err);
//     }
//   };

//   const handleAutoDetect = () => {
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       const lat = pos.coords.latitude;
//       const lon = pos.coords.longitude;

//       const res = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${
//           import.meta.env.VITE_MAPBOX_TOKEN
//         }`
//       );
//       const data = await res.json();
//       const address = data.features[0]?.place_name || "";

//       setFormData((prev) => ({
//         ...prev,
//         location: { coordinates: [lon, lat], address },
//       }));

//       await extractAdminFromMapbox(lon, lat);
//     });
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleLocationChange = async (division, district) => {
//     setFormData((prev) => ({ ...prev, division, district }));

//     // Fetch coordinates from Mapbox based on known district
//     try {
//       const res = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
//           district + ", " + division + ", Bangladesh"
//         )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
//       );
//       const data = await res.json();
//       const feature = data.features?.[0];
//       if (feature) {
//         setFormData((prev) => ({
//           ...prev,
//           location: {
//             coordinates: feature.center, // [lng, lat]
//             address: feature.place_name,
//           },
//         }));
//       } else {
//         console.warn("❌ No coordinates found for this district.");
//       }
//     } catch (err) {
//       console.error("❌ Mapbox geocoding error", err);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       setMessage("❌ Passwords do not match.");
//       return;
//     }
//     if (!formData.agreedToTerms) {
//       setMessage("❌ You must agree to the Terms and Policies to continue.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const role = formData.role;
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/auth/signup/step1`,
//         {
//           ...formData,
//           phone: `+${phone}`,
//           primaryRole: role,
//           roles: [role],
//           location: {
//             ...formData.location,
//             division: formData.division,
//             district: formData.district,
//           },
//         }
//       );

//       localStorage.setItem("signupUserId", res.data.userId);
//       setMessage("✅ Step 1 complete! Check your email to verify.");

//       localStorage.setItem("signupUserId", res.data.userId);
//       localStorage.setItem("signupRole", formData.role); // ✅ Add this
//       navigate("/verify");
//     } catch (err) {
//       console.error(err);
//       setMessage(err.response?.data?.message || "❌ Registration failed.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Your Name"
//           className="w-full px-4 py-2 border rounded"
//           value={formData.name}
//           onChange={handleChange}
//           required
//         />

//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           className="w-full px-4 py-2 border rounded"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />

//         <PhoneInput
//           country={"bd"}
//           value={phone}
//           onChange={setPhone}
//           inputProps={{ name: "phone", required: true }}
//         />

//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           className="w-full px-4 py-2 border rounded"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />

//         <input
//           type="password"
//           name="confirmPassword"
//           placeholder="Confirm Password"
//           className="w-full px-4 py-2 border rounded"
//           value={formData.confirmPassword}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="referralCode"
//           placeholder="Referral Code (optional)"
//           className="w-full px-4 py-2 border rounded"
//           value={formData.referralCode || ""}
//           onChange={handleChange}
//         />

//         <select
//           name="role"
//           value={formData.role}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//         >
//           <option value="user">User</option>
//           <option value="host">Host</option>
//           <option value="driver">Driver</option>
//         </select>

//         {formData.role === "driver" && (
//           <>
//             <input
//               type="text"
//               name="licenseNumber"
//               placeholder="Driving License Number"
//               className="w-full px-4 py-2 border rounded"
//               value={formData.licenseNumber}
//               onChange={handleChange}
//               required
//             />

//             <select
//               name="vehicleType"
//               className="w-full px-4 py-2 border rounded"
//               value={formData.vehicleType}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Vehicle Type</option>
//               <option value="car">Car</option>
//               <option value="bike">Bike</option>
//             </select>

//             <input
//               type="number"
//               name="seats"
//               placeholder="Number of Seats"
//               className="w-full px-4 py-2 border rounded"
//               value={formData.seats}
//               onChange={handleChange}
//               required
//             />
//           </>
//         )}

//         <LocationSelector onChange={handleLocationChange} />
//         <MapboxAutocomplete
//           onSelectLocation={({ coordinates, address }) => {
//             setFormData((prev) => ({
//               ...prev,
//               location: { coordinates, address },
//             }));
//             extractAdminFromMapbox(coordinates[0], coordinates[1]);
//           }}
//         />

//         <button
//           type="button"
//           onClick={handleAutoDetect}
//           className="text-sm text-blue-600 underline"
//         >
//           📍 Use My Current Location
//         </button>
//         {formData.location.address && (
//           <p className="text-sm text-gray-600 mt-2">
//             📍 Selected: {formData.location.address}
//           </p>
//         )}
//         <div className="flex items-start gap-2 mt-4">
//           <input
//             type="checkbox"
//             id="terms"
//             required
//             className="mt-1"
//             checked={formData.agreedToTerms}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 agreedToTerms: e.target.checked,
//               }))
//             }
//           />
//           <label htmlFor="terms" className="text-sm text-gray-700">
//             I agree to the{" "}
//             <Link to="/terms" className="text-blue-600 underline">
//               Terms & Conditions
//             </Link>
//             ,{" "}
//             <Link to="/privacy" className="text-blue-600 underline">
//               Privacy Policy
//             </Link>{" "}
//             and{" "}
//             <Link to="/refund-policy" className="text-blue-600 underline">
//               Refund Policy
//             </Link>
//             .
//           </label>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-teal-400 hover:bg-teal-500 text-white py-2 rounded"
//           disabled={isLoading}
//         >
//           {isLoading ? <span className="animate-spin">🔄</span> : "Sign Up"}
//         </button>
//       </form>

//       {message && <p className="mt-4 text-center text-red-500">{message}</p>}
//     </div>
//   );
// };

// export default SignupFormStep1;

import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import MapboxAutocomplete from "./MapboxAutocomplete";
import LocationSelector from "./LocationSelector";

/* ===================== UI HELPERS (MUST BE OUTSIDE) ===================== */

const Section = memo(function Section({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {desc ? <p className="text-xs text-gray-500 mt-1">{desc}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
});

const Label = memo(function Label({ children }) {
  return <p className="text-xs font-medium text-gray-700 mb-1">{children}</p>;
});

const Pill = memo(function Pill({ active, children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </span>
  );
});

const FieldError = memo(function FieldError({ errors, name }) {
  return errors?.[name] ? (
    <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
  ) : null;
});

/* ===================== MAIN COMPONENT ===================== */

const SignupFormStep1 = () => {
  const navigate = useNavigate();
  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL, []);
  const mapboxToken = useMemo(() => import.meta.env.VITE_MAPBOX_TOKEN, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    division: "",
    district: "",
    location: { coordinates: [], address: "" },

    // driver-only
    licenseNumber: "",
    vehicleType: "",
    seats: "",

    referralCode: "",
    agreedToTerms: false,
  });

  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalType, setGlobalType] = useState("error"); // "error" | "success"

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const showGlobal = useCallback((msg, type = "error") => {
    setGlobalMessage(msg);
    setGlobalType(type);
  }, []);

  const clearFieldError = useCallback((key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  // Prefill referral from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) setFormData((p) => ({ ...p, referralCode: ref.toUpperCase() }));
  }, []);

  const extractAdminFromMapbox = useCallback(
    async (lon, lat) => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,region&access_token=${mapboxToken}`,
        );
        const data = await res.json();
        const features = data.features || [];
        const region = features.find((f) => f.place_type?.includes("region"));

        if (region?.text) {
          setFormData((prev) => ({ ...prev, division: region.text }));
          clearFieldError("division");
        }
      } catch (err) {
        console.warn("❌ Reverse geocoding failed", err);
      }
    },
    [mapboxToken, clearFieldError],
  );

  const handleAutoDetect = useCallback(() => {
    if (!navigator.geolocation) {
      showGlobal("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}`,
        );
        const data = await res.json();
        const address = data.features?.[0]?.place_name || "";

        setFormData((prev) => ({
          ...prev,
          location: { coordinates: [lon, lat], address },
        }));

        if (address) clearFieldError("location");
        await extractAdminFromMapbox(lon, lat);
      },
      () =>
        showGlobal("Could not access your location. Please allow permission."),
    );
  }, [mapboxToken, showGlobal, clearFieldError, extractAdminFromMapbox]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearFieldError(name);
    },
    [clearFieldError],
  );

  const handleLocationChange = useCallback(
    async (division, district) => {
      setFormData((prev) => ({
        ...prev,
        division,
        district,
      }));
      if (division) clearFieldError("division");
      if (district) clearFieldError("district");

      if (!division || !district) return;

      try {
        const q = `${district}, ${division}, Bangladesh`;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            q,
          )}.json?access_token=${mapboxToken}`,
        );
        const data = await res.json();
        const feature = data.features?.[0];

        if (feature?.center?.length === 2) {
          setFormData((prev) => ({
            ...prev,
            location: {
              coordinates: feature.center,
              address: feature.place_name,
            },
          }));
          clearFieldError("location");
        }
      } catch (err) {
        console.error("❌ Mapbox geocoding error", err);
      }
    },
    [mapboxToken, clearFieldError],
  );

  const handleMapSelect = useCallback(
    ({ coordinates, address }) => {
      setFormData((prev) => ({
        ...prev,
        location: { coordinates, address },
      }));
      clearFieldError("location");
      if (coordinates?.length === 2) {
        extractAdminFromMapbox(coordinates[0], coordinates[1]);
      }
    },
    [clearFieldError, extractAdminFromMapbox],
  );

  const validateFrontend = useCallback(() => {
    const errs = {};

    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errs.email = "Email is invalid";

    if (!phone) errs.phone = "Phone is required";

    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8)
      errs.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword)
      errs.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (!formData.division) errs.division = "Division is required";
    if (!formData.district) errs.district = "District is required";

    const coords = formData.location?.coordinates || [];
    if (!formData.location?.address || coords.length !== 2)
      errs.location = "Location is required";

    if (!formData.agreedToTerms)
      errs.agreedToTerms = "You must accept Terms & Policies";

    if (formData.role === "driver") {
      if (!formData.licenseNumber) errs.licenseNumber = "License is required";
      if (!formData.vehicleType) errs.vehicleType = "Vehicle type is required";
      if (!formData.seats) errs.seats = "Seats is required";
      else if (Number(formData.seats) < 1)
        errs.seats = "Seats must be at least 1";
    }

    return errs;
  }, [formData, phone]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFieldErrors({});
      setGlobalMessage("");

      const fe = validateFrontend();
      if (Object.keys(fe).length) {
        setFieldErrors(fe);
        showGlobal("Please fix the highlighted fields.");
        return;
      }

      setIsLoading(true);
      try {
        const role = formData.role;

        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: `+${phone}`,
          primaryRole: role,
          roles: [role],
          referralCode: formData.referralCode || "",
          agreedToTerms: formData.agreedToTerms,
          location: {
            ...formData.location,
            division: formData.division,
            district: formData.district,
          },
          ...(role === "driver"
            ? {
                driver: {
                  licenseNumber: formData.licenseNumber,
                  vehicleType: formData.vehicleType,
                  seats: Number(formData.seats),
                },
              }
            : {}),
        };

        const res = await axios.post(
          `${apiUrl}/api/auth/signup/step1`,
          payload,
        );

        localStorage.setItem("signupUserId", res.data.userId);
        localStorage.setItem("signupRole", formData.role);

        if (res.data.nextAction === "CONTINUE_STEP2") {
          navigate(
            `/signup/step2?userId=${res.data.userId}&role=${formData.role}`,
          );
          return;
        }

        if (res.data.nextAction === "VERIFY_EMAIL") {
          navigate(`/verify?email=${encodeURIComponent(formData.email)}`);
          return;
        }

        showGlobal(
          "✅ Step 1 complete! Check your email to verify.",
          "success",
        );
        navigate("/verify");
      } catch (err) {
        const data = err?.response?.data;

        if (err?.response?.status === 400 && data?.fields) {
          setFieldErrors(data.fields);
          showGlobal(data.message || "Please fix the highlighted fields.");
        } else if (data?.code === "EMAIL_DELIVERY_BLOCKED") {
          showGlobal(
            "Email delivery is restricted (SES Sandbox). Request production access to continue.",
          );
        } else {
          showGlobal(data?.message || "❌ Registration failed.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, formData, phone, navigate, showGlobal, validateFrontend],
  );

  // ---------- UI styles ----------
  const baseInput =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition";
  const focusRing = "focus:ring-4 focus:ring-teal-100 focus:border-teal-400";
  const errorRing = "border-red-500 ring-2 ring-red-100";
  const normalBorder = "border-gray-200";

  const inputClass = (name) =>
    `${baseInput} ${focusRing} ${fieldErrors?.[name] ? errorRing : normalBorder}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-teal-100 flex items-center justify-center shadow-sm">
            <span className="text-xl">🧭</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Join Reivio to book stays, become a host, or offer rides.
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Pill active>Secure signup</Pill>
            <Pill>Email verification</Pill>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-teal-100/30 overflow-hidden">
          {globalMessage && (
            <div
              className={`px-5 py-3 text-sm ${
                globalType === "success"
                  ? "bg-green-50 text-green-700 border-b border-green-100"
                  : "bg-red-50 text-red-700 border-b border-red-100"
              }`}
            >
              {globalMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Account */}
            <Section
              title="Account details"
              desc="Use your real name and a valid email. You’ll verify via email."
            >
              <div>
                <Label>Your name</Label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Hadiur Rahman"
                  className={inputClass("name")}
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                <FieldError errors={fieldErrors} name="name" />
              </div>

              <div>
                <Label>Email</Label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className={inputClass("email")}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <FieldError errors={fieldErrors} name="email" />
              </div>

              <div>
                <Label>Phone (Bangladesh)</Label>
                <div
                  className={`rounded-xl border px-2 py-2 ${
                    fieldErrors.phone
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-gray-200"
                  } focus-within:ring-4 focus-within:ring-teal-100 focus-within:border-teal-400 transition`}
                >
                  <PhoneInput
                    country={"bd"}
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      clearFieldError("phone");
                    }}
                    inputProps={{ name: "phone", autoComplete: "tel" }}
                    inputClass="!w-full !border-0 !shadow-none !text-sm !py-2 !outline-none"
                    buttonClass="!border-0 !shadow-none"
                    containerClass="!w-full"
                  />
                </div>
                <FieldError errors={fieldErrors} name="phone" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      placeholder="Minimum 8 characters"
                      className={inputClass("password")}
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <FieldError errors={fieldErrors} name="password" />
                </div>

                <div>
                  <Label>Confirm password</Label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-type password"
                      className={inputClass("confirmPassword")}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                    >
                      {showConfirmPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <FieldError errors={fieldErrors} name="confirmPassword" />
                </div>
              </div>

              <div>
                <Label>Referral code (optional)</Label>
                <input
                  type="text"
                  name="referralCode"
                  placeholder="e.g. HAD1A2"
                  className={inputClass("referralCode")}
                  value={formData.referralCode || ""}
                  onChange={handleChange}
                />
                <FieldError errors={fieldErrors} name="referralCode" />
              </div>
            </Section>

            {/* Role */}
            <Section
              title="Choose your role"
              desc="You can switch roles later if you have access."
            >
              <div>
                <Label>Role</Label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== "driver") {
                      clearFieldError("licenseNumber");
                      clearFieldError("vehicleType");
                      clearFieldError("seats");
                    }
                  }}
                  className={inputClass("role")}
                >
                  <option value="user">User (Book stays)</option>
                  <option value="host">Host (List stays)</option>
                  <option value="driver">Driver (Offer rides)</option>
                </select>
                <FieldError errors={fieldErrors} name="role" />
              </div>

              {formData.role === "driver" && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span>🚗</span>
                    <span>Driver details</span>
                    <span className="ml-auto text-xs text-gray-500">
                      Required for drivers
                    </span>
                  </div>

                  <div>
                    <Label>Driving license number</Label>
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="Enter license number"
                      className={inputClass("licenseNumber")}
                      value={formData.licenseNumber}
                      onChange={handleChange}
                    />
                    <FieldError errors={fieldErrors} name="licenseNumber" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Vehicle type</Label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className={inputClass("vehicleType")}
                      >
                        <option value="">Select vehicle</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                      </select>
                      <FieldError errors={fieldErrors} name="vehicleType" />
                    </div>

                    <div>
                      <Label>Seats offered</Label>
                      <input
                        type="number"
                        name="seats"
                        placeholder="e.g. 3"
                        className={inputClass("seats")}
                        value={formData.seats}
                        onChange={handleChange}
                      />
                      <FieldError errors={fieldErrors} name="seats" />
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Location */}
            <Section
              title="Your location"
              desc="Pick division & district, then confirm an exact location on map."
            >
              <div>
                <Label>Division & District</Label>
                <LocationSelector
                  value={{
                    division: formData.division,
                    district: formData.district,
                  }}
                  onChange={handleLocationChange}
                />
                <div className="mt-1">
                  <FieldError errors={fieldErrors} name="division" />
                  <FieldError errors={fieldErrors} name="district" />
                </div>
              </div>

              <div>
                <Label>Search your location</Label>
                <MapboxAutocomplete onSelectLocation={handleMapSelect} />
                <FieldError errors={fieldErrors} name="location" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                >
                  📍 Use my current location
                </button>

                {formData.location.address ? (
                  <span className="text-xs text-gray-600 text-right">
                    ✅ Selected
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 text-right">
                    No location selected
                  </span>
                )}
              </div>

              {formData.location.address && (
                <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                  <div className="font-semibold">📍 Selected location</div>
                  <div className="text-xs mt-1">
                    {formData.location.address}
                  </div>
                </div>
              )}
            </Section>

            {/* Terms */}
            <Section
              title="Terms & policies"
              desc="You must accept the policies to create your account."
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className={`mt-1 h-4 w-4 rounded border-gray-300 ${
                    fieldErrors.agreedToTerms ? "ring-2 ring-red-200" : ""
                  }`}
                  checked={formData.agreedToTerms}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      agreedToTerms: e.target.checked,
                    }));
                    clearFieldError("agreedToTerms");
                  }}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-teal-700 font-semibold hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                  ,{" "}
                  <Link
                    to="/privacy"
                    className="text-teal-700 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/refund-policy"
                    className="text-teal-700 font-semibold hover:underline"
                  >
                    Refund Policy
                  </Link>
                  .
                </label>
              </div>
              <FieldError errors={fieldErrors} name="agreedToTerms" />
            </Section>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-lg transition ${
                  isLoading
                    ? "bg-teal-300 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
                }`}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
              <p className="mt-3 text-center text-xs text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing you agree to Reivio’s policies and verification process.
        </p>
      </div>
    </div>
  );
};

export default SignupFormStep1;
